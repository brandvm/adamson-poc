<?php
/**
 * Plugin Name: Adamson Headless
 * Description: Block contract, site settings, REST API, draft preview and publish refresh for the Next.js front end.
 * Version: 0.1.0
 */

defined( 'ABSPATH' ) || exit;

define( 'ADAMSON_DIR', __DIR__ );
if ( file_exists( __DIR__ . '/config.local.php' ) ) {
	require __DIR__ . '/config.local.php';
}
defined( 'ADAMSON_WWW_URL' ) || define( 'ADAMSON_WWW_URL', 'http://localhost:3000' );
defined( 'ADAMSON_PREVIEW_URL' ) || define( 'ADAMSON_PREVIEW_URL', 'http://localhost:3001' );
defined( 'ADAMSON_PREVIEW_SECRET' ) || define( 'ADAMSON_PREVIEW_SECRET', 'change-me-preview' );
defined( 'ADAMSON_REVALIDATE_SECRET' ) || define( 'ADAMSON_REVALIDATE_SECRET', 'change-me-revalidate' );

/* -------------------------------------------------------------------------
 * Network access (ADAMSON_LAN_MODE, local only): answer on whatever address WordPress is opened with
 * (localhost on this machine, the LAN IP from a teammate's machine), and point
 * browser-facing links to the Next.js apps on that same host.
 * Server-to-server calls (publish refresh) keep using ADAMSON_WWW_URL.
 * ---------------------------------------------------------------------- */

function adamson_request_host() {
	$host = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( $_SERVER['HTTP_HOST'] ) : '';
	return preg_match( '/^[a-z0-9.\-]+(:\d+)?$/', $host ) ? $host : '';
}

defined( 'ADAMSON_LAN_MODE' ) || define( 'ADAMSON_LAN_MODE', false ); // set in config.local.php for local network use

foreach ( ADAMSON_LAN_MODE ? array( 'option_home', 'option_siteurl' ) : array() as $adamson_filter ) {
	add_filter( $adamson_filter, function ( $value ) {
		$host = adamson_request_host();
		return $host ? 'http://' . $host : $value;
	}, 99 );
}

/** A Next.js app URL (e.g. http://localhost:3001) rewritten to the host the browser used. */
function adamson_browser_url( $url ) {
	if ( ! ADAMSON_LAN_MODE ) {
		return $url;
	}
	$host = adamson_request_host();
	if ( ! $host ) {
		return $url;
	}
	$hostname = preg_replace( '/:\d+$/', '', $host );
	$port     = parse_url( $url, PHP_URL_PORT );
	return 'http://' . $hostname . ( $port ? ':' . $port : '' );
}

/* -------------------------------------------------------------------------
 * Contract: one JSON file per block, plus settings.json
 * ---------------------------------------------------------------------- */

function adamson_blocks() {
	static $blocks = null;
	if ( null === $blocks ) {
		$blocks = array();
		$files  = glob( ADAMSON_DIR . '/contract/blocks/*.json' );
		sort( $files );
		foreach ( $files as $file ) {
			$def = json_decode( file_get_contents( $file ), true );
			if ( is_array( $def ) && ! empty( $def['name'] ) ) {
				$blocks[ $def['name'] ] = $def;
			}
		}
	}
	return $blocks;
}

/** Site settings fields: contract/settings*.json, merged in filename order. */
function adamson_settings_contract() {
	$fields = array();
	$files  = glob( ADAMSON_DIR . '/contract/settings*.json' );
	sort( $files );
	foreach ( $files as $file ) {
		$def = json_decode( file_get_contents( $file ), true );
		if ( is_array( $def ) && ! empty( $def['fields'] ) ) {
			$fields = array_merge( $fields, $def['fields'] );
		}
	}
	return array( 'fields' => $fields );
}

// Keep uploads as they are: WordPress's automatic "-scaled" copy of images over
// 2560px can drop PNG transparency (cut-outs turn into solid rectangles).
add_filter( 'big_image_size_threshold', '__return_false' );

// SVG logos: allowed for administrators (and the seed). WordPress blocks SVG
// by default because an SVG can contain script; only trusted users get this.
add_filter( 'upload_mimes', function ( $mimes ) {
	if ( current_user_can( 'manage_options' ) || defined( 'ADAMSON_SEEDING' ) ) {
		$mimes['svg'] = 'image/svg+xml';
	}
	return $mimes;
} );

