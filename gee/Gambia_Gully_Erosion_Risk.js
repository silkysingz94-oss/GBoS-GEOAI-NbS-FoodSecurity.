/*
 * GBoS GEOAI | The Gambia Gully Erosion Risk Screening
 * Google Earth Engine Code Editor script
 * Method: relative screening index using Sentinel-2 NDVI and SRTM terrain.
 * Not calibrated RUSLE/USPED soil loss; do not interpret as t/ha/year.
 * Produced by Ansu Singhateh | GIS / Cartography Unit | GBoS
 */

ui.root.clear();

var C = {
  dark: '#12372A', green: '#2E7D32', pale: '#F4F8F5',
  border: '#D6E1DA', text: '#263238', muted: '#607D8B',
  white: '#FFFFFF', orange: '#EF6C00'
};
var YEAR = 2026;
var START = ee.Date.fromYMD(YEAR, 1, 1);
var END = ee.Date(Date.now()); // current date; 2026 is year-to-date, not a complete year
var PALETTE = ['#006837','#A6D96A','#FFFFBF','#FDAE61','#D73027'];
var CLASS_NAMES = ['Very Low','Low','Moderate','High','Very High'];
var CLASS_LIMITS = [20,40,60,80,100];

var gambia = ee.FeatureCollection('FAO/GAUL/2015/level0')
  .filter(ee.Filter.eq('ADM0_NAME', 'Gambia'));
var regions = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Gambia'));
var districts = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Gambia'));

var dem = ee.Image('USGS/SRTMGL1_003').select('elevation');
var slope = ee.Terrain.slope(dem).rename('slope');

var main = ui.Panel({style:{stretch:'both',backgroundColor:C.pale}});
var header = ui.Panel({layout:ui.Panel.Layout.flow('vertical'),style:{
  backgroundColor:C.dark,padding:'12px 16px',stretch:'horizontal'
}});
header.add(ui.Label('🇬🇲 GBoS GEOAI | GULLY EROSION RISK SCREENING',{
  color:C.white,fontSize:'18px',fontWeight:'bold',margin:'0 0 4px 0'
}));
header.add(ui.Label('Sentinel-2 NDVI + SRTM terrain • 2026 year-to-date • relative screening index',{
  color:'#DDEFE2',fontSize:'11px',margin:'0'
}));
main.add(header);

var body = ui.Panel({layout:ui.Panel.Layout.flow('horizontal'),style:{stretch:'both'}});
var controls = ui.Panel({style:{width:'280px',padding:'12px',backgroundColor:C.white}});
var map = ui.Map();
map.setOptions('HYBRID');
map.setControlVisibility({all:true});
map.style().set({stretch:'both'});
var analytics = ui.Panel({style:{width:'330px',padding:'12px',backgroundColor:C.white}});
body.add(controls); body.add(map); body.add(analytics); main.add(body);
ui.root.add(main);

function heading(t) {
  return ui.Label(t,{fontSize:'13px',fontWeight:'bold',color:C.dark,margin:'8px 0 5px 0'});
}
controls.add(heading('AREA OF INTEREST'));
controls.add(ui.Label('Select a region, then a district. Processing runs only when you click Run.',{
  fontSize:'11px',color:C.muted,whiteSpace:'normal'
}));
var regionSelect = ui.Select({items:[],placeholder:'Loading regions...',style:{stretch:'horizontal',margin:'5px 0'}});
var districtSelect = ui.Select({items:[],placeholder:'Select district',disabled:true,style:{stretch:'horizontal',margin:'5px 0'}});
controls.add(ui.Label('Region',{fontSize:'11px',color:C.muted})); controls.add(regionSelect);
controls.add(ui.Label('District',{fontSize:'11px',color:C.muted})); controls.add(districtSelect);

var yearNote = ui.Label('Period: 1 Jan 2026 to today (year-to-date)',{
  fontSize:'11px',color:C.text,backgroundColor:'#E8F5E9',padding:'8px',margin:'8px 0'
});
controls.add(yearNote);
var run = ui.Button({label:'▶ RUN EROSION SCREENING',style:{
  stretch:'horizontal',backgroundColor:C.green,color:C.white,fontWeight:'bold',margin:'5px 0'
}});
var reset = ui.Button({label:'↻ RESET',style:{stretch:'horizontal',margin:'3px 0 10px 0'}});
controls.add(run); controls.add(reset);

