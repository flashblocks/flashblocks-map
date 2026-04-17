=== Flashblocks Map ===
Contributors:      flashblocks
Tags:              block, map, google, location, embed, directions, streetview
Tested up to:      6.8
Stable tag:        0.2.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Embed a Google Map. Simple mode needs no API key. Embed API mode unlocks directions, street view, and search.

== Description ==

A Gutenberg block with two embed modes:

= Simple Mode (no API key) =
* Address-based location search
* Zoom, height, 4 map types (road, satellite, hybrid, terrain)
* Traffic layer toggle
* Info window toggle

= Embed API Mode (free API key) =
* 5 modes: place, view, directions, street view, search
* Directions: origin, destination, waypoints, travel mode, avoid, units
* Street View: location, panorama ID, heading, pitch, field of view
* Language and region on all modes

Both modes are pure iframe — zero extra JS on the frontend.

== Installation ==

Place `flashblocks-map` in `wp-content/mu-plugins/` and require from `mu-plugins/index.php`.

To enable Embed API mode, add to wp-config.php:

    define( 'GOOGLE_MAPS_EMBED_API_KEY', 'your-key-here' );

== Changelog ==

= 0.2.0 =
* Added Embed API mode with directions, street view, and search
* Added traffic layer and info window toggles for simple mode
* Added hybrid and terrain map types
* Added language and region support

= 0.1.0 =
* Initial release — iframe-based Google Map embed block