/* -------------------------------------------------------------------------
 * Blocks: registered from the contract. Content lives in one `data` attribute.
 * Pages may only use Adamson section blocks (editors can't break the design).
 * ---------------------------------------------------------------------- */

add_action( 'init', function () {
	foreach ( adamson_blocks() as $name => $def ) {
		register_block_type( $name, array(
			'api_version'     => 3,
			'title'           => $def['title'],
			'category'        => 'adamson',
			'attributes'      => array( 'data' => array( 'type' => 'object', 'default' => array() ) ),
			'render_callback' => '__return_empty_string',
		) );
	}
} );

add_filter( 'block_categories_all', function ( $cats ) {
	array_unshift( $cats, array( 'slug' => 'adamson', 'title' => 'Adamson sections' ) );
	return $cats;
} );

add_filter( 'allowed_block_types_all', function ( $allowed, $context ) {
	if ( isset( $context->post ) && 'page' === $context->post->post_type ) {
		return array_keys( adamson_blocks() );
	}
	return $allowed;
}, 10, 2 );

/* -------------------------------------------------------------------------
 * Editor assets
 * ---------------------------------------------------------------------- */

function adamson_asset_version( $file ) {
	return (string) filemtime( ADAMSON_DIR . '/' . $file );
}

function adamson_register_field_assets() {
	wp_register_script( 'adamson-fields', plugins_url( 'assets/fields.js', __FILE__ ), array( 'wp-element', 'wp-components', 'wp-api-fetch' ), adamson_asset_version( 'assets/fields.js' ), true );
	wp_register_style( 'adamson-admin', plugins_url( 'assets/admin.css', __FILE__ ), array( 'wp-components' ), adamson_asset_version( 'assets/admin.css' ) );
}

