if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.salesTaxGrowthRates = [];

TTI.SalesTaxGrowthRate = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;

  return self;
};


TTI.getSalesTaxGrowthRateForCity = function(city) {
  var qCity = TTI.noParens(city.toLowerCase());
  return TTI.salesTaxGrowthRates.detect(function(o){ 
    var oCity = TTI.noParens(o.spec.city.toLowerCase());
    
    oCity = oCity.replace(/carrolton/,'carrollton');
    qCity = qCity.replace(/carrolton/,'carrollton');
    
    return oCity == qCity; 
    });
};