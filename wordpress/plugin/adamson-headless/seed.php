<?php
/**
 * Seeds the site from /seed (mounted from wordpress/seed):
 *   seed/assets/**          images and videos, imported into the media library
 *   seed/settings*.json     Site settings (header, footer, global text), merged
 *   seed/posts.json         News posts
 *   seed/documents.json      Documents (title + contract/document.json fields)
 *   seed/products.json      Products (updated by slug); blocks refer to them as {"seedProduct": "Name"}
 *   seed/content/*.json     Homepage sections, in filename order: {"block": "...", "data": {...}}
 *   seed/pages/<slug>/*.json Other pages (e.g. products), same format; the page gets that slug.
 *                            Child pages use "__" between levels: company__history = /company/history
 *                            (parents are created first). Optional _page.json: { "title": "...", "order": 1 }
 * Any {"seed": "path/in/assets.png", "alt": "..."} value becomes a media library item.
 *
 * Run: POST /wp-json/adamson/v1/seed with header x-adamson-seed: <ADAMSON_REVALIDATE_SECRET>
 */

defined( 'ABSPATH' ) || exit;

/** Seed files: mounted at /seed locally (Playground), or shipped inside the plugin on a host. */
function adamson_seed_dir() {
	return is_dir( '/seed' ) ? '/seed' : ADAMSON_DIR . '/seed';
}

