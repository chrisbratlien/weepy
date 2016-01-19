TTI.Widgets.SalesTaxInputs = function(spec) {
  var self = TTI.Widgets.ProtoTaxInputs(spec);

  var waiter = TTI.Widgets.Procrastinator({ timeout: 200 });
  
  self.spec = spec;
  
  var dropdowns = DOM.div().addClass('dropdowns');
  
  
  
  var boxes = DOM.div().addClass('boxes');
  ////var specials = DOM.div().addClass('specials');
  var sliders = DOM.div().addClass('sliders');



  var remainCell = DOM.td().addClass('value-cell');
  var subtotalCell = DOM.td().addClass('value-cell');
  
  
  var landUseHeading;


  spec.standardGrowthRate = 0;
  spec.inflation = 0;
  spec.landUseChangeGrowthRateStation = 0;


  spec.landUse = {
    change: false,
    changeYear: 2018,
    Commercial: 123,
    Vacant: 2222
  };

  

  var myRate = false;
  var origRate = false;
  var origLandUse = false;
  
  var guru;


  guru = TTI.SalesTaxGuru({ 
    candidates: TTI.salesTaxRates,
    sticky: {}
  });



  self.renderLandUseTypesOn = function(wrap) {
    var landUseWrap = DOM.div().addClass('land-use-wrap');
    var landUseInner = DOM.div().addClass('land-use-inner');
    var landUseChangeYearInput = DOM.input().attr('type','text').val(spec.landUse.changeYear).addClass('form-control');
    landUseChangeYearInput.change(function(){
      spec.landUse.changeYear = parseInt(this.value,10);
      TTI.storage.setItem(TTI.slugify('land-use-change-year'),spec.landUse.changeYear);
      self.publish('recalc',spec);
    });
    landUseChangeYearInput.attr('disabled',!spec.landUse.change);
    var toggleLandUse = DOM.input().attr('type','checkbox');
    toggleLandUse.attr('checked',spec.landUse.change);
    if (!spec.landUse.change) {
      landUseInner.css('display','none');
    }
    toggleLandUse.change(function(){
      spec.landUse.change = this.checked;
      TTI.storage.setItem(TTI.slugify('land-use-change'),spec.landUse.change); //global, but reset for each city...
      landUseChangeYearInput.attr('disabled',!spec.landUse.change);
      if (!spec.landUse.change) {
        landUseChangeYearInput.css('text-indent','-900px');
        landUseChangeYearInput.css('text-align','left');
        landUseInner.slideUp();
      }
      else {
        landUseChangeYearInput.css('text-indent','0px');
        landUseChangeYearInput.css('text-align','right');        
        landUseInner.slideDown();
      }
    });
    var toggleTable = DOM.table();
    toggleTable.append(self.tableRow('Allow Land Use Changes?','&nbsp;',toggleLandUse));
    landUseWrap.append(toggleTable);
    landUseWrap.append(landUseInner);
    landUseHeading = DOM.div('Land Use (100%)').addClass('land-use-percentage');
    wrap.append(landUseHeading);


    var items = TTI.landUseTypes.select(function(o){ 
      return o !== 'No Data';
    }).map(function(o){
      return { label: o, property: o }
    });

    
    var table = DOM.table();
    landUseInner.append(table);
    table.append(self.tableRow('Starting When?','&nbsp;',landUseChangeYearInput));


    var resetButton = DOM.button('reset').addClass('pull-right btn btn-primary');
    resetButton.click(function(){
      self.publish('reset-land-use');
    });   
    table.append(self.tableRow('&nbsp;','&nbsp;',resetButton));

    items.each(function(item){
      var slug = TTI.landUseSlug(myRate.spec.city,item.property);
      //value was already loaded into spec from localstorage earlier

      var changed = false;
      var origValue = origLandUse[item.property];

      var tmp = TTI.storage.getItem(slug);
      if (tmp) {
        tmp = parseFloat(tmp);
        if (tmp !== origValue) {
          changed = true;
        }
        myRate.spec[item.property] = tmp;
      }


      var input = DOM.input().attr('type','text').addClass('form-control');
      input.val(spec.landUse[item.property] || 0);
      if (changed) {
        input.addClass('changed');
      }
      
      input.keypress(TTI.cellValidator);
      input.change(function(){
        var v = parseFloat(this.value);
        if (isNaN(v)) { return false; }
        spec.landUse[item.property] = v;
        (v == origValue) ? input.removeClass('changed') : input.addClass('changed');
        TTI.storage.setItem(slug,v);
        self.checkLandUsePercentage();         
        waiter.beg(self,'recalc',spec);  
      });
      self.subscribe('reset-land-use',function(){
        spec.landUse[item.property] = origValue;
        TTI.storage.setItem(slug,origValue);
        input.val(origValue);
        input.trigger('change');
      });

      var row = self.tableRow(item.label,'&nbsp;',input);
      table.append(row);
    });
    self.checkLandUsePercentage();         
    wrap.append(landUseWrap);  
  };

  self.totalLandUsePercentage = function() {
    var total = TTI.landUseTypes.inject(0,function(tot,o){ return tot + spec.landUse[o] || 0;   });
    return total;
  };
  
  self.checkLandUsePercentage = function() {
    ///console.log('total land use %',self.totalLandUsePercentage());
    var pct = self.totalLandUsePercentage();
    pct = accounting.toFixed(pct,1);
    landUseHeading.text('Land use (' + pct + '%)');
    (pct == 100) ? landUseHeading.removeClass('warn') : landUseHeading.addClass('warn');
  };

  self.requestRecalc = function() {
    self.publish('recalc',spec);
  };
  
   self.renderOn = function(wrap) {
   
   
    var dropdownItems = [
      { label: 'Type of Service', items: TTI.serviceTypeItems, property: 'serviceType' },
      ///////{ label: 'Closest Exiting Station', items: closestStationItems, property: 'closestStation' },
    ];
    
    dropdownItems.each(function(ddItem){
      var li = DOM.li();
      li.append(DOM.label(ddItem.label));
      li.append('&nbsp;');
      var input = DOM.select().addClass('form-control');

      //get from storage if possible.
      var tmp = TTI.storage.getItem(TTI.slugify(ddItem.property));
      if (tmp) {
        spec[ddItem.property] = tmp;
      }
      
      ddItem.items.each(function(o){
        var opt = DOM.option();
        if (o.property == spec[ddItem.property]) {
          opt.attr('selected',true);
        }
        opt.text(o.label);
        input.append(opt);
      });
      input.change(function(){
        spec[ddItem.property] = ddItem.items[this.selectedIndex].property;
        TTI.storage.setItem(TTI.slugify(ddItem.property),spec[ddItem.property]);
        self.publish('change',spec);
      });
      
      li.append(input);


      /////var row = TTI.tableRow(ddItem.label,'&nbsp;',input);
      
      var table = DOM.table();      
      var row = TTI.tableRow(ddItem.label,'&nbsp;',input);
      table.append(row);
      dropdowns.append(table);
      
    });
   
   
    
    
    
    var guruWrap = DOM.div().addClass('guru-wrap');
    guru.renderOn(guruWrap);
    dropdowns.append(guruWrap);
    
    
    TTI.gurus.push(guru);
    
    
    guru.subscribe('single-hit',function(o){
      /////console.log('self::single-hit!!!!!!!!!',o);
      self.publish('single-hit',o);
    });

    wrap.append(dropdowns);
    wrap.append(boxes);
    ////wrap.append(specials);
    wrap.append(sliders);
  };


  self.clear = function() {
    boxes.empty();
    ///specials.empty();
    sliders.empty();
  };

  self.refresh = function() {
    self.clear();
    guru.refresh();
  };



    
    self.subscribe('single-hit',function(salesTaxRate){
      ////console.log('ST inputs:: single-hit!!!',salesTaxRate);
      myRate = TTI.SalesTaxRate(salesTaxRate.spec);
      if (!origRate) {
        origRate = JSON.parse(JSON.stringify(myRate.spec));
      }
      
      ///console.log('myRate',myRate);
      
      spec.baseRate = myRate;


      spec.landUseRecord = TTI.getSalesTaxLandUseRecordForCityType(salesTaxRate.spec.city,'TOTAL');
      ///console.log('spec',spec);
      if (!spec.landUseRecord) {
        self.publish('no-land-use-record');
        boxes.empty();
        boxes.append(DOM.strong('No land use record available').addClass('error'));
        return false;
      }

      //load in defaults    
      spec.landUseRecord.constituents().each(function(o){
        spec.landUse[o.spec.type] = o.spec.percentage; // load in from per-city
      });
      //save off original
      if (!origLandUse) {origLandUse = JSON.parse(JSON.stringify(spec.landUse)); }
      //load in user overrides
      spec.landUseRecord.constituents().each(function(o){
        var slug = TTI.landUseSlug(salesTaxRate.spec.city,o.spec.type);
        var tmp = TTI.storage.getItem(slug);
        if (tmp) {
          ////console.log(o.spec.type,'was',o.spec.percentage,'but now overriding with',tmp,'from localStorage');
          spec.landUse[o.spec.type] = parseFloat(tmp);
        }
      });      
 

      //load in user-specified land-use-change  (allow land use changes?) boolean
      var tmp = TTI.storage.getItem(TTI.slugify('land-use-change'));
      if (tmp) {
        spec.landUse.change = (tmp == 'true') ? true : false;
      }

      //load in user-specified land-use changeYear
      var tmp = TTI.storage.getItem(TTI.slugify('land-use-change-year'));
      if (tmp) {
        //////console.log('loading land-use-change',tmp,typeof tmp);
        spec.landUse.changeYear = parseInt(tmp,10);
      }
 
 
 
 
      var growthRates = TTI.getSalesTaxGrowthRateForCity(salesTaxRate.spec.city);
  
      if (growthRates) {
        ////console.log('yay!*!*!*!*');

        spec.standardGrowthRate = growthRates.spec.standard;
        spec.inflation = growthRates.spec.inflation;
        spec.landUseChangeGrowthRateStation = growthRates.spec.landUse;
      }
      else {
        alert('no growth rates!!');
      }

      self.clear();
      
      var items = TTI.distributionFields.salesTax;
      
      


      var table = DOM.table();


      var resetButton = DOM.button('reset').addClass('pull-right btn btn-primary');
      resetButton.click(function(){
        self.publish('reset-distribution-fields');
      });   
      table.append(self.tableRow('&nbsp;','&nbsp;',resetButton));

      
      items.each(function(item){
        var slug = TTI.salesTaxRateSlug(myRate,item.property);
      
        var changed = false;
        var origValue = origRate[item.property];

        var tmp = TTI.storage.getItem(slug);
        if (tmp) {
          tmp = parseFloat(tmp);
          if (tmp !== origValue) {
            changed = true;
          }
          myRate.spec[item.property] = tmp;
        }
        
        var input = DOM.input().attr('type','text').addClass('form-control');
        input.val(myRate.spec[item.property]);
        if (changed) {
          input.addClass('changed');
        }
        
        
        ///input.keyup(TTI.cellValidator);
        input.keypress(TTI.cellValidator);
        
        
        input.change(function(){
          var v = parseFloat(this.value);  
          if (isNaN(v)) { return false; }
          myRate.spec[item.property] = v;
          (v == origValue) ? input.removeClass('changed') : input.addClass('changed');
          TTI.storage.setItem(slug,v);
          waiter.beg(self,'recalc',spec);  
        });
        
        self.subscribe('reset-distribution-fields',function(){
          myRate.spec[item.property] = origValue;
          TTI.storage.setItem(slug,origValue);
          input.val(origValue);
          input.trigger('change');
        });
      
        var row = self.tableRow(item.label,'&nbsp;',input);
      
        table.append(row);
      });
      
      var remainRow = DOM.tr().addClass('remain');
      remainRow.append(DOM.th('Remaining Tax Capacity'));
      remainRow.append(DOM.td('&nbsp'));
      remainRow.append(remainCell);
      
      var subtotalRow = DOM.tr();
      subtotalRow.append(DOM.th('Subtotal'));
      subtotalRow.append(DOM.td('&nbsp'));
      subtotalRow.append(subtotalCell);

      
      table.append(remainRow);      
      table.append(subtotalRow);      
      
      boxes.append(table);


      self.renderLandUseTypesOn(boxes);


      resetButton = DOM.button('reset sliders').addClass('pull-right btn btn-primary');
      resetButton.click(function(){
        self.publish('reset-sliders');
      });   
      sliders.append(resetButton);
      sliders.append(DOM.div('&nbsp;').addClass('clear-both'));

      
      var sliderItems = [
        { 
          label: 'Standard Growth Rate', 
          property: 'standardGrowthRate',
          min: 0, max: 20, step: 0.1, 
          value: spec.standardGrowthRate,  
          format: function(x) { return accounting.toFixed(x,1) + '%'; },
          origValue: growthRates.spec.standard
        },
        { 
          label: 'Inflation', 
          property: 'inflation',
          min: 0, max: 10, step: 0.1, 
          value: spec.inflation,  
          format: function(x) { return accounting.toFixed(x,1) + '%'; },
          origValue: growthRates.spec.inflation
        },
        { 
          label: 'Additional Sales Growth Due to Station',
          property: 'landUseChangeGrowthRateStation',
          min: 0, max: 20, step: 0.1, 
          value: spec.landUseChangeGrowthRateStation,  
          format: function(x) { return accounting.toFixed(x,1) + '%'; },
          origValue: growthRates.spec.landUse
        },
      ];
      
      sliderItems.each(function(item){

        var slug = TTI.growthRateSlug(myRate,item.property);
  
        var changed = false;
        var origValue = item.origValue;
  
        var tmp = TTI.storage.getItem(slug);
        if (tmp) {
          tmp = parseFloat(tmp);
          if (tmp !== origValue) {
            changed = true;
          }
          spec[item.property] = tmp;
        }

        var theValue = spec[item.property];

        //jquery UI slider
        var input = DOM.div();
        input.val(theValue);
        var span = DOM.span();
        span.text(item.format(theValue));
        if (changed) {
          span.addClass('changed');
        }
        
        var refresher = function(){
          var v = parseFloat(input.slider('value'));
          if (isNaN(v)) { return false; }
          spec[item.property] = v;
          span.text(item.format(v));        
          (v == origValue) ? span.removeClass('changed') : span.addClass('changed');
          TTI.storage.setItem(slug,v);
          self.publish('recalc',spec);
        };
        
        
        input.slider({
          range: "min",
          value: theValue,
          min: item.min,
          max: item.max,
          step: item.step,
          change: refresher,
          slide: refresher
        });
        
        self.subscribe('reset-sliders',function(){
          input.slider({ value: origValue });
          spec[item.property] = origValue;
          TTI.storage.setItem(slug,origValue);
        });
        
        
              
              
        sliders.append(DOM.label(item.label));
        sliders.append('&nbsp;');
        sliders.append(span);  
        sliders.append(input);  
        sliders.append(DOM.div('&nbsp;').css('clear','both'));
      });

      //////////self.publish('recalc',{ baseRate: myRate });
      self.publish('recalc',spec);
    });


      self.subscribe('recalc',function(payload){

        /////console.log('Woo2 payload',payload);
        var inrec = payload.baseRate.spec;

        var sum = 0;
        sum += inrec.cityRate;
        sum += inrec.economicDevSec4A;
        sum += inrec.economicDevSec4B;
        sum += inrec.dallasMTA;
        sum += inrec.dentonCountyTransportationAuthority;
        sum += inrec.propertyTaxRelief;
        sum += inrec.sportAndCommVenue;
        sum += inrec.streetMaintenanceRepair;
        sum += inrec.fireControlDistrict;
        sum += inrec.crimeControlDistrict;
        ////sum += inrec.municipalTotal;
        
        
        var remain = 2 - sum;
        remainCell.text(remain);
        E13 = remain+sum;
        
        subtotalCell.text(E13); //TODO what about municipalTotal being non-2 ? 1.75, ex: Arlington
        
      });







  return self;  
};



