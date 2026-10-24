# GBoS GEOAI — The Gambia Gully Erosion Risk Screening

Google Earth Engine Code Editor script combining Sentinel-2 surface reflectance and SRTM terrain to create a **relative erosion screening index** for a selected GAUL district in The Gambia.

## Files
- `gee/Gambia_Gully_Erosion_Risk.js` — paste into the Google Earth Engine Code Editor.

## Run
1. Open [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Create a new script and paste the JavaScript file.
3. Click **Run** and wait for region names to load.
4. Select a region and district, then click **RUN EROSION SCREENING**.
5. Use the map layer manager to switch between RGB, NDVI, slope, index, classes, and boundary.

## Method and interpretation
- Sentinel-2 SR Harmonized: cloud/shadow screening using SCL classes; median composite from 1 January 2026 through the current date (year-to-date).
- NDVI = (NIR − Red) / (NIR + Red).
- Vegetation-cover proxy = clamp(1 − NDVI, 0, 1).
- Terrain proxy = clamp(SRTM slope / 45°, 0, 1).
- Relative index = 100 × cover proxy × terrain proxy.
- Class breaks: 0–20 very low; >20–40 low; >40–60 moderate; >60–80 high; >80–100 very high.

**Important limitations:** This is a transparent, uncalibrated screening index. It is not a calibrated USPED/RUSLE implementation and does not estimate soil loss in t/ha/year. It does not explicitly model rainfall erosivity, soil erodibility, contributing area/flow accumulation, sediment transport, or verified gully locations. High values are screening priorities, not confirmed gullies. Validate with field observations, rainfall/soil data and high-resolution imagery before operational use. 2026 values are year-to-date, not a complete annual summary.

## Data and attribution
- Sentinel-2 SR Harmonized: Copernicus / European Space Agency via Google Earth Engine.
- SRTM elevation: USGS / NASA via Google Earth Engine.
- Administrative boundaries: FAO GAUL 2015.
- Platform: Google Earth Engine.

Produced by **Ansu Singhateh**, GIS Analyst | GIS / Cartography Unit | Gambia Bureau of Statistics (GBoS).