function adamson_seed_media( $rel, $alt, $base ) {
	$map = get_option( 'adamson_seed_media', array() );
	// Reuse an earlier upload only if that ID is still an image with a file
	// (IDs can end up belonging to other posts, e.g. products).
	if ( isset( $map[ $rel ] ) && 'attachment' === get_post_type( $map[ $rel ] ) && wp_get_attachment_url( $map[ $rel ] ) ) {
		$id = $map[ $rel ];
	} else {
		$src = $base . '/assets/' . $rel;
		if ( ! file_exists( $src ) ) {
			return null;
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$tmp = wp_tempnam( basename( $rel ) );
		copy( $src, $tmp );
		$id = media_handle_sideload( array( 'name' => basename( $rel ), 'tmp_name' => $tmp ), 0 );
		if ( is_wp_error( $id ) ) {
			return null;
		}
		$map[ $rel ] = $id;
		update_option( 'adamson_seed_media', $map, false );
	}
	if ( $alt ) {
		update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	}
	$meta = wp_get_attachment_metadata( $id );
	return array(
		'id'     => $id,
		'url'    => wp_get_attachment_url( $id ),
		'alt'    => $alt ? $alt : '',
		'width'  => isset( $meta['width'] ) ? $meta['width'] : null,
		'height' => isset( $meta['height'] ) ? $meta['height'] : null,
		'mime'   => get_post_mime_type( $id ),
	);
}

function adamson_seed_resolve( $value, $base ) {
	if ( is_array( $value ) ) {
		if ( isset( $value['seedProduct'] ) && is_string( $value['seedProduct'] ) ) {
			$product = get_page_by_path( sanitize_title( $value['seedProduct'] ), OBJECT, 'product' );
			return $product ? $product->ID : null;
		}
		if ( isset( $value['seed'] ) && is_string( $value['seed'] ) ) {
			return adamson_seed_media( $value['seed'], isset( $value['alt'] ) ? $value['alt'] : '', $base );
		}
		foreach ( $value as $k => $v ) {
			$value[ $k ] = adamson_seed_resolve( $v, $base );
		}
	}
	return $value;
}

function adamson_seed_json( $file ) {
	if ( ! file_exists( $file ) ) {
		return null;
	}
	return json_decode( file_get_contents( $file ), true );
}

/** Block markup for a list of section files ({"block": "...", "data": {...}}), in filename order. */
function adamson_seed_blocks( $files, $base ) {
	sort( $files );
	$html = '';
	foreach ( $files as $file ) {
		$section = adamson_seed_json( $file );
		if ( ! $section || empty( $section['block'] ) ) {
			continue;
		}
		$html .= serialize_block( array(
			'blockName'    => $section['block'],
			'attrs'        => array( 'data' => adamson_seed_resolve( isset( $section['data'] ) ? $section['data'] : array(), $base ) ),
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		) ) . "\n\n";
	}
	return $html;
}

function adamson_seed( $base = '/seed' ) {
	defined( 'ADAMSON_SEEDING' ) || define( 'ADAMSON_SEEDING', true );
	// Seed content is trusted: skip the HTML filter, which escapes & inside block data.
	kses_remove_filters();
	$log = array();

	// Settings
	$settings = array();
	$sfiles   = glob( $base . '/settings*.json' );
	sort( $sfiles );
	foreach ( $sfiles as $sfile ) {
		$part = adamson_seed_json( $sfile );
		if ( is_array( $part ) ) {
			$settings = array_merge( $settings, $part );
		}
	}
	if ( $settings ) {
		update_option( 'adamson_settings', adamson_seed_resolve( $settings, $base ) );
		$log[] = 'settings';
	}

	// News posts
	$posts = adamson_seed_json( $base . '/posts.json' );
	if ( is_array( $posts ) ) {
		foreach ( get_posts( array( 'post_type' => 'post', 'numberposts' => -1, 'post_status' => 'any' ) ) as $old ) {
			wp_delete_post( $old->ID, true );
		}
		foreach ( array_reverse( $posts ) as $i => $p ) {
			$cat_id = 0;
			if ( ! empty( $p['category'] ) ) {
				$term   = term_exists( $p['category'], 'category' ) ?: wp_insert_term( $p['category'], 'category' );
				$cat_id = is_array( $term ) ? (int) $term['term_id'] : (int) $term;
			}
			$id = wp_insert_post( array(
				'post_type'     => 'post',
				'post_status'   => 'publish',
				'post_title'    => $p['title'],
				'post_excerpt'  => isset( $p['excerpt'] ) ? $p['excerpt'] : '',
				'post_content'  => isset( $p['content'] ) ? $p['content'] : ( isset( $p['excerpt'] ) ? $p['excerpt'] : '' ),
				'post_date'     => isset( $p['date'] ) ? $p['date'] : gmdate( 'Y-m-d H:i:s', time() - $i * DAY_IN_SECONDS ),
				'post_category' => $cat_id ? array( $cat_id ) : array(),
				'tags_input'    => isset( $p['type'] ) ? array( $p['type'] ) : array(), // news type: Press release, Launch, Tour
			) );
			if ( ! empty( $p['image'] ) ) {
				$img = adamson_seed_resolve( $p['image'], $base );
				if ( $img ) {
					set_post_thumbnail( $id, $img['id'] );
				}
			}
		}
		$log[] = count( $posts ) . ' posts';
	}

	// Products (updated by slug, so their IDs stay stable for blocks that point to them)
	$products = adamson_seed_json( $base . '/products.json' );
	if ( is_array( $products ) ) {
		foreach ( $products as $i => $p ) {
			$slug     = sanitize_title( $p['name'] );
			$existing = get_page_by_path( $slug, OBJECT, 'product' );
			$post     = array(
				'post_type'   => 'product',
				'post_status' => 'publish',
				'post_title'  => $p['name'],
				'post_name'   => $slug,
				'menu_order'  => isset( $p['order'] ) ? (int) $p['order'] : $i,
			);
			if ( $existing ) {
				$post['ID'] = $existing->ID;
			}
			$id   = $existing ? wp_update_post( $post ) : wp_insert_post( $post );
			$data = $p;
			unset( $data['name'], $data['order'] );
			update_post_meta( $id, 'adamson_product', adamson_seed_resolve( $data, $base ) );
		}
		$log[] = count( $products ) . ' products';
	}

	// Projects / case studies (updated by slug), like products
	$projects = adamson_seed_json( $base . '/projects.json' );
	if ( is_array( $projects ) ) {
		foreach ( $projects as $i => $p ) {
			$slug     = sanitize_title( $p['name'] );
			$existing = get_page_by_path( $slug, OBJECT, 'project' );
			$post     = array( 'post_type' => 'project', 'post_status' => 'publish', 'post_title' => $p['name'], 'post_name' => $slug, 'menu_order' => $i );
			if ( $existing ) {
				$post['ID'] = $existing->ID;
			}
			$id   = $existing ? wp_update_post( $post ) : wp_insert_post( $post );
			$data = $p;
			unset( $data['name'] );
			update_post_meta( $id, 'adamson_project', adamson_seed_resolve( $data, $base ) );
		}
		$log[] = count( $projects ) . ' projects';
	}

	// Documents (Support → Documentation & Downloads), updated by slug
	$documents = adamson_seed_json( $base . '/documents.json' );
	if ( is_array( $documents ) ) {
		foreach ( $documents as $d ) {
			$slug     = sanitize_title( $d['title'] );
			$existing = get_page_by_path( $slug, OBJECT, 'document' );
			$post     = array( 'post_type' => 'document', 'post_status' => 'publish', 'post_title' => $d['title'], 'post_name' => $slug );
			if ( $existing ) {
				$post['ID'] = $existing->ID;
			}
			$id   = $existing ? wp_update_post( $post ) : wp_insert_post( $post );
			$data = $d;
			unset( $data['title'] );
			update_post_meta( $id, 'adamson_document', $data );
		}
		$log[] = count( $documents ) . ' documents';
	}

	// Homepage
	$files = glob( $base . '/content/*.json' );
	$html  = adamson_seed_blocks( $files, $base );
	$home_id = (int) get_option( 'page_on_front' );
	$page    = array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Home', 'post_name' => 'home', 'post_content' => $html );
	if ( $home_id && get_post( $home_id ) ) {
		$page['ID'] = $home_id;
		wp_update_post( wp_slash( $page ) );
	} else {
		$home_id = wp_insert_post( wp_slash( $page ) );
	}
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $home_id );
	$log[] = 'home page with ' . count( $files ) . ' sections';

	// Other pages: seed/pages/<slug>/*.json (updated by slug, so IDs stay stable)
	$dirs = glob( $base . '/pages/*', GLOB_ONLYDIR );
	usort( $dirs, function ( $a, $b ) { return substr_count( basename( $a ), '__' ) - substr_count( basename( $b ), '__' ); } );
	foreach ( $dirs as $dir ) {
		$parts  = explode( '__', basename( $dir ) );
		$slug   = end( $parts );
		$parent = 0;
		for ( $i = 0; $i < count( $parts ) - 1; $i++ ) {
			$pp = get_page_by_path( implode( '/', array_slice( $parts, 0, $i + 1 ) ) );
			if ( ! $pp ) {
				$pid = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => ucwords( str_replace( '-', ' ', $parts[ $i ] ) ), 'post_name' => $parts[ $i ], 'post_parent' => $parent ) );
				$pp  = get_post( $pid );
			}
			$parent = $pp->ID;
		}
		$meta   = is_file( $dir . '/_page.json' ) ? json_decode( file_get_contents( $dir . '/_page.json' ), true ) : array();
		$pfiles = array_values( array_filter( glob( $dir . '/*.json' ), function ( $f ) { return '_page.json' !== basename( $f ); } ) );
		$p      = array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => isset( $meta['title'] ) ? $meta['title'] : ucwords( str_replace( '-', ' ', $slug ) ),
			'post_name'    => $slug,
			'post_parent'  => $parent,
			'menu_order'   => isset( $meta['order'] ) ? (int) $meta['order'] : 0,
			'post_content' => adamson_seed_blocks( $pfiles, $base ),
		);
		$existing = get_page_by_path( implode( '/', $parts ) );
		if ( $existing ) {
			$p['ID'] = $existing->ID;
			wp_update_post( wp_slash( $p ) );
		} else {
			wp_insert_post( wp_slash( $p ) );
		}
		$log[] = implode( '/', $parts ) . ' page with ' . count( $pfiles ) . ' sections';
	}

	// Local test admin (credentials live in config.local.php only)
	if ( defined( 'ADAMSON_ADMIN_USER' ) && defined( 'ADAMSON_ADMIN_PASSWORD' ) ) {
		$user = get_user_by( 'login', ADAMSON_ADMIN_USER );
		if ( ! $user ) {
			$uid = wp_insert_user( array( 'user_login' => ADAMSON_ADMIN_USER, 'user_pass' => ADAMSON_ADMIN_PASSWORD, 'user_email' => 'admin@adamson.test', 'role' => 'administrator', 'display_name' => 'Adamson Admin' ) );
		} elseif ( ! wp_check_password( ADAMSON_ADMIN_PASSWORD, $user->user_pass, $user->ID ) ) {
			wp_set_password( ADAMSON_ADMIN_PASSWORD, $user->ID ); // only when changed: resetting logs everyone out
		}
		// Earlier versions used an "adamson-admin" account: remove it, keeping its content.
		$old = get_user_by( 'login', 'adamson-admin' );
		$new = get_user_by( 'login', ADAMSON_ADMIN_USER );
		if ( $old && $new && $old->ID !== $new->ID ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
			wp_delete_user( $old->ID, $new->ID );
		}
		$log[] = 'test admin';
	}

	// Tidy defaults
	foreach ( array( 'sample-page', 'privacy-policy', 'company/test' ) as $slug ) {
		$p = get_page_by_path( $slug );
		if ( $p ) {
			wp_delete_post( $p->ID, true );
		}
	}
	update_option( 'blogname', 'Adamson' );
	update_option( 'permalink_structure', '/%postname%/' );
	update_option( 'adamson_seeded', time() );
	adamson_trigger_revalidate( 'seed' );
	return $log;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'adamson/v1', '/seed', array(
		'methods'             => 'POST',
		'permission_callback' => function ( WP_REST_Request $req ) {
			$secret = $req->get_header( 'x-adamson-seed' );
			return current_user_can( 'manage_options' ) || ( is_string( $secret ) && hash_equals( ADAMSON_REVALIDATE_SECRET, $secret ) );
		},
		'callback'            => function () {
			return array( 'seeded' => adamson_seed( adamson_seed_dir() ) );
		},
	) );
} );