TTI.Widgets.SalesTaxReport = function(spec) {
  var self = TTI.PubSub({});
  
    var yearStart = 2015;
    var year2 = yearStart+1;
    var yearEnd = 2025;
  
  var yearRange = [];
  var yearRangePlus = [];
  
  
  for (var i = yearStart; i <= yearEnd; i += 1) { 
    yearRange.push(i); 
    yearRangePlus.push(i); 
  }
  
  yearRangePlus.push('fiveYears');
  yearRangePlus.push('tenYears');
  
  
  spec.inputs.subscribe('single-hit',function(o){ self.publish('single-hit',o);   }); //fixme: does report care about this anymore?
  spec.inputs.subscribe('recalc',function(o){ self.publish('recalc',o); });

  self.renderOn = function(o) {
    wrap = o;
  };


  self.subscribe('recalc',function(payload){
    ////console.log('RECALC!!!!',payload);   
    //console.log('subtotal',payload.baseRate.getTotalAdValoremTaxRate());
    ////console.log('subtotal',payload.baseRate.getTotalWithAverage());
    
    var br = payload.baseRate.spec;

    var landUseRecord = payload.landUseRecord;//////////TTI.getPropertyTaxLandUseRecordForCityType(br.city,'TOTAL');
    /////console.log('LUR!!!!!',landUseRecord);

    var commercialLandUseRecord = TTI.getSalesTaxLandUseRecordForCityType(br.city,'Commercial');


    var sum = 0;
    sum += br.cityRate;
    sum += br.economicDevSec4A;
    sum += br.economicDevSec4B;
    sum += br.dallasMTA;
    sum += br.dentonCountyTransportationAuthority;
    sum += br.propertyTaxRelief;
    sum += br.sportAndCommVenue;
    sum += br.streetMaintenanceRepair;
    sum += br.fireControlDistrict;
    sum += br.crimeControlDistrict;
    ////sum += inrec.municipalTotal;
    
    br.remain = 2 - sum;
    
    ////remainCell.text(br.remain);
    E13 = br.remain+sum;
    

    br.halfMile = 502.65;
    br.quarterMile = 125.66;



     var data = {
        constants: {}
      };
      
      data.constants.yearRange = yearRange;
      data.constants.yearRangePlus = yearRangePlus;

      data.constants.yearRangePlus.each(function(year){
        data[year] = {
          baseCase: {},
          station: {},
          change: {},
          halfMileDistStation: {},
          quarterMileDistStation: {},
          halfMileDistOnlyAddFunds: {},
          quarterMileDistOnlyAddFunds: {},
        };
      });

      data.constants.thisYear = (new Date).getFullYear();
      data.constants.fiveYears = data.constants.yearRange.select(function(year){ return year >= data.constants.thisYear && year < data.constants.thisYear + 5; });
      data.constants.tenYears = data.constants.yearRange.select(function(year){ return year >= data.constants.thisYear && year < data.constants.thisYear + 10; });
      ////console.log('fiveYears',fiveYears);

      data.constants.distributionFields = JSON.parse(JSON.stringify(TTI.distributionFields.salesTax));
      data.constants.distributionFields.push({ label: 'Remaining Tax Capacity', property: 'remain' });
    
      
      data.constants.distributionFields.each(function(o){
        var field = o.property;
        data[yearStart].halfMileDistStation[field] = 0;
        data[yearStart].quarterMileDistStation[field] = 0;
        data[yearStart].halfMileDistOnlyAddFunds[field] = 0;
        data[yearStart].quarterMileDistOnlyAddFunds[field] = 0;
      });

      data[yearStart].halfMileDistStation.total = 0;
      data[yearStart].quarterMileDistStation.total = 0;
      data[yearStart].halfMileDistOnlyAddFunds.total = 0;
      data[yearStart].quarterMileDistOnlyAddFunds.total = 0;



    data.constants.yearRange.each(function(year){
      ///////if (i == yearStart) { return false; } //we have already computed this year...


      data[year].baseCase.halfMile = landUseRecord.baseCase(year,payload.standardGrowthRate+payload.inflation) * br.halfMile;
      data[year].baseCase.quarterMile = landUseRecord.baseCase(year,payload.standardGrowthRate+payload.inflation) * br.quarterMile;



      var stationCase = commercialLandUseRecord.stationCase(year,payload);
      ////console.log('stationCase',stationCase);
      data[year].station.halfMile = (stationCase / commercialLandUseRecord.spec.acres) * br.halfMile;
      data[year].station.quarterMile = (stationCase / commercialLandUseRecord.spec.acres) * br.quarterMile;


      data[year].change.halfMile = data[year].station.halfMile - data[year].baseCase.halfMile;
      data[year].change.quarterMile = data[year].station.quarterMile - data[year].baseCase.quarterMile;


      data.constants.distributionFields.each(function(o){
        var field = o.property;


        data[year].halfMileDistStation[field] = data[year].station.halfMile * br[field] / E13;
        data[year].quarterMileDistStation[field] = data[year].station.quarterMile * br[field] / E13;

        data[year].halfMileDistOnlyAddFunds[field] = data[year].change.halfMile * br[field] / E13;
        data[year].quarterMileDistOnlyAddFunds[field] = data[year].change.quarterMile * br[field] / E13;

      });


      //remain
      data[year].halfMileDistStation.remain = data[year].station.halfMile * br.remain / E13;
      data[year].quarterMileDistStation.remain = data[year].station.quarterMile * br.remain / E13;

      data[year].halfMileDistOnlyAddFunds.remain = data[year].change.halfMile * br.remain / E13;
      data[year].quarterMileDistOnlyAddFunds.remain = data[year].change.quarterMile * br.remain / E13;


      ///return false;

      
      //total

      data[year].halfMileDistStation.total = data.constants.distributionFields.inject(0,function(total,o){ 
        var field = o.property;
        return total + data[year].halfMileDistStation[field]; 
      });
      data[year].quarterMileDistStation.total = data.constants.distributionFields.inject(0,function(total,o){ 
        var field = o.property;
        return total + data[year].quarterMileDistStation[field]; 
      });

      data[year].halfMileDistOnlyAddFunds.total = data.constants.distributionFields.inject(0,function(total,o){ 
        var field = o.property;
        return total + data[year].halfMileDistOnlyAddFunds[field]; 
      });
      data[year].quarterMileDistOnlyAddFunds.total = data.constants.distributionFields.inject(0,function(total,o){ 
        var field = o.property;
        return total + data[year].quarterMileDistOnlyAddFunds[field]; 
      });
    });
    
    ['fiveYears','tenYears'].each(function(timespan){
        data[timespan].baseCase.halfMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].baseCase.halfMile;  });
        data[timespan].baseCase.quarterMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].baseCase.quarterMile;  });

        data[timespan].station.halfMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].station.halfMile;  });
        data[timespan].station.quarterMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].station.quarterMile;  });
    
        data[timespan].change.halfMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].change.halfMile;  });
        data[timespan].change.quarterMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].change.quarterMile;  });
    
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          data[timespan].halfMileDistStation[field] = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].halfMileDistStation[field];  });
          data[timespan].quarterMileDistStation[field] = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].quarterMileDistStation[field];  });


          data[timespan].halfMileDistOnlyAddFunds[field] = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].halfMileDistOnlyAddFunds[field];  });
          data[timespan].quarterMileDistOnlyAddFunds[field] = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].quarterMileDistOnlyAddFunds[field];  });

        });


        data[timespan].halfMileDistStation.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[timespan].halfMileDistStation[field]; 
        });
    
        data[timespan].quarterMileDistStation.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[timespan].quarterMileDistStation[field]; 
        });
    
    
        data[timespan].halfMileDistOnlyAddFunds.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[timespan].halfMileDistOnlyAddFunds[field]; 
        });
    
        data[timespan].quarterMileDistOnlyAddFunds.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[timespan].quarterMileDistOnlyAddFunds[field]; 
        });
    
    });
       
    
    
    self.publish('data-changed',data);
    
    
  });
  return self;
};


