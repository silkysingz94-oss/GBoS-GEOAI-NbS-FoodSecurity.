# GBoS GEOAI — Nature-based Solutions, Climate Adaptation & Food Security

A static HTML/JavaScript research dashboard designed for GitHub Pages. It fetches data directly from public APIs in the browser; no API key or backend is configured in this project.

## Features
- Leaflet interactive map with street, satellite and terrain basemaps.
- Climate series fetched from the Open-Meteo Archive API for representative locations in The Gambia: daily precipitation, mean temperature and topsoil moisture.
- OpenStreetMap / Overpass query for mapped wetlands, mangroves, woodlands, forests, recreation grounds and protected-area features.
- World Bank API series for national food production index, agriculture/forestry/fishing share of GDP, forest area and rural population.
- Charts, indicator table, persistent map legend, source notes and CSV/GeoJSON exports.
- Responsive three-column layout and refresh controls.

## Publish with GitHub Pages
1. Create a new **public** GitHub repository, for example `GBoS-GEOAI-NbS-FoodSecurity`.
2. Upload `index.html` and `README.md` to the repository root on the default branch (`main`).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for the Pages deployment and open the URL GitHub shows, usually `https://YOUR-USERNAME.github.io/GBoS-GEOAI-NbS-FoodSecurity/`.

## Live data behaviour
The browser fetches APIs when the page loads and when **Refresh live data** is clicked. Open-Meteo provides the climate values at representative point locations. Values are not district-wide averages and are not a substitute for gridded analysis. The Overpass API is community-mapped and may return incomplete data or temporarily rate-limit requests. World Bank indicators are country-level context, not household food-security measurements.

## Data sources
- Open-Meteo Archive API: https://open-meteo.com/en/docs/historical-weather-api
- OpenStreetMap: https://www.openstreetmap.org/ and Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
- World Bank Indicators API: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
- Leaflet: https://leafletjs.com/
- Chart.js: https://www.chartjs.org/

## Research and interpretation notes
- The dashboard does not claim that climate conditions or mapped nature features cause changes in food security.
- Food production index is not the same as household food security. Use validated GBoS, WFP, FAO or other appropriate survey/assessment data for direct food-security outcomes, with suitable permissions and metadata.
- OpenStreetMap features are not an authoritative inventory of mangroves, wetlands, forests or protected areas.
- The `Vegetation / NbS features` map selection describes mapped ecosystem features. It does **not** display satellite-derived NDVI. NDVI should be added using a documented remote-sensing source and a reproducible processing workflow before using that label as an observation.
- Before publication, record the access date, inspect API responses, validate locations/units, document missing data and review the relevant source licences/terms.

## Credits
Produced by Ansu Singhateh | GIS / Cartography Unit | Gambia Bureau of Statistics (GBoS). GBoS GEOAI · Research and educational use.

This is an independent research/educational prototype and is not an official GBoS statistical release unless formally reviewed and approved by GBoS.
