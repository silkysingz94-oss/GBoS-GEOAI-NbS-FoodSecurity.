# GBoS GEOAI | Gully Erosion Screening Explorer

Static GitHub Pages interface for the Gambia gully erosion screening workflow. Includes an interactive Leaflet map, basemap switching, methodology, threshold legend, limitations, and links to the Earth Engine analysis.

## Website
Once the Pages deployment workflow completes, visit:
https://silkysingz94-oss.github.io/GBoS-GEOAI-NbS-FoodSecurity./

## Main files
- `index.html` — static website entry point
- `gee/Gambia_Gully_Erosion_Risk.js` — Google Earth Engine screening workflow
- `gee/README-Gully-Erosion.md` — methodology and instructions
- `.github/workflows/pages.yml` — automatic GitHub Pages deployment

## Important
The website is an explanatory static frontend; it does not execute Earth Engine processing in the browser and does not present unverified risk values as observations. To show actual district statistics, export verified results from Earth Engine to public CSV/GeoJSON and integrate them deliberately. Do not publish sensitive coordinates or non-public official datasets.

## Attribution
Map tiles: OpenStreetMap contributors, Esri World Imagery, OpenTopoMap and CARTO. Analysis references Sentinel-2 and SRTM through Google Earth Engine, with administrative context from FAO GAUL 2015.

Produced by Ansu Singhateh | GIS Analyst | GIS / Cartography Unit | Gambia Bureau of Statistics (GBoS).
