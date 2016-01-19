if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.propertyTaxLandUseRecords = [];
TTI.PropertyTaxLandUseRecord = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;
  
  self.usage = function() {
    return spec.acres / spec.totalAcres;
  };


  self.baseCase = function(year,growthRate) {
    var result = 0;
    var grCoeff = (1 + (growthRate/100)); 
    var totalDollarsPerAcre = spec.totalDollarsPerAcre;


    function helper(yr,coeff) {
      if (yr <2015) { return 0;}
      if (yr == 2015) {
        return coeff * totalDollarsPerAcre; 
      }
      return coeff * helper(yr-1,coeff);
    }
    
    result = helper(year,grCoeff);
  
    return result;
  };


  self.newDollars = function(year,env) {
    var result = 0;  
    var civCoeff = (1 + (env.changeInValueStation/100));
    var grCoeff = (1 + (env.landValueGrowthRateStation/100)); 
    var dollarsPerAcre = spec.dollarsPerAcre;
  
    function helper(yr) {
      if (yr < 2015) {return 0;}
      if (yr == 2015) {
        return civCoeff * dollarsPerAcre;
      }
      return grCoeff * helper(yr-1);
    }  
    result = helper(year);
    return result;
  };


  self.stationCase = function(year,env) {
    var result = 0;
    function helper(yr) {
      if (yr < 2015) { return 0;}
      if (env.landUse.change && yr >= env.landUse.changeYear) { //the "Changed case"
        var typeUseFraction = env.landUse[spec.type] / 100;
        var nd = self.newDollars(yr,env);
        return nd * typeUseFraction * spec.totalAcres; //IMPORTANT TO USE TOTAL ACRES
      }
      return self.newDollars(yr,env) * spec.acres; //unchanged
    }
    result = helper(year);
    return result;
  };
   
  
  self.constituents = function() {
  
    var result = TTI.landUseTypes.map(function(type){ 
      var hit = TTI.propertyTaxLandUseRecords.detect(function(o){
        return o.spec.city == spec.city && o.spec.type == type;
      });
      return hit;
    });
    
    return result;
  };
  
  self.totalStationCase = function(year,env) {
    var result = 0;
    self.constituents().each(function(o){ 
      result += o.stationCase(year,env); 
    });
    
    return result;
  };
  

  return self;
};





////    
//// var x = TTI.getLandUseRecordForCityType('Addison','Commercial')
//// x.stationCase(2015, { landUse: { Commercial: 50 }, landUseChangeYear: 2018, landValueGrowthRate: 3.2, landValueGrowthRateStation: 4.7, changeInValueStation: 8.2 })

//  x.totalStationCase(2015, { landUse: { Commercial: 50 }, landUseChangeYear: 2018, landValueGrowthRate: 3.2, landValueGrowthRateStation: 4.7, changeInValueStation: 8.2 })
//  4065594377.442038


TTI.getPropertyTaxLandUseRecordForCityType = function(city,type) {
  var qCity = TTI.noParens(city.toLowerCase());
  return TTI.propertyTaxLandUseRecords.detect(function(o){ 
    var oCity = TTI.noParens(o.spec.city.toLowerCase());

    oCity = oCity.replace(/carrolton/,'carrollton');
    qCity = qCity.replace(/carrolton/,'carrollton');

    return oCity == qCity && o.spec.type == type; 
  });
};