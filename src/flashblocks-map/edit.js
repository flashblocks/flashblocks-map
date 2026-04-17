import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	RangeControl,
	RadioControl,
} from '@wordpress/components';
import './editor.scss';

function getMapSrc( { address, zoom, mapType } ) {
	const params = new URLSearchParams( {
		q: address,
		z: zoom,
		t: mapType,
		output: 'embed',
	} );
	return 'https://maps.google.com/maps?' + params.toString();
}

export default function Edit( { attributes, setAttributes } ) {
	const { address, zoom, mapType, height } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Map Settings', 'flashblocks-map' ) }>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Address', 'flashblocks-map' ) }
						value={ address }
						onChange={ ( value ) =>
							setAttributes( { address: value } )
						}
						help={ __(
							'Enter an address or place name',
							'flashblocks-map'
						) }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Zoom', 'flashblocks-map' ) }
						value={ zoom }
						onChange={ ( value ) =>
							setAttributes( { zoom: value } )
						}
						min={ 1 }
						max={ 21 }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Height (px)', 'flashblocks-map' ) }
						value={ height }
						onChange={ ( value ) =>
							setAttributes( { height: value } )
						}
						min={ 100 }
						max={ 800 }
						step={ 10 }
					/>
					<RadioControl
						label={ __( 'Map Type', 'flashblocks-map' ) }
						selected={ mapType }
						options={ [
							{ label: __( 'Roadmap', 'flashblocks-map' ), value: 'm' },
							{ label: __( 'Satellite', 'flashblocks-map' ), value: 'k' },
						] }
						onChange={ ( value ) =>
							setAttributes( { mapType: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<iframe
					title={ address }
					src={ getMapSrc( { address, zoom, mapType } ) }
					style={ { border: 0, height, width: '100%' } }
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
				/>
			</div>
		</>
	);
}
