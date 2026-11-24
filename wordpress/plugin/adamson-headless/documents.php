<?php
/**
 * Documents: one record per downloadable file (manuals, data sheets, firmware …)
 * for Support → Documentation & Downloads. Fields: contract/document.json, edited
 * with the same field UI as products (assets/product.js is reused as-is).
 */

defined( 'ABSPATH' ) || exit;

function adamson_document_contract() {
	$def = json_decode( file_get_contents( ADAMSON_DIR . '/contract/document.json' ), true );
	return is_array( $def ) ? $def : array( 'fields' => array() );
}

add_action( 'init', function () {
	register_post_type( 'document', array(
		'labels'        => array(
			'name'          => 'Documents',
			'singular_name' => 'Document',
			'add_new_item'  => 'Add document',
			'edit_item'     => 'Edit document',
			'all_items'     => 'All documents',
		),
		'public'        => false,
		'show_ui'       => true,
		'show_in_menu'  => true,
		'menu_icon'     => 'dashicons-media-document',
		'menu_position' => 5,
		'supports'      => array( 'title' ),
	) );
} );

add_filter( 'use_block_editor_for_post_type', function ( $use, $type ) {
	return 'document' === $type ? false : $use;
}, 10, 2 );

function adamson_document_data( $post_id ) {
	$data = get_post_meta( $post_id, 'adamson_document', true );
	return is_array( $data ) ? $data : array();
}

add_action( 'add_meta_boxes_document', function () {
	add_meta_box( 'adamson-document', 'Document details', function ( $post ) {
		wp_nonce_field( 'adamson_document_save', 'adamson_document_nonce' );
		// Same element ids as the product screen, so assets/product.js renders the fields.
		echo '<div id="adamson-product-fields"></div>';
		echo '<input type="hidden" id="adamson-product-json" name="adamson_document_json" value="' . esc_attr( wp_json_encode( (object) adamson_document_data( $post->ID ) ) ) . '" />';
	}, 'document', 'normal', 'high' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	$screen = get_current_screen();
	if ( ! $screen || 'document' !== $screen->post_type || ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	adamson_register_field_assets();
	wp_enqueue_script( 'adamson-product', plugins_url( 'assets/product.js', __FILE__ ), array( 'adamson-fields', 'wp-element' ), adamson_asset_version( 'assets/product.js' ), true );
	wp_add_inline_script( 'adamson-product', 'window.ADAMSON_PRODUCT = ' . wp_json_encode( array( 'fields' => adamson_document_contract()['fields'] ) ) . ';', 'before' );
	wp_enqueue_style( 'adamson-admin' );
} );

add_action( 'save_post_document', function ( $post_id ) {
	if ( ! isset( $_POST['adamson_document_nonce'] ) || ! wp_verify_nonce( $_POST['adamson_document_nonce'], 'adamson_document_save' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) || wp_is_post_revision( $post_id ) ) {
		return;
	}
	$data = json_decode( wp_unslash( isset( $_POST['adamson_document_json'] ) ? $_POST['adamson_document_json'] : '' ), true );
	update_post_meta( $post_id, 'adamson_document', is_array( $data ) ? $data : array() );
} );

add_filter( 'manage_document_posts_columns', function ( $cols ) {
	return array_merge( array_slice( $cols, 0, 2 ), array( 'dproduct' => 'Product', 'dtype' => 'File type', 'dlang' => 'Language' ), array_slice( $cols, 2 ) );
} );
add_action( 'manage_document_posts_custom_column', function ( $col, $post_id ) {
	$d   = adamson_document_data( $post_id );
	$map = array( 'dproduct' => 'product', 'dtype' => 'fileType', 'dlang' => 'language' );
	if ( isset( $map[ $col ] ) ) {
		echo esc_html( isset( $d[ $map[ $col ] ] ) ? $d[ $map[ $col ] ] : '' );
	}
}, 10, 2 );

add_action( 'transition_post_status', function ( $new, $old, $post ) {
	if ( 'document' === $post->post_type && ( 'publish' === $new || 'publish' === $old ) ) {
		adamson_trigger_revalidate( 'document:' . $post->ID );
	}
}, 10, 3 );
add_action( 'updated_post_meta', function ( $meta_id, $post_id, $key ) {
	if ( 'adamson_document' === $key && 'publish' === get_post_status( $post_id ) ) {
		adamson_trigger_revalidate( 'document:' . $post_id );
	}
}, 10, 3 );

function adamson_document_item( WP_Post $p ) {
	return array_merge(
		array( 'product' => '', 'series' => '', 'fileType' => '', 'language' => 'English', 'version' => '', 'size' => '', 'file' => '', 'summary' => '', 'discontinued' => false ),
		adamson_document_data( $p->ID ),
		array(
			'id'      => $p->ID,
			'slug'    => $p->post_name,
			'title'   => adamson_plain( get_the_title( $p ) ),
			'updated' => get_the_modified_date( 'M j, Y', $p ),
		)
	);
}

add_action( 'rest_api_init', function () {
	// /documents → all; /documents?slug=x → one (404 when missing)
	register_rest_route( 'adamson/v1', '/documents', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$slug = sanitize_title( (string) $req->get_param( 'slug' ) );
			if ( $slug ) {
				$p = get_page_by_path( $slug, OBJECT, 'document' );
				if ( ! $p || 'publish' !== $p->post_status ) {
					return new WP_Error( 'not_found', 'Document not found.', array( 'status' => 404 ) );
				}
				return adamson_document_item( $p );
			}
			$posts = get_posts( array( 'post_type' => 'document', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) );
			return array_map( 'adamson_document_item', $posts );
		},
	) );
} );
