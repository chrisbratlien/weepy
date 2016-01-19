if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.salesTaxRates = [];
TTI.SalesTaxRate = function(spec) {
  var self = TTI.PubSub({});
  self.spec = spec;
  self.spec.other = 0;
  
  
  /**  
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
  *****/
  
  
  
  return self;
};
