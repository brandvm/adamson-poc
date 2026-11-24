/** Site settings page: the same field types as the blocks, saved over REST. */
( function ( wp ) {
	const { createElement: h, useEffect, useState, createRoot } = wp.element;
	const { Button, Notice, Spinner } = wp.components;
	const { Fields } = window.AdamsonFields;

	function App() {
		const [ value, setValue ] = useState( null );
		const [ saving, setSaving ] = useState( false );
		const [ notice, setNotice ] = useState( null );

		useEffect( () => {
			wp.apiFetch( { path: '/adamson/v1/settings' } ).then( ( v ) => setValue( v || {} ) );
		}, [] );

		if ( ! value ) return h( Spinner );

		const save = () => {
			setSaving( true );
			wp.apiFetch( { path: '/adamson/v1/settings', method: 'POST', data: value } )
				.then( () => setNotice( { status: 'success', text: 'Saved. The live site refreshes within seconds.' } ) )
				.catch( ( e ) => setNotice( { status: 'error', text: e.message || 'Save failed.' } ) )
				.finally( () => setSaving( false ) );
		};

		return h( 'div', { className: 'adamson-settings' },
			notice && h( Notice, { status: notice.status, onRemove: () => setNotice( null ) }, notice.text ),
			h( 'div', { className: 'adamson-settings__fields' },
				h( Fields, { fields: window.ADAMSON_SETTINGS.fields, value, onChange: setValue } )
			),
			h( Button, { variant: 'primary', isBusy: saving, disabled: saving, onClick: save }, 'Save settings' )
		);
	}

	document.addEventListener( 'DOMContentLoaded', () => {
		const el = document.getElementById( 'adamson-settings' );
		if ( el ) createRoot( el ).render( h( App ) );
	} );
} )( window.wp );
