TTI.Widgets.PageInputs = function(spec) {
  var self = TTI.Widgets.ProtoTaxInputs(spec);

  var waiter = TTI.Widgets.Procrastinator({ timeout: 200 });

  var dropdowns = DOM.ul().addClass('dropdowns');
  var boxes = DOM.div().addClass('boxes');
  var specials = DOM.div().addClass('specials');
  var sliders = DOM.div().addClass('sliders');



  var subtotalCell = DOM.td().addClass('value-cell');


  var landUseHeading;

  var guru = false;
  

  var myRate = false;
  var origRate = false;
  var origLandUse = false;
  

  spec.baseRate = false;
  spec.selectedSpecialRates = [];

  spec.landUse = {
    change: false,
    changeYear: 2018
  };
  


  };