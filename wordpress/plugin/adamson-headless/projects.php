<?php
/**
 * Projects (case studies): one record per project, listed on Applications >
 * Projects with filters, shown on application pages, and rendered as a case
 * study at /applications/projects/<slug>. Fields: contract/project.json, edited
 * with the same field UI as products (assets/product.js reads ADAMSON_PRODUCT).
 */

defined( 'ABSPATH' ) || exit;

function adamson_project_contract() {
	$def = json_decode( file_get_contents( ADAMSON_DIR . '/contract/project.json' ), true );
	return is_array( $def ) ? $def : array( 'fields' => array() );
}

add_action( 'init', function () {
	register_post_type( 'project', array(
		'labels'       => array(
			'name'          => 'Projects',
			'singular_name' => 'Project',
			'add_new_item'  => 'Add project',
			'edit_item'     => 'Edit project',
			'all_items'     => 'All projects',
		),
		'public'       => false,
		'show_ui'      => true,
		'show_in_menu' => true,
		'menu_icon'    => 'dashicons-location-alt',
		'menu_position' => 5,
		'supports'     => array( 'title', 'page-attributes' ),
		'hierarchical' => false,
	) );
} );

// A plain screen (title + case study fields), not the block editor.
add_filter( 'use_block_editor_for_post_type', function ( $use, $type ) {
	return 'project' === $type ? false : $use;
}, 10, 2 );

function adamson_project_data( $post_id ) {
	$data = get_post_meta( $post_id, 'adamson_project', true );
	return is_array( $data ) ? $data : array();
}

add_action( 'add_meta_boxes_project', function () {
	add_meta_box( 'adamson-project', 'Case study', function ( $post ) {
		wp_nonce_field( 'adamson_project_save', 'adamson_project_nonce' );
		echo '<div id="adamson-product-fields"></div>';
		echo '<input type="hidden" id="adamson-product-json" name="adamson_project_json" value="' . esc_attr( wp_json_encode( (object) adamson_project_data( $post->ID ) ) ) . '" />';
	}, 'project', 'normal', 'high' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	$screen = get_current_screen();
	if ( ! $screen || 'project' !== $screen->post_type || ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	adamson_register_field_assets();
	wp_enqueue_media();
	wp_enqueue_script( 'adamson-product', plugins_url( 'assets/product.js', __FILE__ ), array( 'adamson-fields', 'wp-element' ), adamson_asset_version( 'assets/product.js' ), true );
	wp_add_inline_script( 'adamson-product', 'window.ADAMSON_PRODUCT = ' . wp_json_encode( array( 'fields' => adamson_project_contract()['fields'] ) ) . ';', 'before' );
	wp_enqueue_style( 'adamson-admin' );
} );

add_action( 'save_post_project', function ( $post_id ) {
	if ( ! isset( $_POST['adamson_project_nonce'] ) || ! wp_verify_nonce( $_POST['adamson_project_nonce'], 'adamson_project_save' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) || wp_is_post_revision( $post_id ) ) {
		return;
	}
	$data = json_decode( wp_unslash( isset( $_POST['adamson_project_json'] ) ? $_POST['adamson_project_json'] : '' ), true );
	update_post_meta( $post_id, 'adamson_project', is_array( $data ) ? $data : array() );
} );

// Columns in the project list
add_filter( 'manage_project_posts_columns', function ( $cols ) {
	return array_merge( array_slice( $cols, 0, 2 ), array( 'app' => 'Application', 'region' => 'Region', 'featured' => 'Featured' ), array_slice( $cols, 2 ) );
} );
add_action( 'manage_project_posts_custom_column', function ( $col, $post_id ) {
	$d = adamson_project_data( $post_id );
	if ( 'app' === $col ) {
		echo esc_html( isset( $d['application'] ) ? $d['application'] : '' );
	} elseif ( 'region' === $col ) {
		echo esc_html( isset( $d['region'] ) ? $d['region'] : '' );
	} elseif ( 'featured' === $col ) {
		echo ! empty( $d['featured'] ) ? '✓' : '';
	}
}, 10, 2 );
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() && $q->is_main_query() && 'project' === $q->get( 'post_type' ) && ! $q->get( 'orderby' ) ) {
		$q->set( 'orderby', array( 'menu_order' => 'ASC', 'title' => 'ASC' ) );
	}
} );

// Publishing or editing a project refreshes the live site.
add_action( 'transition_post_status', function ( $new, $old, $post ) {
	if ( 'project' === $post->post_type && ( 'publish' === $new || 'publish' === $old ) ) {
		adamson_trigger_revalidate( 'project:' . $post->ID );
	}
}, 10, 3 );
add_action( 'updated_post_meta', function ( $meta_id, $post_id, $key ) {
	if ( 'adamson_project' === $key && 'publish' === get_post_status( $post_id ) ) {
		adamson_trigger_revalidate( 'project:' . $post_id );
	}
}, 10, 3 );

function adamson_projects_payload() {
	$posts = get_posts( array(
		'post_type'   => 'project',
		'post_status' => 'publish',
		'numberposts' => -1,
		'orderby'     => array( 'menu_order' => 'ASC', 'title' => 'ASC' ),
	) );
	$out = array();
	foreach ( $posts as $p ) {
		$out[] = array_merge( adamson_project_data( $p->ID ), array(
			'url'   => '/applications/projects/' . $p->post_name,
			'id'    => $p->ID,
			'slug'  => $p->post_name,
			'name'  => adamson_plain( get_the_title( $p ) ),
			'order' => (int) $p->menu_order,
		) );
	}
	return $out;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'adamson/v1', '/projects', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'adamson_projects_payload',
	) );
} );
