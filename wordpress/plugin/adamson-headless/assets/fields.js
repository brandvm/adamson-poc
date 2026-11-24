/**
 * Adamson field renderer.
 * Builds editing UI from the block contract (contract/blocks/*.json) so every
 * block and the Site settings page share one set of field types:
 * text, textarea, url, number, toggle, select, image, video, link, group, repeater,
 * product (pick one of the Products; stores its ID).
 * No build step: uses the wp.* globals WordPress already loads.
 */
( function ( wp ) {
	const { createElement: h, Fragment, useState, useEffect } = wp.element;
	const { TextControl, TextareaControl, SelectControl, ToggleControl, Button, BaseControl } = wp.components;

	const blank = ( field ) => {
		switch ( field.type ) {
			case 'repeater': return [];
			case 'group': return {};
			case 'toggle': return false;
			case 'image': case 'video': case 'link': case 'product': return null;
			case 'number': return field.default ?? 0;
			default: return field.default ?? '';
		}
	};

	function MediaField( { field, value, onChange, kind } ) {
		const open = () => {
			const frame = wp.media( {
				title: field.label || 'Select ' + kind,
				library: { type: kind },
				multiple: false,
				button: { text: 'Use this ' + kind },
			} );
			frame.on( 'select', () => {
				const a = frame.state().get( 'selection' ).first().toJSON();
				onChange( { id: a.id, url: a.url, alt: a.alt || '', width: a.width, height: a.height, mime: a.mime } );
			} );
			frame.open();
		};
		const preview = value && value.url
			? ( kind === 'video'
				? h( 'video', { src: value.url, muted: true, className: 'adamson-field__thumb' } )
				: h( 'img', { src: value.url, alt: '', className: 'adamson-field__thumb' } ) )
			: h( 'div', { className: 'adamson-field__empty' }, 'No ' + kind + ' selected' );
		return h( BaseControl, { label: field.label, help: field.help, __nextHasNoMarginBottom: true },
			h( 'div', { className: 'adamson-field__media' },
				preview,
				h( 'div', { className: 'adamson-field__media-actions' },
					h( Button, { variant: 'secondary', onClick: open }, value ? 'Replace' : 'Select ' + kind ),
					value && h( Button, { variant: 'link', isDestructive: true, onClick: () => onChange( null ) }, 'Remove' )
				),
				kind === 'image' && value && h( TextControl, {
					label: 'Alt text', value: value.alt || '', __nextHasNoMarginBottom: true,
					onChange: ( alt ) => onChange( { ...value, alt } ),
				} )
			)
		);
	}

	// Products list, loaded once per screen and shared by every picker.
	let productsPromise = null;
	const loadProducts = () =>
		( productsPromise = productsPromise || wp.apiFetch( { path: '/adamson/v1/products' } ).catch( () => [] ) );

	function ProductField( { field, value, onChange } ) {
		const [ products, setProducts ] = useState( null );
		useEffect( () => {
			loadProducts().then( setProducts );
		}, [] );
		const options = [ { label: products ? '— Choose a product —' : 'Loading products…', value: '' } ].concat(
			( products || [] ).map( ( p ) => ( { label: p.name + ( p.type ? ' (' + p.type + ')' : '' ), value: String( p.id ) } ) )
		);
		return h( SelectControl, {
			label: field.label,
			help: field.help || 'Products are managed under Products in the left menu.',
			value: value ? String( value ) : '',
			options,
			__nextHasNoMarginBottom: true,
			onChange: ( v ) => onChange( v ? Number( v ) : null ),
		} );
	}

	function Repeater( { field, value, onChange } ) {
		const items = Array.isArray( value ) ? value : [];
		const [ open, setOpen ] = useState( -1 );
		const update = ( i, v ) => onChange( items.map( ( it, j ) => ( j === i ? v : it ) ) );
		const move = ( i, d ) => {
			const next = items.slice();
			const [ it ] = next.splice( i, 1 );
			next.splice( i + d, 0, it );
			onChange( next );
		};
		const label = ( it, i ) => {
			const key = field.itemLabel;
			const raw = key && it && it[ key ];
			const text = raw && typeof raw === 'object' ? raw.label || raw.alt || '' : raw;
			return ( i + 1 ) + '. ' + ( text || field.itemName || 'Item' );
		};
		const canAdd = ! field.max || items.length < field.max;
		return h( BaseControl, { label: field.label, help: field.help, __nextHasNoMarginBottom: true },
			h( 'div', { className: 'adamson-field__repeater' },
				items.map( ( it, i ) => h( 'div', { key: i, className: 'adamson-field__item' + ( open === i ? ' is-open' : '' ) },
					h( 'div', { className: 'adamson-field__item-head' },
						h( 'button', { type: 'button', className: 'adamson-field__item-toggle', onClick: () => setOpen( open === i ? -1 : i ) }, label( it, i ) ),
						h( Button, { size: 'small', icon: 'arrow-up-alt2', label: 'Move up', disabled: i === 0, onClick: () => move( i, -1 ) } ),
						h( Button, { size: 'small', icon: 'arrow-down-alt2', label: 'Move down', disabled: i === items.length - 1, onClick: () => move( i, 1 ) } ),
						h( Button, { size: 'small', icon: 'trash', label: 'Remove', isDestructive: true, onClick: () => onChange( items.filter( ( _, j ) => j !== i ) ) } )
					),
					open === i && h( 'div', { className: 'adamson-field__item-body' },
						h( Fields, { fields: field.fields, value: it || {}, onChange: ( v ) => update( i, v ) } )
					)
				) ),
				canAdd && h( Button, {
					variant: 'secondary',
					onClick: () => {
						const fresh = {};
						field.fields.forEach( ( f ) => ( fresh[ f.key ] = blank( f ) ) );
						onChange( items.concat( [ fresh ] ) );
						setOpen( items.length );
					},
				}, 'Add ' + ( field.itemName || 'item' ) )
			)
		);
	}

	function Field( { field, value, onChange } ) {
		const common = { label: field.label, help: field.help, __nextHasNoMarginBottom: true };
		switch ( field.type ) {
			case 'textarea':
				return h( TextareaControl, { ...common, rows: field.rows || 3, value: value ?? '', onChange } );
			case 'url':
				return h( TextControl, { ...common, type: 'url', value: value ?? '', onChange } );
			case 'number':
				return h( TextControl, { ...common, type: 'number', value: value ?? '', onChange: ( v ) => onChange( v === '' ? '' : Number( v ) ) } );
			case 'toggle':
				return h( ToggleControl, { ...common, checked: !! value, onChange } );
			case 'select':
				return h( SelectControl, {
					...common, value: value ?? '', onChange,
					options: ( field.options || [] ).map( ( o ) => ( typeof o === 'string' ? { label: o, value: o } : o ) ),
				} );
			case 'image':
				return h( MediaField, { field, value, onChange, kind: 'image' } );
			case 'video':
				return h( MediaField, { field, value, onChange, kind: 'video' } );
			case 'link':
				return h( 'div', { className: 'adamson-field__group' },
					h( 'div', { className: 'adamson-field__group-label' }, field.label ),
					h( TextControl, { label: 'Label', value: ( value && value.label ) || '', __nextHasNoMarginBottom: true, onChange: ( label ) => onChange( { ...( value || {} ), label } ) } ),
					h( TextControl, { label: 'URL', type: 'url', value: ( value && value.url ) || '', __nextHasNoMarginBottom: true, onChange: ( url ) => onChange( { ...( value || {} ), url } ) } )
				);
			case 'group':
				return h( 'div', { className: 'adamson-field__group' },
					h( 'div', { className: 'adamson-field__group-label' }, field.label ),
					h( Fields, { fields: field.fields, value: value || {}, onChange } )
				);
			case 'repeater':
				return h( Repeater, { field, value, onChange } );
			case 'product':
				return h( ProductField, { field, value, onChange } );
			default:
				return h( TextControl, { ...common, value: value ?? '', onChange } );
		}
	}

	function Fields( { fields, value, onChange } ) {
		const data = value || {};
		return h( Fragment, null, ( fields || [] ).map( ( f ) => h( 'div', { key: f.key, className: 'adamson-field' },
			h( Field, { field: f, value: data[ f.key ], onChange: ( v ) => onChange( { ...data, [ f.key ]: v } ) } )
		) ) );
	}

	window.AdamsonFields = { Fields, Field };
} )( window.wp );