add_action( 'enqueue_block_editor_assets', function () {
	adamson_register_field_assets();
	wp_enqueue_media();
	wp_enqueue_script( 'adamson-editor', plugins_url( 'assets/editor.js', __FILE__ ), array( 'adamson-fields', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-data' ), adamson_asset_version( 'assets/editor.js' ), true );
	wp_add_inline_script( 'adamson-editor', 'window.ADAMSON = ' . wp_json_encode( array(
		'blocks'        => array_values( adamson_blocks() ),
		'previewOrigin' => adamson_browser_url( ADAMSON_PREVIEW_URL ),
	) ) . ';', 'before' );
	wp_enqueue_style( 'adamson-admin' );
} );

// The editor canvas is an iframe: block styles must be loaded inside it too.
add_action( 'enqueue_block_assets', function () {
	if ( is_admin() ) {
		wp_enqueue_style( 'adamson-canvas', plugins_url( 'assets/admin.css', __FILE__ ), array(), adamson_asset_version( 'assets/admin.css' ) );
	}
} );

/* -------------------------------------------------------------------------
 * Site settings page (header, footer, global text) built from the same fields
 * ---------------------------------------------------------------------- */

add_action( 'admin_menu', function () {
	add_menu_page( 'Site settings', 'Site settings', 'manage_options', 'adamson-settings', function () {
		echo '<div class="wrap"><h1>Site settings</h1><p>Header, footer and text used across the whole site.</p><div id="adamson-settings"></div></div>';
	}, 'dashicons-admin-site-alt3', 3 );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( 'toplevel_page_adamson-settings' !== $hook ) {
		return;
	}
	adamson_register_field_assets();
	wp_enqueue_media();
	wp_enqueue_script( 'adamson-settings', plugins_url( 'assets/settings.js', __FILE__ ), array( 'adamson-fields', 'wp-api-fetch', 'wp-element', 'wp-components' ), adamson_asset_version( 'assets/settings.js' ), true );
	wp_add_inline_script( 'adamson-settings', 'window.ADAMSON_SETTINGS = ' . wp_json_encode( array(
		'fields' => adamson_settings_contract()['fields'],
	) ) . ';', 'before' );
	wp_enqueue_style( 'adamson-admin' );
} );

/* -------------------------------------------------------------------------
 * REST API for the Next.js front end
 * ---------------------------------------------------------------------- */

/** The page's path on the Next.js site: / for the homepage, /<slug> otherwise. */
function adamson_page_path( WP_Post $post ) {
	if ( (int) get_option( 'page_on_front' ) === (int) $post->ID ) {
		return '/';
	}
	$uri = get_page_uri( $post ); // includes parent pages: company/history
	return '/' . ( $uri ? $uri : sanitize_title( $post->post_title ) );
}

function adamson_page_payload( WP_Post $post, $use_autosave = false ) {
	$content = $post->post_content;
	$title   = $post->post_title;
	if ( $use_autosave ) {
		$autosave = wp_get_post_autosave( $post->ID );
		if ( $autosave && strtotime( $autosave->post_modified_gmt ) >= strtotime( $post->post_modified_gmt ) ) {
			$content = $autosave->post_content;
			$title   = $autosave->post_title;
		}
	}
	$known  = adamson_blocks();
	$blocks = array();
	foreach ( parse_blocks( $content ) as $i => $block ) {
		if ( empty( $block['blockName'] ) || ! isset( $known[ $block['blockName'] ] ) ) {
			continue;
		}
		$blocks[] = array(
			'id'   => $block['blockName'] . '-' . $i,
			'name' => $block['blockName'],
			'data' => isset( $block['attrs']['data'] ) ? $block['attrs']['data'] : (object) array(),
		);
	}
	return array(
		'id'       => $post->ID,
		'slug'     => $post->post_name,
		'path'     => adamson_page_path( $post ),
		'title'    => $title,
		'status'   => $post->post_status,
		'modified' => $post->post_modified_gmt,
		'blocks'   => $blocks,
	);
}

function adamson_verify_preview( WP_REST_Request $req ) {
	$secret = $req->get_header( 'x-adamson-preview' );
	return is_string( $secret ) && hash_equals( ADAMSON_PREVIEW_SECRET, $secret );
}

/** WordPress text as plain text: the front end escapes it itself (no &amp;amp;). */
function adamson_plain( $text ) {
	return html_entity_decode( (string) $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'adamson/v1', '/page', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$preview = (bool) $req->get_param( 'preview' );
			if ( $preview && ! adamson_verify_preview( $req ) ) {
				return new WP_Error( 'forbidden', 'Preview needs the preview secret.', array( 'status' => 401 ) );
			}
			$id = (int) $req->get_param( 'id' );
			if ( $id ) {
				$post = get_post( $id );
			} else {
				// path= nested page path (company/history); slug= kept for old callers
				$path = trim( (string) ( $req->get_param( 'path' ) ?: $req->get_param( 'slug' ) ?: 'home' ), '/' );
				$path = implode( '/', array_map( 'sanitize_title', explode( '/', $path ) ) );
				$post = 'home' === $path && get_option( 'page_on_front' ) ? get_post( (int) get_option( 'page_on_front' ) ) : get_page_by_path( $path );
			}
			if ( ! $post || 'page' !== $post->post_type ) {
				return new WP_Error( 'not_found', 'Page not found.', array( 'status' => 404 ) );
			}
			if ( 'publish' !== $post->post_status && ! $preview ) {
				return new WP_Error( 'not_found', 'Page not found.', array( 'status' => 404 ) );
			}
			return adamson_page_payload( $post, $preview );
		},
	) );

	register_rest_route( 'adamson/v1', '/settings', array(
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'callback'            => function () {
				return (object) get_option( 'adamson_settings', array() );
			},
		),
		array(
			'methods'             => 'POST',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'callback'            => function ( WP_REST_Request $req ) {
				$data = $req->get_json_params();
				update_option( 'adamson_settings', is_array( $data ) ? $data : array() );
				adamson_trigger_revalidate( 'settings' );
				return (object) get_option( 'adamson_settings', array() );
			},
		),
	) );

	register_rest_route( 'adamson/v1', '/posts', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			// ?slug=x → that post with its full content (news article page); else the latest ?count= (max 50)
			$slug  = sanitize_title( (string) $req->get_param( 'slug' ) );
			$count = max( 1, min( 50, (int) ( $req->get_param( 'count' ) ?: 3 ) ) );
			$args  = array( 'post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => $count );
			if ( $slug ) {
				$args = array( 'post_type' => 'post', 'post_status' => 'publish', 'name' => $slug, 'posts_per_page' => 1 );
			}
			$query = new WP_Query( $args );
			$out   = array();
			foreach ( $query->posts as $p ) {
				$thumb = get_post_thumbnail_id( $p );
				$cats  = get_the_category( $p->ID );
				$out[] = array(
					'id'       => $p->ID,
					'title'    => adamson_plain( get_the_title( $p ) ),
					'excerpt'  => adamson_plain( wp_strip_all_tags( get_the_excerpt( $p ) ) ),
					'date'     => get_the_date( 'M j, Y', $p ),
					'slug'     => $p->post_name,
					'category' => $cats ? $cats[0]->name : '',
					'type'     => ( $tags = get_the_tags( $p->ID ) ) ? $tags[0]->name : '',
					'image'    => $thumb ? array(
						'id'  => $thumb,
						'url' => wp_get_attachment_image_url( $thumb, 'large' ),
						'alt' => get_post_meta( $thumb, '_wp_attachment_image_alt', true ),
					) : null,
				);
				if ( $slug ) {
					$out[0]['content'] = apply_filters( 'the_content', $p->post_content );
					$out[0]['dateIso'] = get_the_date( 'c', $p );
				}
			}
			if ( $slug ) {
				return $out ? $out[0] : new WP_Error( 'not_found', 'Post not found.', array( 'status' => 404 ) );
			}
			return $out;
		},
	) );
} );

