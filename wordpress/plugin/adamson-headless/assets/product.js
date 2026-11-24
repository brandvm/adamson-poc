/** Product edit screen: the product fields (contract/product.json), saved with the post. */
( function ( wp ) {
	const { createElement: h, useState, createRoot } = wp.element;
	const { Fields } = window.AdamsonFields;

	function App( { initial, input } ) {
		const [ value, setValue ] = useState( initial );
		const change = ( v ) => {
			setValue( v );
			input.value = JSON.stringify( v );
		};
		return h( 'div', { className: 'adamson-product' }, h( Fields, { fields: window.ADAMSON_PRODUCT.fields, value, onChange: change } ) );
	}

	document.addEventListener( 'DOMContentLoaded', () => {
		const el = document.getElementById( 'adamson-product-fields' );
		const input = document.getElementById( 'adamson-product-json' );
		if ( ! el || ! input ) return;
		let initial = {};
		try {
			initial = JSON.parse( input.value ) || {};
		} catch ( e ) {}
		createRoot( el ).render( h( App, { initial, input } ) );
	} );
} )( window.wp );