controls.add(heading('MODEL NOTES'));
controls.add(ui.Label(
  'NDVI = (NIR − Red) / (NIR + Red)\n' +
  'Cover proxy C = clamp(1 − NDVI, 0, 1)\n' +
  'Terrain proxy T = slope / 45°, clamped to 0–1\n' +
  'Relative index = 100 × C × T\n\n' +
  'This transparent screening index is not a calibrated USPED/RUSLE model and does not estimate soil loss in t/ha/year. It does not include field-validated soil erodibility, rainfall erosivity, flow accumulation, or sediment transport.',
  {fontSize:'11px',color:C.text,whiteSpace:'pre',backgroundColor:C.pale,padding:'8px'}
));
controls.add(heading('RISK LEGEND'));
var legend = ui.Panel({style:{padding:'4px 0'}});
for (var i=0;i<CLASS_NAMES.length;i++) {
  var lo = i===0 ? '0–20' : (CLASS_LIMITS[i-1]+'–'+CLASS_LIMITS[i]);
  legend.add(ui.Panel({layout:ui.Panel.Layout.flow('horizontal'),widgets:[
    ui.Label('',{backgroundColor:PALETTE[i],padding:'7px',margin:'0 7px 3px 0',width:'18px'}),
    ui.Label(CLASS_NAMES[i]+' ('+lo+')',{fontSize:'11px',color:C.text,margin:'2px 0'})
  ]}));
}
controls.add(legend);

analytics.add(heading('ANALYSIS STATUS'));
var status = ui.Label('Choose a region and district, then run the analysis.',{
  fontSize:'11px',color:C.muted,whiteSpace:'normal'
});
analytics.add(status);
analytics.add(heading('KEY INDICATORS'));
var kpiPanel = ui.Panel({style:{backgroundColor:C.pale,padding:'8px',border:'1px solid '+C.border}});
var kpiNdvi = ui.Label('Mean NDVI: —',{fontSize:'12px',color:C.text,margin:'4px'});
var kpiRisk = ui.Label('Mean index: —',{fontSize:'12px',color:C.text,margin:'4px'});
var kpiHigh = ui.Label('High/very high area: —',{fontSize:'12px',color:C.text,margin:'4px'});
var kpiImages = ui.Label('Images used: —',{fontSize:'12px',color:C.text,margin:'4px'});
kpiPanel.add(kpiNdvi);kpiPanel.add(kpiRisk);kpiPanel.add(kpiHigh);kpiPanel.add(kpiImages);
analytics.add(kpiPanel);
analytics.add(heading('AREA BY RISK CLASS'));
var classPanel = ui.Panel({style:{padding:'7px',border:'1px solid '+C.border}});
classPanel.add(ui.Label('Run analysis to calculate class areas.',{fontSize:'11px',color:C.muted}));
analytics.add(classPanel);
analytics.add(heading('INTERPRETATION'));
analytics.add(ui.Label(
  'High index values identify places where low vegetation cover coincides with steeper terrain. They indicate screening priority only—not confirmed gullies or measured erosion. Check results against field observations, high-resolution imagery, rainfall, soil information, and local knowledge.',
  {fontSize:'11px',color:C.text,whiteSpace:'normal'}
));
analytics.add(ui.Label('Produced by Ansu Singhateh | GIS Analyst • GIS / Cartography Unit • Gambia Bureau of Statistics (GBoS)',{
  fontSize:'10px',color:C.muted,whiteSpace:'normal',margin:'14px 0 0 0'
}));

