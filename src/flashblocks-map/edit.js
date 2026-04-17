import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	TextControl,
	RangeControl,
	RadioControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import './editor.scss';

const WP_CONFIG_SNIPPET = "define( 'GOOGLE_MAPS_EMBED_API_KEY', 'your-key' );";

function CopyableCode( { text } ) {
	const [ copied, setCopied ] = useState( false );
	const ref = useCopyToClipboard( text, () => {
		setCopied( true );
		setTimeout( () => setCopied( false ), 2000 );
	} );
	return (
		<span className="flashblocks-map-copyable">
			<code>{ text }</code>
			<Button ref={ ref } variant="secondary" size="small" className="flashblocks-map-copy-btn">
				{ copied ? __( 'Copied!', 'flashblocks-map' ) : __( 'Copy', 'flashblocks-map' ) }
			</Button>
		</span>
	);
}

/*
 * Map type options — shared concept, different values per mode.
 * Simple embed uses single-letter codes, Embed API uses full names.
 */
const SIMPLE_MAP_TYPES = [
	{ label: __( 'Roadmap', 'flashblocks-map' ), value: 'm' },
	{ label: __( 'Satellite', 'flashblocks-map' ), value: 'k' },
	{ label: __( 'Hybrid', 'flashblocks-map' ), value: 'h' },
	{ label: __( 'Terrain', 'flashblocks-map' ), value: 'p' },
];

const API_MAP_TYPES = [
	{ label: __( 'Roadmap', 'flashblocks-map' ), value: 'roadmap' },
	{ label: __( 'Satellite', 'flashblocks-map' ), value: 'satellite' },
	{ label: __( 'Hybrid', 'flashblocks-map' ), value: 'hybrid' },
	{ label: __( 'Terrain', 'flashblocks-map' ), value: 'terrain' },
];

const EMBED_MODES = [
	{ label: __( 'Place — pin at a location', 'flashblocks-map' ), value: 'place' },
	{ label: __( 'Directions — route between places', 'flashblocks-map' ), value: 'directions' },
	{ label: __( 'Street View — panorama', 'flashblocks-map' ), value: 'streetview' },
	{ label: __( 'Search — find nearby places', 'flashblocks-map' ), value: 'search' },
];

const TRAVEL_MODES = [
	{ label: __( 'Driving', 'flashblocks-map' ), value: 'driving' },
	{ label: __( 'Walking', 'flashblocks-map' ), value: 'walking' },
	{ label: __( 'Bicycling', 'flashblocks-map' ), value: 'bicycling' },
	{ label: __( 'Transit', 'flashblocks-map' ), value: 'transit' },
	{ label: __( 'Flying', 'flashblocks-map' ), value: 'flying' },
];

const UNIT_OPTIONS = [
	{ label: __( 'Auto', 'flashblocks-map' ), value: '' },
	{ label: __( 'Metric', 'flashblocks-map' ), value: 'metric' },
	{ label: __( 'Imperial', 'flashblocks-map' ), value: 'imperial' },
];

/* ── URL builders ── */

export function getSimpleSrc( attributes ) {
	const { address, zoom, simpleMapType } = attributes;
	const params = new URLSearchParams( {
		q: address,
		z: zoom,
		t: simpleMapType,
		output: 'embed',
	} );
	return 'https://maps.google.com/maps?' + params.toString();
}

export function getEmbedApiSrc( attributes ) {
	const apiKey = window.flashblocksMap?.apiKey || '';
	if ( ! apiKey ) return '';

	const {
		embedMode, address, zoom, mapType, language, region,
		center, dirOrigin, dirDestination, dirWaypoints,
		dirMode, dirAvoid, dirUnits,
		svLocation, svPano, svHeading, svPitch, svFov,
	} = attributes;

	const base = 'https://www.google.com/maps/embed/v1/' + embedMode;
	const params = new URLSearchParams( { key: apiKey } );

	if ( zoom ) params.set( 'zoom', zoom );
	if ( mapType ) params.set( 'maptype', mapType );
	if ( language ) params.set( 'language', language );
	if ( region ) params.set( 'region', region );

	switch ( embedMode ) {
		case 'place':
			params.set( 'q', address );
			if ( center ) params.set( 'center', center );
			break;
		case 'directions':
			if ( ! dirOrigin || ! dirDestination ) return '';
			params.set( 'origin', dirOrigin );
			params.set( 'destination', dirDestination );
			if ( dirWaypoints ) params.set( 'waypoints', dirWaypoints );
			if ( dirMode ) params.set( 'mode', dirMode );
			if ( dirAvoid ) params.set( 'avoid', dirAvoid );
			if ( dirUnits ) params.set( 'units', dirUnits );
			break;
		case 'streetview':
			if ( ! svLocation && ! svPano ) return '';
			if ( svPano ) params.set( 'pano', svPano );
			if ( svLocation ) params.set( 'location', svLocation );
			if ( svHeading ) params.set( 'heading', svHeading );
			if ( svPitch ) params.set( 'pitch', svPitch );
			if ( svFov ) params.set( 'fov', svFov );
			break;
		case 'search':
			if ( ! address ) return '';
			params.set( 'q', address );
			if ( center ) params.set( 'center', center );
			break;
	}

	return base + '?' + params.toString();
}

