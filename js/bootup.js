TTI.replaceWordChars = function(text) {
    var s = text;
    // smart single quotes and apostrophe
    s = s.replace(/[\u2018\u2019\u201A]/g, "\'");
    // smart double quotes
    s = s.replace(/[\u201C\u201D\u201E]/g, "\"");
    // ellipsis
    s = s.replace(/\u2026/g, "...");
    // dashes
    s = s.replace(/[\u2013\u2014]/g, "-");
    // circumflex
    s = s.replace(/\u02C6/g, "^");
    // open angle bracket
    s = s.replace(/\u2039/g, "<");
    // close angle bracket
    s = s.replace(/\u203A/g, ">");
    // spaces
    s = s.replace(/[\u02DC\u00A0]/g, " ");


    //91 ec 236, left single quote
    //92 ed 237, right single quote
    
    //single quotes
    s = s.replace(/\u00ec/,"'");
    s = s.replace(/\u00ed/,"'");

    //93 ee 238, left double quote
    //94 ef 239, right double quote

    //double quotes
    s = s.replace(/\u00ee/,"\"");
    s = s.replace(/\u00ef/,"\"");
    
    
   //another right apos 
    s = s.replace(/\u2018/,"'");
    s = s.replace(/\u2019/,"'");

    
    return s;
};



TTI.inspectMSText = function(raw) {
  console.log('inspecting!!');
  var thresh = 128;
  var map = {
    '\u00ed': ""
  };
  for (var i = 0; i < raw.length; i++) { 
    var charCode = raw.charCodeAt(i);
    var char = raw.charAt(i);    
    if (charCode > thresh) {
      console.log('raw',raw[i],char,charCode);   
    }
  }
};


TTI.scrollTop = function() {
  var doc = document.documentElement, body = document.body;
  var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
  var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);

  /////console.log('scrollTop, top is',top);

  return top;
};


TTI.documentWidth = function() {
  var w=window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  return w;
}




TTI.getUrlVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}



TTI.tableRow = function(a,b,c){
    var row = DOM.tr();
    row.append(DOM.td(a));
    row.append(DOM.td(b));
    row.append(DOM.td(c));
    return row;
  };




TTI.keycodes = {
    TAB: 9,
    PERIOD: 46,
    DOWN: 40,
    UP: 38,
    LEFT: 37,
    RIGHT: 39
  };



TTI.cellValidator = function(e) {
  ////console.log('AA asdfasdf e.keyCode',e.keyCode,e);
  if (e.keyCode == TTI.keycodes.TAB) { return true; }
  var c = e.which;
  ///console.log('c',c);
  
  var periodMatch = this.value.match(/\./);
  
  /////console.log('periodMatch',periodMatch);

  //deny multiple periods before accepting periods
  if (c == TTI.keycodes.PERIOD && periodMatch) {
      return false;       
  }
  //now accept (a single) period  
  if (e.keyCode == TTI.keycodes.PERIOD) { return true; }
  if (c < 48 || c > 57) {
        return false; 
  }    
  return true;      
};


TTI.slugify = function(str) {
  var result = str.toLowerCase();
  result = result.replace(/\//g,'-');
  result = result.replace(/\./g,'-');
  result = result.replace(/\:/g,'-');
  result = result.replace(/\ /g,'-');
  result = result.replace(/\&/g,'-');
  result = result.replace(/-/g,'-');
  result = result.replace(/--/g,'-');
  result = result.replace(/__/g,'-');
  result = result.replace(/\_\_/g,'-');

  return result;  
};


TTI.tagify = function(input) {
  if (!input) { return []; }
  var temp = input.toLowerCase();
  var parts = temp.split(/\/|\+|\ |\-/);
  var noblanks = parts.reject(function(o){ return o.length == 0; });
  return noblanks;
};


TTI.moneyToFloat = function(currency) {
  var number = Number(currency.replace(/[^0-9\.]+/g,""));
  return number;
};


TTI.precision = function(value,digits) {
  var coeff = Math.pow(10,digits);
  return Math.round(value * coeff) / coeff;
};

TTI.importJSON = function(url,callback) {
    jQuery.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      success: callback
    });
};

TTI.importCSV = function(url,callback) {
    jQuery.ajax({
      type: 'GET',
      url: url,
      /////dataType: 'json',
      success: callback
    });
};



TTI.getCounties = function() {
  return ['Collin','Dallas','Denton','Ellis','Rockwall','Tarrant','Kaufman'];
};