/**
 * Upload one seed media file to a hosted copy (InstaWP): the plugin zip ships without
 * media so it stays small; files are then sent here one by one, then /seed runs.
 * POST /wp-json/adamson/v1/seed-asset?path=hero/hero-speaker.png, raw file body,
 * header x-adamson-seed: <ADAMSON_REVALIDATE_SECRET>. Only writes inside seed/assets.
 */
add_action( 'rest_api_init', function () {
	register_rest_route( 'adamson/v1', '/seed-asset', array(
		'methods'             => 'POST',
		'permission_callback' => function ( WP_REST_Request $req ) {
			$secret = $req->get_header( 'x-adamson-seed' );
			return is_string( $secret ) && hash_equals( ADAMSON_REVALIDATE_SECRET, $secret ) && 'change-me-revalidate' !== ADAMSON_REVALIDATE_SECRET;
		},
		'callback'            => function ( WP_REST_Request $req ) {
			$rel = (string) $req->get_param( 'path' );
			if ( ! preg_match( '#^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_.-]+)+$#', $rel ) || false !== strpos( $rel, '..' ) ) {
				return new WP_Error( 'bad_path', 'Invalid path.', array( 'status' => 400 ) );
			}
			$dest = ADAMSON_DIR . '/seed/assets/' . $rel;
			wp_mkdir_p( dirname( $dest ) );
			$bytes = file_put_contents( $dest, $req->get_body() );
			return array( 'path' => $rel, 'bytes' => $bytes );
		},
	) );
} );