var currentLayers = [];
function clearResultLayers() {
  currentLayers.forEach(function(layer){ map.layers().remove(layer); });
  currentLayers = [];
}
function addLayer(image, vis, name, shown) {
  var layer = ui.Map.Layer(image,vis,name,shown);
  map.layers().add(layer); currentLayers.push(layer);
}
function resetAnalytics() {
  kpiNdvi.setValue('Mean NDVI: —'); kpiRisk.setValue('Mean index: —');
  kpiHigh.setValue('High/very high area: —'); kpiImages.setValue('Images used: —');
  classPanel.clear();
  classPanel.add(ui.Label('Run analysis to calculate class areas.',{fontSize:'11px',color:C.muted}));
}

function maskedS2(image) {
  var scl = image.select('SCL');
  var mask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9))
    .and(scl.neq(10)).and(scl.neq(11));
  return image.updateMask(mask).select(['B2','B3','B4','B8'],['blue','green','red','nir'])
    .copyProperties(image,['system:time_start']);
}
function runAnalysis() {
  var regionName = regionSelect.getValue();
  var districtName = districtSelect.getValue();
  if (!regionName || !districtName) {
    status.setValue('Select both a region and district before running.'); return;
  }
  status.setValue('Running year-to-date Sentinel-2 analysis…');
  resetAnalytics(); clearResultLayers();
  var selected = districts
    .filter(ee.Filter.eq('ADM1_NAME',regionName))
    .filter(ee.Filter.eq('ADM2_NAME',districtName));
  var geom = selected.geometry();
  map.centerObject(selected,11);

  var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(START,END)
    .filterBounds(geom)
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE',80))
    .map(maskedS2);
  var count = collection.size();
  count.evaluate(function(n) {
    if (n === null || n === 0) {
      status.setValue('No Sentinel-2 scenes available for this area and period. Try another district or date window.');
      return;
    }
    var composite = collection.median().clip(geom);
    var ndvi = composite.normalizedDifference(['nir','red']).rename('NDVI').clamp(-1,1);
    var cover = ee.Image(1).subtract(ndvi).clamp(0,1);
    var terrain = slope.divide(45).clamp(0,1);
    var index = cover.multiply(terrain).multiply(100).rename('risk_index').clip(geom);
    var classes = ee.Image(0).where(index.gt(20),1).where(index.gt(40),2)
      .where(index.gt(60),3).where(index.gt(80),4).rename('risk_class').clip(geom);

    addLayer(composite,{bands:['red','green','blue'],min:0,max:3000},'Sentinel-2 RGB (median)',false);
    addLayer(ndvi,{min:-0.2,max:0.8,palette:['#8c2d04','#fdae6b','#ffffcc','#78c679','#006837']},'NDVI',false);
    addLayer(slope,{min:0,max:30,palette:['#f7f7f7','#969696','#252525']},'Slope (degrees)',false);
    addLayer(index,{min:0,max:100,palette:PALETTE},'Relative erosion screening index',true);
    addLayer(classes,{min:0,max:4,palette:PALETTE},'Relative risk classes',false);
    addLayer(selected.style({color:'FFFFFF',fillColor:'00000000',width:2}),{},'Selected district boundary',true);

    var reducer = {geometry:geom,scale:30,bestEffort:true,maxPixels:1e8,tileScale:4};
    var ndviMean = ndvi.reduceRegion({reducer:ee.Reducer.mean(),geometry:geom,scale:20,bestEffort:true,maxPixels:1e8,tileScale:4}).get('NDVI');
    var indexStats = index.reduceRegion({reducer:ee.Reducer.mean().combine({
      reducer2:ee.Reducer.max(),sharedInputs:true}),geometry:geom,scale:30,bestEffort:true,maxPixels:1e8,tileScale:4});
    var areaImage = ee.Image.pixelArea().divide(10000).rename('ha').addBands(classes);
    var grouped = areaImage.reduceRegion({
      reducer:ee.Reducer.sum().group({groupField:1,groupName:'class'}),
      geometry:geom,scale:30,bestEffort:true,maxPixels:1e8,tileScale:4
    });
    var totalHa = ee.Image.pixelArea().divide(10000).reduceRegion({
      reducer:ee.Reducer.sum(),geometry:geom,scale:30,bestEffort:true,maxPixels:1e8,tileScale:4
    }).get('area');
    var highHa = ee.Image.pixelArea().divide(10000).updateMask(classes.gte(3)).reduceRegion({
      reducer:ee.Reducer.sum(),geometry:geom,scale:30,bestEffort:true,maxPixels:1e8,tileScale:4
    }).get('area');

    ee.Dictionary({ndvi:ndviMean,mean:indexStats.get('risk_index_mean'),
      max:indexStats.get('risk_index_max'),groups:grouped.get('groups'),
      totalHa:totalHa,highHa:highHa}).evaluate(function(result) {
      if (!result) { status.setValue('Statistics could not be returned. Check the Earth Engine Console for errors.'); return; }
      kpiNdvi.setValue('Mean NDVI: '+(result.ndvi==null?'No data':Number(result.ndvi).toFixed(3)));
      kpiRisk.setValue('Mean index: '+(result.mean==null?'No data':Number(result.mean).toFixed(1))+' / 100');
      var pct = result.totalHa && result.highHa!=null ? 100*result.highHa/result.totalHa : null;
      kpiHigh.setValue('High/very high area: '+(pct==null?'No data':pct.toFixed(1)+'%'));
      kpiImages.setValue('Images used: '+n);
      classPanel.clear();
      var groups = result.groups || [];
      groups.sort(function(a,b){return Number(a.class)-Number(b.class);});
      groups.forEach(function(g) {
        var idx = Number(g.class);
        var ha = Number(g.sum || 0);
        classPanel.add(ui.Label(CLASS_NAMES[idx]+': '+ha.toLocaleString(undefined,{maximumFractionDigits:1})+' ha',{
          fontSize:'11px',color:C.text,margin:'3px 0'
        }));
      });
      status.setValue('Complete: '+regionName+' → '+districtName+' • '+YEAR+' year-to-date. Index maximum: '+
        (result.max==null?'n/a':Number(result.max).toFixed(1))+'/100.');
      print('GBoS GEOAI erosion screening summary',result);
      print('Sentinel-2 scenes used',n);
      print('Selected district feature count',selected.size());
    });
  });
}