TTI.Widgets.SalesTaxSummary = function(spec) {
  var self = TTI.PubSub({});
  
  
  self.getYearRow = function(range) {
    var row = DOM.tr();
    row.append(DOM.th('&nbsp;'));
    range.each(function(item){
      var th = DOM.th(item.label);
      row.append(th);
    });
    return row;        
  };
  
  self.getMyRange = 'subclassResponsibility';


  self.renderFullReportToggleOn = function(wrap,data) {

    rbFull = DOM.input().attr('type','radio').attr('name',self.hash);
    rbBrief = DOM.input().attr('type','radio').attr('name',self.hash);
    
    rbFull.click(function(){ self.publish('respawn',{ data: data, constructor: TTI.Widgets.SalesTaxFullSummary }); });
    rbBrief.click(function(){ self.publish('respawn',{ data: data, constructor: TTI.Widgets.SalesTaxStyledSummary }); });
    
    wrap.append('Full ');
    wrap.append(rbFull);
    wrap.append('Brief ');
    wrap.append(rbBrief);
    wrap.append(DOM.br());
    
    ///wrap.append('Show Full Report?');
    ///wrap.append(cb);
  
  };
  
  
  self.renderOn = function(wrap){
    spec.report.subscribe('data-changed',function(data){

      wrap.empty();
      
      
      /////self.renderFullReportToggleOn(wrap,data);
      
      
      var tmpRow = false;
      //var table = DOM.table();
      //wrap.append('FOO TEST');
      ///wrap.append(Math.random());
      ///console.log('summary here',data);
  
      var table = DOM.table().addClass('table-condensed table-md');
      
      var myRange = self.getMyRange(data);
      
      table.append(self.getYearRow(myRange));    



        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('Base Case Sales Tax Rev').attr('colspan',14));
        table.append(tmpRow);        

        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/2 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].baseCase.halfMile;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        
        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/4 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].baseCase.quarterMile;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        
        
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('Station Sales Tax Rev').attr('colspan',14));
        table.append(tmpRow);        
        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/2 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].station.halfMile;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        


        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/4 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].station.quarterMile;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        


        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('Change in Sales Tax Revenue').attr('colspan',14));
        table.append(tmpRow);        
        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/2 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].change.halfMile;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        
        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/4 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].change.quarterMile;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        


  
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('1/2 Mile Revenue Distribution (Total with Station)').attr('colspan',14));
        table.append(tmpRow);        
        
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          var label = o.label;
        
          tmpRow = DOM.tr();
          tmpRow.addClass(field);
          
          tmpRow.append(DOM.td(label));
          myRange.each(function(item){
            var td = DOM.td().addClass('value-cell');
            var rounded = data[item.property].halfMileDistStation[field];
            rounded = TTI.precision(rounded,0);
            rounded = accounting.formatMoney(rounded,'$',0);
            td.text(rounded);
            tmpRow.append(td);
          });
          table.append(tmpRow);        
        });


        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('Total'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].halfMileDistStation.total;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        



        table.append(self.getYearRow(myRange));    


      //////////////////////////////////////////////////////////////////////////////////////////////////////
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('1/4 Mile Revenue Distribution (Total with Station)').attr('colspan',14));
        table.append(tmpRow);        
        
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          var label = o.label;
        
          tmpRow = DOM.tr();
          tmpRow.addClass(field);
          tmpRow.append(DOM.td(label));
          myRange.each(function(item){
            var td = DOM.td().addClass('value-cell');
            var rounded = data[item.property].quarterMileDistStation[field];
            rounded = TTI.precision(rounded,0);
            rounded = accounting.formatMoney(rounded,'$',0);
            td.text(rounded);
            tmpRow.append(td);
          });
          table.append(tmpRow);        
        });
  
  
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('Total'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].quarterMileDistStation.total;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        


        table.append(self.getYearRow(myRange));    

        //////////////////////////////////////////////////////////////////////////////////////////////////////
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('1/2 Mile Revenue Distribution (Only Additional Funds)').attr('colspan',14));
        table.append(tmpRow);        
        
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          var label = o.label;
        
          tmpRow = DOM.tr();
          tmpRow.addClass(field);
          
          tmpRow.append(DOM.td(label));
          myRange.each(function(item){
            var td = DOM.td().addClass('value-cell');
            var rounded = data[item.property].halfMileDistOnlyAddFunds[field];
            rounded = TTI.precision(rounded,0);
            rounded = accounting.formatMoney(rounded,'$',0);
            td.text(rounded);
            tmpRow.append(td);
          });
          table.append(tmpRow);        
        });


        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('Total'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].halfMileDistOnlyAddFunds.total;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        


        table.append(self.getYearRow(myRange));    

        //////////////////////////////////////////////////////////////////////////////////////////////////////
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('1/4 Mile Revenue Distribution (Only Additional Funds)').attr('colspan',14));
        table.append(tmpRow);        
        
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          var label = o.label;
        
          tmpRow = DOM.tr();
          tmpRow.addClass(field);

          tmpRow.append(DOM.td(label));
          myRange.each(function(item){
            var td = DOM.td().addClass('value-cell');
            var rounded = data[item.property].quarterMileDistOnlyAddFunds[field];
            rounded = TTI.precision(rounded,0);
            rounded = accounting.formatMoney(rounded,'$',0);
            td.text(rounded);
            tmpRow.append(td);
          });
          table.append(tmpRow);        
        });
  
  
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('Total'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].quarterMileDistOnlyAddFunds.total;
          rounded = TTI.precision(rounded,0);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
  
        
      
      wrap.append(table);
      self.publish('redraw-complete',wrap);
      
    });

  
  };
  return self;
};