TTI.distributionFields = {};
TTI.distributionFields.propertyTax = [
  { label: 'City', property: 'cityAdValoremTaxRate' },
  { label: 'County', property: 'countyAdValoremTaxRate' },
  { label: 'School Equalization', property: 'schoolEqualizationTaxRate' },
  { label: 'Average School or Manual Enter', property: 'averageSchoolDistrictAdValoremTaxRate' },
  { label: 'Parkland Hospital', property: 'parklandHospital' },
  { label: 'Dallas County Community College District', property: 'dallasCountyCommunityCollegeDistrict' },
  { label: 'Ellis County Lateral Road', property: 'ellisCountyLateralRoad' },
  { label: 'Collin College', property: 'collinCollege' },
  { label: 'Tarrant County Hospital', property: 'tarrantCountyHospital' },
  { label: 'Tarrant County College', property: 'tarrantCountyCollege' },
  { label: 'Road & Bridge (Kaufman County)', property: 'kaufmanRoadAndBridge' },
  { label: 'Other', property: 'other' }
];


TTI.distributionFields.salesTax = [
  { label: 'City', property: 'cityRate' },
  { label: 'Economic Dev Sec 4A', property: 'economicDevSec4A' },
  { label: 'Economic Dev Sec 4B', property: 'economicDevSec4B' },
  { label: 'Dallas MTA', property: 'dallasMTA' },
  { label: 'Denton County Transportation Authority', property: 'dentonCountyTransportationAuthority' },
  { label: 'Property Tax Relief', property: 'propertyTaxRelief' },
  { label: 'Sport & Comm Venue', property: 'sportAndCommVenue' },
  { label: 'Street Maintenance / repair', property: 'streetMaintenanceRepair' },
  { label: 'Fire Control District', property: 'fireControlDistrict' },
  { label: 'Crime Control District', property: 'crimeControlDistrict' },
];


TTI.landUseTypes = [
  "Commercial", 
  "Industrial", 
  "MF Residential", 
  "No Data", 
  "Open Space/ Agriculture", 
  "Other", 
  "Rail", 
  "SF Residential", 
  "Utilities", 
  "Vacant"
];

TTI.landUseSlug = function(city,property) {
    var slug = TTI.slugify('land-use-' + TTI.noParens(city) + '-' + property);
    return slug;
};

TTI.specialRateSlug = function(rate) {
  var slug = TTI.slugify('special-rate-' + rate.spec.County + '-' + rate.spec.Entity);
  return slug;
};

TTI.propertyTaxRateSlug = function(rate,property) {
  var slug = TTI.slugify('property-tax-rate-' + rate.spec.county + '-' + TTI.noParens(rate.spec.city) + '-' + rate.spec.schoolDistrictName + '-' + property);
  return slug;
};

TTI.salesTaxRateSlug = function(rate,property) {
  ///console.log('r',rate,'rate?');
  var slug = TTI.slugify('sales-tax-rate-' + TTI.noParens(rate.spec.city) + '-' + property);
  return slug;
};

TTI.growthRateSlug = function(rate,property) {
  var slug = TTI.slugify('growth-rate-' + TTI.noParens(rate.spec.city) + '-' + '-' + property);
  return slug;
};





TTI.serviceTypeItems = [
  { label: 'Rail', property: 'Rail' },
  { label: 'Bus Rapid Transit (BRT)', property: 'BRT' },
  { label: 'Streetcar', property: 'StreetCar' },
];





TTI.counties = TTI.getCounties();

TTI.propertyTaxRates = [];
TTI.specialRates = [];
TTI.salesTaxRates = [];

TTI.propertyTaxLandUseRecords = [];
TTI.salesTaxLandUseRecords = [];

TTI.propertyTaxGrowthRates = [];
TTI.salesTaxGrowthRates = [];

TTI.salesTax4A4BRecords = [];


TTI.gurus = [];



var waiter = TTI.Widgets.Procrastinator({ timeout: 100 });
var wait500 = TTI.Widgets.Procrastinator({ timeout: 500 });
var snail = TTI.Widgets.Procrastinator({ timeout: 1000 });

TTI.storage = TTI.Storage('local','DART::');


var campfire = TTI.PubSub({});

TTI.urlVars = TTI.getUrlVars();

            
TTI.noParens = function(o) {
  if (!o) { return o; }
  return o.replace(/\(.*\)/,'').trim();
};




