<?php
/**
 * Plugin Name:       Flashblocks Map
 * Description:       Embed a Google Map. Simple mode needs no API key. Embed API mode unlocks directions, street view, and search.
 * Version:           1.0.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            Flashblocks
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       flashblocks-map
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function flashblocks_map_block_init() {
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection(
			__DIR__ . '/build',
			__DIR__ . '/build/blocks-manifest.php'
		);
		return;
	}

	if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
		wp_register_block_metadata_collection(
			__DIR__ . '/build',
			__DIR__ . '/build/blocks-manifest.php'
		);
	}

	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		register_block_type( __DIR__ . "/build/{$block_type}" );
	}
}
add_action( 'init', 'flashblocks_map_block_init' );

function flashblocks_map_editor_assets() {
	$api_key = defined( 'GOOGLE_MAPS_EMBED_API_KEY' ) ? GOOGLE_MAPS_EMBED_API_KEY : '';

	wp_register_script( 'flashblocks-map-config', false );
	wp_enqueue_script( 'flashblocks-map-config' );
	wp_add_inline_script(
		'flashblocks-map-config',
		'window.flashblocksMap = ' . wp_json_encode( array( 'apiKey' => $api_key ) ) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'flashblocks_map_editor_assets' );

/**
 * Build the simple (keyless) embed URL.
 */
function flashblocks_map_build_simple_src( $attributes ) {
	$address        = isset( $attributes['address'] ) ? $attributes['address'] : 'Austin, TX';
	$zoom           = isset( $attributes['zoom'] ) ? absint( $attributes['zoom'] ) : 12;
	$simple_map_type = isset( $attributes['simpleMapType'] ) ? $attributes['simpleMapType'] : 'm';

	return add_query_arg(
		array(
			'q'      => $address,
			'z'      => $zoom,
			't'      => $simple_map_type,
			'output' => 'embed',
		),
		'https://maps.google.com/maps'
	);
}

/**
 * Build the Embed API URL.
 */
function flashblocks_map_build_embed_api_src( $attributes, $api_key ) {
	$mode     = isset( $attributes['embedMode'] ) ? $attributes['embedMode'] : 'place';
	$zoom     = isset( $attributes['zoom'] ) ? absint( $attributes['zoom'] ) : 12;
	$map_type = isset( $attributes['mapType'] ) ? $attributes['mapType'] : 'roadmap';
	$address  = isset( $attributes['address'] ) ? $attributes['address'] : '';
	$language = isset( $attributes['language'] ) ? $attributes['language'] : '';
	$region   = isset( $attributes['region'] ) ? $attributes['region'] : '';
	$center   = isset( $attributes['center'] ) ? $attributes['center'] : '';

	$params = array(
		'key'     => $api_key,
		'zoom'    => $zoom,
		'maptype' => $map_type,
	);

	if ( $language ) {
		$params['language'] = $language;
	}
	if ( $region ) {
		$params['region'] = $region;
	}

	switch ( $mode ) {
		case 'place':
			$params['q'] = $address;
			if ( $center ) {
				$params['center'] = $center;
			}
			break;

		case 'directions':
			$destination = isset( $attributes['dirDestination'] ) ? $attributes['dirDestination'] : '';
			if ( ! $address || ! $destination ) {
				return '';
			}
			$params['origin']      = $address;
			$params['destination'] = $destination;
			if ( ! empty( $attributes['dirWaypoints'] ) ) {
				$params['waypoints'] = $attributes['dirWaypoints'];
			}
			if ( ! empty( $attributes['dirMode'] ) ) {
				$params['mode'] = $attributes['dirMode'];
			}
			if ( ! empty( $attributes['dirAvoid'] ) ) {
				$params['avoid'] = $attributes['dirAvoid'];
			}
			if ( ! empty( $attributes['dirUnits'] ) ) {
				$params['units'] = $attributes['dirUnits'];
			}
			break;

		case 'streetview':
			$sv_location = isset( $attributes['svLocation'] ) ? $attributes['svLocation'] : '';
			$sv_pano     = isset( $attributes['svPano'] ) ? $attributes['svPano'] : '';
			if ( ! $sv_location && ! $sv_pano ) {
				return '';
			}
			if ( $sv_pano ) {
				$params['pano'] = $sv_pano;
			}
			if ( $sv_location ) {
				$params['location'] = $sv_location;
			}
			if ( ! empty( $attributes['svHeading'] ) ) {
				$params['heading'] = $attributes['svHeading'];
			}
			if ( ! empty( $attributes['svPitch'] ) ) {
				$params['pitch'] = $attributes['svPitch'];
			}
			if ( ! empty( $attributes['svFov'] ) && 90 !== (int) $attributes['svFov'] ) {
				$params['fov'] = $attributes['svFov'];
			}
			break;

		case 'search':
			if ( ! $address ) {
				return '';
			}
			$params['q'] = $address;
			if ( $center ) {
				$params['center'] = $center;
			}
			break;

		default:
			$params['q'] = $address;
			break;
	}

	return add_query_arg( $params, 'https://www.google.com/maps/embed/v1/' . $mode );
}
