<?php
/**
 * Products: one record per product, the single source for every section that
 * shows products (Products section, Products in action). Fields come from
 * contract/product.json and are edited with the same field UI as the blocks.
 */

defined( 'ABSPATH' ) || exit;

function adamson_product_contract() {
	$def = json_decode( file_get_contents( ADAMSON_DIR . '/contract/product.json' ), true );
	return is_array( $def ) ? $def : array( 'fields' => array() );
}

add_action( 'init', function () {
	register_post_type( 'product', array(
		'labels'       => array(
			'name'          => 'Products',
			'singular_name' => 'Product',
			'add_new_item'  => 'Add product',
			'edit_item'     => 'Edit product',
			'all_items'     => 'All products',
		),
		'public'       => false,
		'show_ui'      => true,
		'show_in_menu' => true,
		'menu_icon'    => 'dashicons-products',
		'menu_position' => 4,
		'supports'     => array( 'title', 'page-attributes' ),
		'hierarchical' => false,
	) );
} );

// A plain screen (title + product fields), not the block editor.
add_filter( 'use_block_editor_for_post_type', function ( $use, $type ) {
	return 'product' === $type ? false : $use;
}, 10, 2 );

function adamson_product_data( $post_id ) {
	$data = get_post_meta( $post_id, 'adamson_product', true );
	return is_array( $data ) ? $data : array();
}

add_action( 'add_meta_boxes_product', function () {
	add_meta_box( 'adamson-product', 'Product details', function ( $post ) {
		wp_nonce_field( 'adamson_product_save', 'adamson_product_nonce' );
		echo '<div id="adamson-product-fields"></div>';
		echo '<input type="hidden" id="adamson-product-json" name="adamson_product_json" value="' . esc_attr( wp_json_encode( (object) adamson_product_data( $post->ID ) ) ) . '" />';
	}, 'product', 'normal', 'high' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	$screen = get_current_screen();
	if ( ! $screen || 'product' !== $screen->post_type || ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	adamson_register_field_assets();
	wp_enqueue_media();
	wp_enqueue_script( 'adamson-product', plugins_url( 'assets/product.js', __FILE__ ), array( 'adamson-fields', 'wp-element' ), adamson_asset_version( 'assets/product.js' ), true );
	wp_add_inline_script( 'adamson-product', 'window.ADAMSON_PRODUCT = ' . wp_json_encode( array( 'fields' => adamson_product_contract()['fields'] ) ) . ';', 'before' );
	wp_enqueue_style( 'adamson-admin' );
} );

add_action( 'save_post_product', function ( $post_id ) {
	if ( ! isset( $_POST['adamson_product_nonce'] ) || ! wp_verify_nonce( $_POST['adamson_product_nonce'], 'adamson_product_save' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) || wp_is_post_revision( $post_id ) ) {
		return;
	}
	$data = json_decode( wp_unslash( isset( $_POST['adamson_product_json'] ) ? $_POST['adamson_product_json'] : '' ), true );
	update_post_meta( $post_id, 'adamson_product', is_array( $data ) ? $data : array() );
} );

// Columns in the product list
add_filter( 'manage_product_posts_columns', function ( $cols ) {
	return array_merge( array_slice( $cols, 0, 2 ), array( 'ptype' => 'Type', 'inrange' => 'In Products section', 'order' => 'Order' ), array_slice( $cols, 2 ) );
} );
add_action( 'manage_product_posts_custom_column', function ( $col, $post_id ) {
	$d = adamson_product_data( $post_id );
	if ( 'ptype' === $col ) {
		echo esc_html( isset( $d['type'] ) ? $d['type'] : '' );
	} elseif ( 'inrange' === $col ) {
		echo ! empty( $d['inRange'] ) ? '✓' : '';
	} elseif ( 'order' === $col ) {
		echo (int) get_post_field( 'menu_order', $post_id );
	}
}, 10, 2 );
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() && $q->is_main_query() && 'product' === $q->get( 'post_type' ) && ! $q->get( 'orderby' ) ) {
		$q->set( 'orderby', array( 'menu_order' => 'ASC', 'title' => 'ASC' ) );
	}
} );

// Publishing or editing a product refreshes the live site.
add_action( 'transition_post_status', function ( $new, $old, $post ) {
	if ( 'product' === $post->post_type && ( 'publish' === $new || 'publish' === $old ) ) {
		adamson_trigger_revalidate( 'product:' . $post->ID );
	}
}, 10, 3 );
add_action( 'updated_post_meta', function ( $meta_id, $post_id, $key ) {
	if ( 'adamson_product' === $key && 'publish' === get_post_status( $post_id ) ) {
		adamson_trigger_revalidate( 'product:' . $post_id );
	}
}, 10, 3 );

function adamson_products_payload() {
	$posts = get_posts( array(
		'post_type'   => 'product',
		'post_status' => 'publish',
		'numberposts' => -1,
		'orderby'     => array( 'menu_order' => 'ASC', 'title' => 'ASC' ),
	) );
	$out = array();
	foreach ( $posts as $p ) {
		$out[] = array_merge( adamson_product_data( $p->ID ), array(
			'id'    => $p->ID,
			'slug'  => $p->post_name,
			'name'  => adamson_plain( get_the_title( $p ) ),
			'order' => (int) $p->menu_order,
		) );
	}
	return $out;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'adamson/v1', '/products', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'adamson_products_payload',
	) );
} );