/* -------------------------------------------------------------------------
 * Preview: WordPress's Preview button opens the preview app with a signed link.
 * Only the preview app knows the secret, so www can never show drafts.
 * ---------------------------------------------------------------------- */

function adamson_preview_url( $post_id ) {
	$expires = time() + 3600;
	$token   = hash_hmac( 'sha256', $post_id . '|' . $expires, ADAMSON_PREVIEW_SECRET );
	return add_query_arg( array( 'id' => $post_id, 'expires' => $expires, 'token' => $token ), adamson_browser_url( ADAMSON_PREVIEW_URL ) . '/api/preview' );
}

add_filter( 'preview_post_link', function ( $link, $post ) {
	return 'page' === $post->post_type ? adamson_preview_url( $post->ID ) : $link;
}, 10, 2 );

add_filter( 'page_link', function ( $link, $post_id ) {
	$post = get_post( $post_id );
	return $post ? adamson_browser_url( ADAMSON_WWW_URL ) . adamson_page_path( $post ) : $link;
}, 10, 2 );

/* -------------------------------------------------------------------------
 * Publish refresh: tell www to refresh its cached content.
 * ---------------------------------------------------------------------- */

function adamson_trigger_revalidate( $reason ) {
	wp_remote_post( ADAMSON_WWW_URL . '/api/revalidate', array(
		'timeout' => 5,
		'headers' => array( 'content-type' => 'application/json', 'x-adamson-revalidate' => ADAMSON_REVALIDATE_SECRET ),
		'body'    => wp_json_encode( array( 'reason' => $reason ) ),
	) );
}

add_action( 'transition_post_status', function ( $new, $old, $post ) {
	if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
		return;
	}
	if ( ! in_array( $post->post_type, array( 'page', 'post' ), true ) ) {
		return;
	}
	if ( 'publish' === $new || 'publish' === $old ) {
		adamson_trigger_revalidate( $post->post_type . ':' . $post->ID );
	}
}, 10, 3 );

add_action( 'post_updated', function ( $id, $after ) {
	if ( 'publish' === $after->post_status && in_array( $after->post_type, array( 'page', 'post' ), true ) && ! wp_is_post_revision( $id ) ) {
		adamson_trigger_revalidate( $after->post_type . ':' . $id );
	}
}, 10, 2 );

/* -------------------------------------------------------------------------
 * Headless: WordPress has no public front end. Any front-end visit goes to the
 * Next.js apps: previews (?preview=true) to the preview app with a signed link,
 * everything else to the live site.
 * ---------------------------------------------------------------------- */
add_action( 'template_redirect', function () {
	if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}
	if ( isset( $_GET['preview'] ) ) {
		$id = 0;
		foreach ( array( 'preview_id', 'page_id', 'p' ) as $key ) {
			if ( ! empty( $_GET[ $key ] ) ) {
				$id = (int) $_GET[ $key ];
				break;
			}
		}
		if ( ! $id ) {
			$id = (int) get_queried_object_id();
		}
		if ( $id && current_user_can( 'edit_post', $id ) ) {
			wp_redirect( adamson_preview_url( $id ) );
			exit;
		}
	}
	// Same path on the live site (e.g. /products/ → /products).
	$path = '/' . trim( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH ), '/' );
	wp_redirect( adamson_browser_url( ADAMSON_WWW_URL ) . ( '/' === $path ? '/' : $path ) );
	exit;
} );

require_once __DIR__ . '/products.php';
require_once __DIR__ . '/documents.php';
require_once __DIR__ . '/projects.php';

/* Seeding helper */
require_once __DIR__ . '/seed.php';
