TTI.Widgets.ProtoTaxInputs = function(spec) {
  var self = TTI.PubSub({});


  self.spec = spec;
  self.tableRow = function(a,b,c){
    var row = DOM.tr();
    row.append(DOM.td(a));
    row.append(DOM.td(b));
    row.append(DOM.td(c));
    return row;
  };



  return self;
};