/* ── Placeholder messages ── */

function getPlaceholderMessage( embedMode ) {
	switch ( embedMode ) {
		case 'directions':
			return __( 'Enter an origin and destination to show directions.', 'flashblocks-map' );
		case 'streetview':
			return __( 'Enter a location (lat,lng) or panorama ID to show Street View.', 'flashblocks-map' );
		case 'search':
			return __( 'Enter a search query to show results.', 'flashblocks-map' );
		default:
			return __( 'Configure settings to display the map.', 'flashblocks-map' );
	}
}

/* ── Shared controls (both modes) ── */

function SharedControls( { attributes, setAttributes } ) {
	const { address, zoom, height, useEmbedApi } = attributes;
	return (
		<PanelBody title={ __( 'Map Display', 'flashblocks-map' ) }>
			{ /* Address is shared — used by simple mode and place/search in API mode */ }
			{ ( ! useEmbedApi || attributes.embedMode === 'place' || attributes.embedMode === 'search' ) && (
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ useEmbedApi && attributes.embedMode === 'search'
						? __( 'Search Query', 'flashblocks-map' )
						: __( 'Address', 'flashblocks-map' )
					}
					value={ address }
					onChange={ ( v ) => setAttributes( { address: v } ) }
					help={ useEmbedApi && attributes.embedMode === 'search'
						? __( 'e.g. "coffee shops in Austin" or "hotels near Times Square"', 'flashblocks-map' )
						: __( 'Address or place name', 'flashblocks-map' )
					}
				/>
			) }
			<RangeControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Zoom', 'flashblocks-map' ) }
				value={ zoom }
				onChange={ ( v ) => setAttributes( { zoom: v } ) }
				min={ 1 }
				max={ 21 }
			/>
			<RangeControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Height (px)', 'flashblocks-map' ) }
				value={ height }
				onChange={ ( v ) => setAttributes( { height: v } ) }
				min={ 100 }
				max={ 800 }
				step={ 10 }
			/>
		</PanelBody>
	);
}

/* ── Simple mode controls ── */

function SimpleControls( { attributes, setAttributes } ) {
	const { simpleMapType } = attributes;
	return (
		<PanelBody title={ __( 'Map Type', 'flashblocks-map' ) }>
			<RadioControl
				selected={ simpleMapType }
				options={ SIMPLE_MAP_TYPES }
				onChange={ ( v ) => setAttributes( { simpleMapType: v } ) }
			/>
		</PanelBody>
	);
}

/* ── Embed API controls ── */

