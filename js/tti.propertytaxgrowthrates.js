if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.propertyTaxGrowthRates = [];

TTI.PropertyTaxGrowthRate = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;

  return self;
};


TTI.getPropertyTaxGrowthRateForCityCounty = function(city,county) {
  var qCity = TTI.noParens(city.toLowerCase());
  return TTI.propertyTaxGrowthRates.detect(function(o){ 
    var oCity = TTI.noParens(o.spec.city.toLowerCase());
    
    oCity = oCity.replace(/carrolton/,'carrollton');
    qCity = qCity.replace(/carrolton/,'carrollton');
    
    return oCity == qCity && o.spec.county == county; 
    });
};