if (typeof TTI ==  "undefined") { var TTI = {}; }
TTI.Storage = function(type,prefix) {
  if (!prefix) { throw('configuration error: set TTI.Storage needs prefix'); 
    return false;
  };
  var self = {};
  self.setItem = function(k,v) {
    return localStorage.setItem(prefix + k,v);
  };
  self.getItem = function(k) {
    return localStorage.getItem(prefix + k);
  };
  
  self.removeItem = function(k) {
    return localStorage.removeItem(prefix + k);
  };
  
  
  self.clear = function() {
    localStorage.clear();
  }
  
  return self;
};