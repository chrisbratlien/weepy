if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.salesTax4A4BRecords = [];
TTI.SalesTax4A4BRecord = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;

  return self;
};


TTI.getSalesTax4A4BRecordForCity = function(city) {
  var qCity = TTI.noParens(city.toLowerCase());
  return TTI.salesTax4A4BRecords.detect(function(o){ 
    var oCity = TTI.noParens(o.spec.city.toLowerCase());
    
    oCity = oCity.replace(/carrolton/,'carrollton');
    qCity = qCity.replace(/carrolton/,'carrollton');
    
    return oCity == qCity; 
    });
};