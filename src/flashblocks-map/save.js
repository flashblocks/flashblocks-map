import { useBlockProps } from '@wordpress/block-editor';
import { getSimpleSrc, getEmbedApiSrc } from './edit';

export default function save( { attributes } ) {
	const { useEmbedApi, height, address } = attributes;
	const blockProps = useBlockProps.save();
	const src = useEmbedApi
		? getEmbedApiSrc( attributes )
		: getSimpleSrc( attributes );

	if ( ! src ) return null;

	return (
		<div { ...blockProps }>
			<iframe
				title={ address || 'Google Map' }
				src={ src }
				style={ { border: '0', height: height + 'px', width: '100%' } }
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				allowFullScreen
			/>
		</div>
	);
}
