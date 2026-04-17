=== Flashblocks Map ===
Contributors:      flashblocks
Tags:              block, map, google, location, embed, directions, streetview
Tested up to:      6.8
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Embed a Google Map. Simple mode needs no API key. Embed API mode unlocks directions, street view, and search.

== Description ==

A Gutenberg block with two embed modes, both pure iframe with zero frontend JavaScript.

= Simple Mode (no API key) =
* Address-based location search
* Zoom and height controls
* 4 map types: roadmap, satellite, hybrid, terrain

= Embed API Mode (free API key) =
* 4 modes: place, directions, street view, search
* Directions: shared origin from address field, destination, waypoints, travel mode (driving/walking/bicycling/transit/flying), avoid tolls/ferries/highways, metric/imperial units
* Street View: location coordinates, panorama ID, heading, pitch, field of view
* Search: category queries like "coffee shops in Austin"
* 2 map types: roadmap, satellite
* Language and region localization

= Dynamic rendering =
* Server-side render via render.php — no markup stored in post content
* Ready for future JS API or Leaflet modes with conditional asset loading

== Installation ==

Place `flashblocks-map` in `wp-content/mu-plugins/` and require from `mu-plugins/index.php`:

    require __DIR__ . '/flashblocks-map/flashblocks-map.php';

To enable Embed API mode, add to wp-config.php:

    define( 'GOOGLE_MAPS_EMBED_API_KEY', 'your-key-here' );

The Embed API key is free with no usage limits. Get one at:
https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com

== Changelog ==

= 1.0.0 =
* Dynamic block with render.php for future JS API / Leaflet support
* Shared address field across all modes (origin for directions)
* Removed broken options (traffic layer, info window, view mode)
* Copy button for wp-config snippet in setup instructions
* Direct links to Google Cloud Console for API key setup
* Cleaned up to only expose options that actually work

= 0.2.0 =
* Added Embed API mode with directions, street view, and search
* Added traffic layer and info window toggles for simple mode
* Added language and region support

= 0.1.0 =
* Initial release — iframe-based Google Map embed block