TTI.Widgets.SalesTaxFullSummary = function(spec) {
  var self = TTI.Widgets.SalesTaxSummary(spec);
  self.getMyRange = function(data) {
  
      var myRange = data.constants.yearRangePlus;
      
      myRange = myRange.map(function(o){
        return { 
          label: o,
          property: o
        }
      });
  
    return myRange;  
  };

  return self;
};

TTI.Widgets.SalesTaxBriefSummary = function(spec) {
  var self = TTI.Widgets.SalesTaxSummary(spec);

  self.getMyRange = function(data) {
      var myRange = [
        { label: 'Five Years', property: 'fiveYears' },
        { label: 'Ten Years', property: 'tenYears' }
      ];
    return myRange;
  };

  return self;
};





TTI.Widgets.SalesTaxStyledSummary = function(spec) {
  var self = TTI.Widgets.SalesTaxSummary(spec);

  self.getMyRange = function(data) {
      var myRange = [
        { label: 'Five Years', property: 'fiveYears' },
        { label: 'Ten Years', property: 'tenYears' }
      ];
    return myRange;
  };
  

  self.renderSummaryTableOn = function(wrap,item,data) {
    var table = DOM.table().addClass('table-condensed table-md');
    var titleRow = DOM.tr().addClass('was-title-row dart-blue-bg white-fg');
    titleRow.append(DOM.th(item.label));
    table.append(titleRow);
    
    
    
    var rowData;
    var columnData;

    rowData = [
      { label: '1/2 Mile',property: 'halfMile'},
      { label: '1/4 Mile',property: 'quarterMile'},
    ];

    columnData = [
        { label: 'Base Case', property: 'baseCase' },
        { label: 'With Station', property: 'station' }, 
        { label: 'Change', property: 'change' }  
      ];

    var tmpRow = DOM.tr().addClass('dart-yellow-bg black-fg');
    tmpRow.append(DOM.th('Sales Tax Revenue'));
    columnData.each(function(column){
      tmpRow.append(DOM.th(column.label));
    });
    table.append(tmpRow);

    rowData.each(function(row) {
    
      tmpRow = DOM.tr();
      tmpRow.append(DOM.td(row.label));

      
      columnData.each(function(column){
        var td = DOM.td().addClass('value-cell');
        var rounded = data[item.property][column.property][row.property];
        ////rounded = accounting.formatMoney(rounded,'$',0);
        rounded = accounting.formatMoney(rounded / 1000000,'$',1) + 'M';
        
        td.text(rounded);
        tmpRow.append(td);
      });
      table.append(tmpRow); 
    });

    //
    rowData = [
      { label: '1/2 Mile (Total With Station)',property: data[item.property].halfMileDistStation },
      { label: '1/4 Mile (Total With Station)',property: data[item.property].quarterMileDistStation },
      { label: '1/2 Mile (Additional Funds)',property: data[item.property].halfMileDistOnlyAddFunds },
      { label: '1/4 Mile (Additional Funds)',property: data[item.property].quarterMileDistOnlyAddFunds },
    ];

    columnData = JSON.parse(JSON.stringify(data.constants.distributionFields));
    columnData.push({ label: 'Total', property: 'total' });


    var tmpRow = DOM.tr().addClass('dart-yellow-bg black-fg');
    tmpRow.append(DOM.th('Revenue Distribution'));
    columnData.each(function(column){
      tmpRow.append(DOM.th(column.label));
    });
    table.append(tmpRow);

    
    rowData.each(function(row) {
      tmpRow = DOM.tr();
      tmpRow.append(DOM.td(row.label));
      
      columnData.each(function(column){
        var td = DOM.td().addClass('value-cell');
        var rounded = row.property[column.property];
        //////rounded = accounting.formatMoney(rounded,'$',0);
        rounded = accounting.formatMoney(rounded / 1000000,'$',1) + 'M';
        td.text(rounded);
        tmpRow.append(td);
      });
      table.append(tmpRow); 
    });
    wrap.append(table);  
  };



  self.renderOn = function(wrap,data) {
    spec.report.subscribe('data-changed',function(data){
      wrap.empty();
      if (!data) { return false; }
      /////self.renderFullReportToggleOn(wrap,data);
      var myRange = self.getMyRange(data);
      ///table.append(self.getYearRow(myRange));    
      myRange.each(function(item) {
        self.renderSummaryTableOn(wrap,item,data);
      });
      self.publish('redraw-complete',wrap);
    });
  };
  return self;
};
