function EmbedApiControls( { attributes, setAttributes } ) {
	const {
		embedMode, mapType, language, region, center,
		dirOrigin, dirDestination, dirWaypoints, dirMode, dirAvoid, dirUnits,
		svLocation, svPano, svHeading, svPitch, svFov,
	} = attributes;

	const hasKey = !! window.flashblocksMap?.apiKey;

	return (
		<>
			<PanelBody title={ __( 'Embed API', 'flashblocks-map' ) }>
				{ ! hasKey && (
					<div style={ { marginBottom: '16px' } }>
						<p style={ { color: '#d63638', fontWeight: 600, margin: '0 0 8px' } }>
							{ __( 'No API key found.', 'flashblocks-map' ) }
						</p>
						<p style={ { margin: '0 0 8px' } }>
							{ __( 'To enable Embed API mode:', 'flashblocks-map' ) }
						</p>
						<ol style={ { margin: '0 0 8px', paddingLeft: '20px', fontSize: '12px' } }>
							<li>
								<a href="https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com" target="_blank" rel="noopener noreferrer">
									{ __( 'Enable the Maps Embed API', 'flashblocks-map' ) }
								</a>
								{ __( ' in Google Cloud Console', 'flashblocks-map' ) }
							</li>
							<li>
								<a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
									{ __( 'Create an API key', 'flashblocks-map' ) }
								</a>
								{ __( ' (restrict to Maps Embed API + your domain)', 'flashblocks-map' ) }
							</li>
							<li>
								{ __( 'Add to wp-config.php:', 'flashblocks-map' ) }
								<CopyableCode text={ WP_CONFIG_SNIPPET } />
							</li>
						</ol>
						<p style={ { margin: 0, fontSize: '12px', color: '#757575' } }>
							{ __( 'The Embed API is free with no usage limits.', 'flashblocks-map' ) }
						</p>
					</div>
				) }
				<RadioControl
					label={ __( 'Mode', 'flashblocks-map' ) }
					selected={ embedMode }
					options={ EMBED_MODES }
					onChange={ ( v ) => setAttributes( { embedMode: v } ) }
				/>
			</PanelBody>

			<PanelBody title={ __( 'Map Type', 'flashblocks-map' ) } initialOpen={ false }>
				<RadioControl
					selected={ mapType }
					options={ API_MAP_TYPES }
					onChange={ ( v ) => setAttributes( { mapType: v } ) }
				/>
			</PanelBody>

			<PanelBody title={ __( 'Localization', 'flashblocks-map' ) } initialOpen={ false }>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Language', 'flashblocks-map' ) }
					value={ language }
					onChange={ ( v ) => setAttributes( { language: v } ) }
					help={ __( 'e.g. en, es, fr', 'flashblocks-map' ) }
				/>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Region', 'flashblocks-map' ) }
					value={ region }
					onChange={ ( v ) => setAttributes( { region: v } ) }
					help={ __( 'e.g. US, GB, JP', 'flashblocks-map' ) }
				/>
			</PanelBody>

			{ embedMode === 'place' && (
				<PanelBody title={ __( 'Place Options', 'flashblocks-map' ) } initialOpen={ false }>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Center (lat,lng)', 'flashblocks-map' ) }
						value={ center }
						onChange={ ( v ) => setAttributes( { center: v } ) }
						help={ __( 'Optional. Override the map center independently of the pin.', 'flashblocks-map' ) }
					/>
				</PanelBody>
			) }

			{ embedMode === 'search' && (
				<PanelBody title={ __( 'Search Options', 'flashblocks-map' ) } initialOpen={ false }>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Center (lat,lng)', 'flashblocks-map' ) }
						value={ center }
						onChange={ ( v ) => setAttributes( { center: v } ) }
						help={ __( 'Optional. Bias search results toward this location.', 'flashblocks-map' ) }
					/>
				</PanelBody>
			) }

			{ embedMode === 'directions' && (
				<PanelBody title={ __( 'Directions', 'flashblocks-map' ) } initialOpen>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Origin', 'flashblocks-map' ) }
						value={ dirOrigin }
						onChange={ ( v ) => setAttributes( { dirOrigin: v } ) }
						placeholder={ __( 'e.g. Austin, TX', 'flashblocks-map' ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Destination', 'flashblocks-map' ) }
						value={ dirDestination }
						onChange={ ( v ) => setAttributes( { dirDestination: v } ) }
						placeholder={ __( 'e.g. Houston, TX', 'flashblocks-map' ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Waypoints', 'flashblocks-map' ) }
						value={ dirWaypoints }
						onChange={ ( v ) => setAttributes( { dirWaypoints: v } ) }
						help={ __( 'Optional. Separate with | e.g. San Antonio|Waco', 'flashblocks-map' ) }
					/>
					<RadioControl
						label={ __( 'Travel Mode', 'flashblocks-map' ) }
						selected={ dirMode }
						options={ TRAVEL_MODES }
						onChange={ ( v ) => setAttributes( { dirMode: v } ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Avoid', 'flashblocks-map' ) }
						value={ dirAvoid }
						onChange={ ( v ) => setAttributes( { dirAvoid: v } ) }
						help={ __( 'tolls, ferries, highways — separate with |', 'flashblocks-map' ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Units', 'flashblocks-map' ) }
						value={ dirUnits }
						options={ UNIT_OPTIONS }
						onChange={ ( v ) => setAttributes( { dirUnits: v } ) }
					/>
				</PanelBody>
			) }

			{ embedMode === 'streetview' && (
				<PanelBody title={ __( 'Street View', 'flashblocks-map' ) } initialOpen>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Location (lat,lng)', 'flashblocks-map' ) }
						value={ svLocation }
						onChange={ ( v ) => setAttributes( { svLocation: v } ) }
						placeholder={ __( 'e.g. 30.27,-97.74', 'flashblocks-map' ) }
						help={ __( 'Required unless Panorama ID is set.', 'flashblocks-map' ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Panorama ID', 'flashblocks-map' ) }
						value={ svPano }
						onChange={ ( v ) => setAttributes( { svPano: v } ) }
						help={ __( 'Optional. Overrides location.', 'flashblocks-map' ) }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Heading', 'flashblocks-map' ) }
						value={ svHeading }
						onChange={ ( v ) => setAttributes( { svHeading: v } ) }
						min={ -180 }
						max={ 360 }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Pitch', 'flashblocks-map' ) }
						value={ svPitch }
						onChange={ ( v ) => setAttributes( { svPitch: v } ) }
						min={ -90 }
						max={ 90 }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Field of View', 'flashblocks-map' ) }
						value={ svFov }
						onChange={ ( v ) => setAttributes( { svFov: v } ) }
						min={ 10 }
						max={ 100 }
					/>
				</PanelBody>
			) }
		</>
	);
}

/* ── Main Edit component ── */

export default function Edit( { attributes, setAttributes } ) {
	const { useEmbedApi, height, embedMode } = attributes;
	const blockProps = useBlockProps();

	const src = useEmbedApi
		? getEmbedApiSrc( attributes )
		: getSimpleSrc( attributes );

	const needsConfig = useEmbedApi && ! window.flashblocksMap?.apiKey;
	const needsFields = useEmbedApi && ! needsConfig && ! src;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Embed Mode', 'flashblocks-map' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Use Embed API', 'flashblocks-map' ) }
						checked={ useEmbedApi }
						onChange={ ( v ) => setAttributes( { useEmbedApi: v } ) }
						help={
							useEmbedApi
								? __( 'Embed API — directions, street view, search (free API key required)', 'flashblocks-map' )
								: __( 'Simple embed — no key needed, just address + map type', 'flashblocks-map' )
						}
					/>
				</PanelBody>

				<SharedControls attributes={ attributes } setAttributes={ setAttributes } />

				{ useEmbedApi
					? <EmbedApiControls attributes={ attributes } setAttributes={ setAttributes } />
					: <SimpleControls attributes={ attributes } setAttributes={ setAttributes } />
				}
			</InspectorControls>

			<div { ...blockProps }>
				{ needsConfig && (
					<div className="flashblocks-map-placeholder" style={ { height } }>
						<div>
							<p style={ { fontWeight: 600, margin: '0 0 8px' } }>
								{ __( 'Embed API key required', 'flashblocks-map' ) }
							</p>
							<ol style={ { margin: '0 0 8px', paddingLeft: '20px', fontSize: '13px', textAlign: 'left' } }>
								<li>
									<a href="https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com" target="_blank" rel="noopener noreferrer">
										{ __( 'Enable Maps Embed API', 'flashblocks-map' ) }
									</a>
								</li>
								<li>
									<a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
										{ __( 'Create an API key', 'flashblocks-map' ) }
									</a>
								</li>
								<li>
									{ __( 'Add to wp-config.php:', 'flashblocks-map' ) }
									<CopyableCode text={ WP_CONFIG_SNIPPET } />
								</li>
							</ol>
							<p style={ { margin: 0, fontSize: '12px' } }>
								{ __( 'Or switch off Embed API (no key needed).', 'flashblocks-map' ) }
							</p>
						</div>
					</div>
				) }

				{ needsFields && (
					<div className="flashblocks-map-placeholder" style={ { height } }>
						<p>{ getPlaceholderMessage( embedMode ) }</p>
					</div>
				) }

				{ src && (
					<iframe
						title={ attributes.address || __( 'Google Map', 'flashblocks-map' ) }
						src={ src }
						style={ { border: 0, height, width: '100%' } }
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
					/>
				) }
			</div>
		</>
	);
}