regionSelect.onChange(function(regionName) {
  districtSelect.items().reset([]); districtSelect.setDisabled(true);
  if (!regionName) return;
  status.setValue('Loading districts…');
  districts.filter(ee.Filter.eq('ADM1_NAME',regionName))
    .aggregate_array('ADM2_NAME').distinct().sort().evaluate(function(names) {
      names = names || [];
      districtSelect.items().reset(names);
      districtSelect.setDisabled(names.length===0);
      status.setValue(names.length ? 'Select a district and run the screening.' : 'No districts found for this region. Verify GAUL names.');
    });
});
districtSelect.onChange(function(name) {
  if (!name || !regionSelect.getValue()) return;
  var selected = districts.filter(ee.Filter.eq('ADM1_NAME',regionSelect.getValue()))
    .filter(ee.Filter.eq('ADM2_NAME',name));
  map.centerObject(selected,11);
});
run.onClick(runAnalysis);
reset.onClick(function() {
  regionSelect.setValue(null,false); districtSelect.items().reset([]); districtSelect.setDisabled(true);
  clearResultLayers(); resetAnalytics(); status.setValue('Reset. Choose a region and district.');
  map.centerObject(gambia,8);
  map.addLayer(gambia.style({color:'FFFFFF',fillColor:'00000000',width:2}),{},'The Gambia boundary');
});

regions.aggregate_array('ADM1_NAME').distinct().sort().evaluate(function(names) {
  names = names || [];
  regionSelect.items().reset(names);
  regionSelect.setDisabled(names.length===0);
  status.setValue(names.length ? 'Ready. Select a region and district.' : 'Could not load GAUL regions. Check the Earth Engine Console.');
});
map.centerObject(gambia,8);
map.addLayer(gambia.style({color:'FFFFFF',fillColor:'00000000',width:2}),{},'The Gambia boundary');
print('GBoS GEOAI | Gambia Gully Erosion Risk Screening');
print('Study area feature count',gambia.size());
print('Administrative regions',regions.aggregate_array('ADM1_NAME').distinct().sort());
print('Administrative districts',districts.size());
