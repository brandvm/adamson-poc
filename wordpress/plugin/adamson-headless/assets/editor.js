/**
 * Registers every block in the contract. In the editor each block shows:
 *  - its fields in the sidebar (built by fields.js), and
 *  - a live preview on the canvas: the real Next.js component, rendered by the
 *    preview app at 1680px and scaled to fit, updated as you type.
 */
( function ( wp ) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody } = wp.components;
	const { createElement: h, useEffect, useRef, useState } = wp.element;
	const { Fields } = window.AdamsonFields;
	const { blocks, previewOrigin } = window.ADAMSON;
	const DESIGN_WIDTH = 1680;

	function PreviewFrame( { block, data } ) {
		const wrap = useRef( null );
		const frame = useRef( null );
		const [ ready, setReady ] = useState( false );
		const [ scale, setScale ] = useState( 0.5 );
		const [ height, setHeight ] = useState( 600 );

		useEffect( () => {
			const el = wrap.current;
			if ( ! el ) return;
			const measure = () => setScale( el.clientWidth / DESIGN_WIDTH );
			measure();
			const ro = new el.ownerDocument.defaultView.ResizeObserver( measure );
			ro.observe( el );
			return () => ro.disconnect();
		}, [] );

		useEffect( () => {
			const win = wrap.current && wrap.current.ownerDocument.defaultView;
			if ( ! win ) return;
			const onMessage = ( e ) => {
				if ( e.origin !== previewOrigin || ! frame.current || e.source !== frame.current.contentWindow ) return;
				if ( e.data && e.data.type === 'adamson:ready' ) setReady( true );
				if ( e.data && e.data.type === 'adamson:height' ) setHeight( e.data.height );
			};
			win.addEventListener( 'message', onMessage );
			return () => win.removeEventListener( 'message', onMessage );
		}, [] );

		useEffect( () => {
			if ( ready && frame.current ) {
				frame.current.contentWindow.postMessage( { type: 'adamson:render', block, data }, previewOrigin );
			}
		}, [ ready, block, JSON.stringify( data ) ] );

		return h( 'div', { ref: wrap, className: 'adamson-preview', style: { height: height * scale } },
			h( 'iframe', {
				ref: frame,
				title: 'Preview',
				src: previewOrigin + '/block-preview',
				style: { width: DESIGN_WIDTH, height, transform: 'scale(' + scale + ')' },
			} ),
			! ready && h( 'div', { className: 'adamson-preview__loading' }, 'Loading preview from ' + previewOrigin + '…' )
		);
	}

	blocks.forEach( ( def ) => {
		registerBlockType( def.name, {
			apiVersion: 3,
			title: def.title,
			description: def.description || '',
			category: 'adamson',
			icon: def.icon || 'layout',
			attributes: { data: { type: 'object', default: {} } },
			supports: { html: false, reusable: false },
			edit: function Edit( { attributes, setAttributes } ) {
				const props = useBlockProps( { className: 'adamson-block' } );
				const data = attributes.data || {};
				return h( 'div', props,
					h( InspectorControls, null,
						h( PanelBody, { title: def.title + ' content', initialOpen: true },
							h( Fields, { fields: def.fields, value: data, onChange: ( v ) => setAttributes( { data: v } ) } )
						)
					),
					h( 'div', { className: 'adamson-block__label' }, def.title ),
					h( PreviewFrame, { block: def.name, data } )
				);
			},
			save: () => null,
		} );
	} );
} )( window.wp );
