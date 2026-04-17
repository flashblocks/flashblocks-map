<?php
/**
 * Server-side rendering for the flashblocks/map block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block inner content (empty for dynamic blocks).
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$use_embed_api = ! empty( $attributes['useEmbedApi'] );
$height        = isset( $attributes['height'] ) ? absint( $attributes['height'] ) : 400;
$zoom          = isset( $attributes['zoom'] ) ? absint( $attributes['zoom'] ) : 12;
$address       = isset( $attributes['address'] ) ? $attributes['address'] : 'Austin, TX';

$src = '';

if ( $use_embed_api ) {
	$api_key = defined( 'GOOGLE_MAPS_EMBED_API_KEY' ) ? GOOGLE_MAPS_EMBED_API_KEY : '';
	if ( $api_key ) {
		$src = flashblocks_map_build_embed_api_src( $attributes, $api_key );
	}
} else {
	$src = flashblocks_map_build_simple_src( $attributes );
}

if ( ! $src ) {
	return;
}

$title = esc_attr( $address ?: __( 'Google Map', 'flashblocks-map' ) );

// Future: conditionally enqueue JS API or Leaflet assets here based on attributes.
// e.g. if ( $attributes['renderMode'] === 'leaflet' ) { wp_enqueue_script(...); }

printf(
	'<div %s><iframe title="%s" src="%s" style="border:0;height:%dpx;width:100%%" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>',
	get_block_wrapper_attributes(),
	$title,
	esc_url( $src ),
	$height
);
