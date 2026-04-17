import { useBlockProps } from '@wordpress/block-editor';

function getMapSrc( { address, zoom, mapType } ) {
	const params = new URLSearchParams( {
		q: address,
		z: zoom,
		t: mapType,
		output: 'embed',
	} );
	return 'https://maps.google.com/maps?' + params.toString();
}

export default function save( { attributes } ) {
	const { address, zoom, mapType, height } = attributes;
	const blockProps = useBlockProps.save();

	return (
		<div { ...blockProps }>
			<iframe
				title={ address }
				src={ getMapSrc( { address, zoom, mapType } ) }
				style={ { border: 0, height: height + 'px', width: '100%' } }
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
			/>
		</div>
	);
}
