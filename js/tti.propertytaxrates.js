if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.propertyTaxRates = [];
TTI.PropertyTaxRate = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;
  self.spec.other = 0;
  
  
  
  self.getTotalAdValoremTaxRate = function() {
    var total = 0;

    total += spec.cityAdValoremTaxRate;
    total += spec.countyAdValoremTaxRate;
    total += spec.schoolEqualizationTaxRate;
    ////total += spec.schoolDistrictName;
    total += spec.schoolDistrictAdValoremTaxRate;
    ////////total += spec.averageSchoolDistrictAdValoremTaxRate;
    total += spec.parklandHospital;
    total += spec.dallasCountyCommunityCollegeDistrict;
    total += spec.ellisCountyLateralRoad;
    total += spec.collinCollege;
    total += spec.tarrantCountyHospital;
    total += spec.tarrantCountyCollege;
    total += spec.kaufmanRoadAndBridge;

    total += spec.other;
    
    /***
    total += totalAdValoremTaxRate": 0,
    total += totalAverageAdValoremTaxRate": 0,
    total += acres": 0,
    total += totalValue": 0,
    total += valuePerAcre": 0,
    total += totalPropertyTaxRevenue": 0,
    total += revenuePerAcre": 0
    ***/
    
    
    
    return TTI.precision(total,6);
  };



  self.getTotalAverageTaxRate = function() {
    var total = 0;

    total += spec.cityAdValoremTaxRate;
    total += spec.countyAdValoremTaxRate;
    total += spec.schoolEqualizationTaxRate;
    ////total += spec.schoolDistrictName;
    //total += spec.schoolDistrictAdValoremTaxRate;
    total += spec.averageSchoolDistrictAdValoremTaxRate;
    total += spec.parklandHospital;
    total += spec.dallasCountyCommunityCollegeDistrict;
    total += spec.ellisCountyLateralRoad;
    total += spec.collinCollege;
    total += spec.tarrantCountyHospital;
    total += spec.tarrantCountyCollege;
    total += spec.kaufmanRoadAndBridge;

    total += spec.other;
    
    /***
    total += totalAdValoremTaxRate": 0,
    total += totalAverageAdValoremTaxRate": 0,
    total += acres": 0,
    total += totalValue": 0,
    total += valuePerAcre": 0,
    total += totalPropertyTaxRevenue": 0,
    total += revenuePerAcre": 0
    ***/
    
    
    
    return TTI.precision(total,6);
  };




  
  
  self.getTotalWithAverage = function() {
    var result = self.getTotalAdValoremTaxRate();
    result += spec.averageSchoolDistrictAdValoremTaxRate;
    return result;
  };
  
  self.test = function() {
    var a = spec.totalAdValoremTaxRate;
    var b = self.getTotalAdValoremTaxRate();

    a = TTI.precision(a,6);
    b = TTI.precision(b,6);
    
    if (a !== b) {
      console.log('ERROR on row',spec.row,'a',a,'b',b);
    }
    else {
      console.log('PASS on row',spec.row,'a',a,'b',b);
    }
  
  } 
  
  
  
  return self;
};

TTI.specialRates = [];
TTI.SpecialRate = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;
  return self;
};