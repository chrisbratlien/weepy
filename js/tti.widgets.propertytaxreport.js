TTI.Widgets.PropertyTaxInputs = function(spec) {
  var self = TTI.Widgets.ProtoTaxInputs(spec);

  var waiter = TTI.Widgets.Procrastinator({ timeout: 200 });

  
  var dropdowns = DOM.div().addClass('dropdowns');
  
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
  

  //old defaults      
  spec.landValueGrowthRate = 2.0;
  spec.landValueGrowthRateStation = 3.2;
  spec.changeInValueStation = 8.0;

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
    var toggleTable = DOM.table().addClass('toggle-land-use');
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

      var row = DOM.tr();
      var td1 = DOM.td(item.label);
      var td2 = DOM.td(item.label2 || '&nbsp;');
      var td3 = DOM.td().addClass('');
      var input = DOM.input().attr('type','text').addClass('form-control');
      input.val(spec.landUse[item.property] || 0);
      if (changed) {
        input.addClass('changed');
      }
      
      self.subscribe('reset-land-use',function(){
        spec.landUse[item.property] = origValue;
        TTI.storage.setItem(slug,origValue);
        input.val(origValue);
        input.trigger('change');
      });
      
      

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
      
      td3.append(input);
      ///td3.append(DOM.div('%').addClass('pull-right'));
      row.append(td1);
      row.append(td2);
      row.append(td3);
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


    var closestStationItems = [
      { label: 'Beltline', property: 'Beltline',style:'color:orange'},
      { label: 'BRT', property: 'BRT',style:'color:black' },
      { label: 'Denton', property: 'Denton',style:'color:green' },
      { label: 'Lawnview', property: 'Lawnview',style:'color:green' },
      { label: 'Parker', property: 'Parker',style:'color:red' },
      { label: 'Rowlett', property: 'Rowlett',style:'color:blue' },
      { label: 'Streetcar', property: 'Streetcar',style:'color:black' },
      { label: 'T&P', property: 'T&P',style:'color:red' },
    ];


    var dropdownItems = [
      { label: 'Type of Service', items: TTI.serviceTypeItems, property: 'serviceType' },
      { label: 'Closest Exiting Station', items: closestStationItems, property: 'closestStation' },
    ];
    
    
   
    var dropdownsTable = DOM.table().addClass('dropdowns-table');
        
    
    
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
      

      ///var table = DOM.table().addClass('controls');      
      var row = TTI.tableRow(ddItem.label,'&nbsp;',input);
      /////table.append(row);
      
      dropdownsTable.append(row);
    });

    dropdowns.append(dropdownsTable); 
    
    

    guru = TTI.PropertyTaxGuru({ 
      candidates: TTI.propertyTaxRates,
    });
    
    
    var guruWrap = DOM.div().addClass('guru-wrap');
    guru.renderOn(guruWrap);
    dropdowns.append(guruWrap);
    
    TTI.gurus.push(guru);
    
    
    guru.subscribe('single-hit',function(o){
      console.log('self::single-hit!!!!!!!!!',o);
      self.publish('single-hit',o);
    });
    
    guru.subscribe('multiple-hits',function(o){
      console.log('aokasdf multiple-hits');
      self.publish('multiple-hits',o);
    });

    guru.subscribe('zero-hits',function(o){
      console.log('aokasdf zero');
      self.publish('zero-hits',o);
    });


    guru.refresh();

    
    wrap.append(dropdowns);
    wrap.append(boxes);
    wrap.append(specials);
    wrap.append(sliders);
  };
  

  self.clear = function() {

    spec.selectedSpecialRates = [];

    boxes.empty();
    specials.empty();
    sliders.empty();
  };

  self.refresh = function() {
    self.clear();
    guru.refresh();
  };
  

  
  self.subscribe('zero-hits',self.clear);
  self.subscribe('multiple-hits',self.clear);
  
  
  self.subscribe('single-hit',function(propertyTaxRate){

    myRate = TTI.PropertyTaxRate(propertyTaxRate.spec);
    var specialHits = TTI.specialRates.select(function(s){
      return s.spec.County == myRate.spec.county;
    });
    
    if (!origRate) {
      origRate = JSON.parse(JSON.stringify(myRate.spec));
    }
    
    spec.baseRate = myRate;
    
    
    spec.landUseRecord = TTI.getPropertyTaxLandUseRecordForCityType(propertyTaxRate.spec.city,'TOTAL');
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
        var slug = TTI.landUseSlug(propertyTaxRate.spec.city,o.spec.type);
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
    
    
    /////console.log('spec.landUse',spec.landUse);
    
    var growthRates = TTI.getPropertyTaxGrowthRateForCityCounty(propertyTaxRate.spec.city,propertyTaxRate.spec.county);
    if (growthRates) {
      ///console.log('yay!*!*!*!*');
      spec.landValueGrowthRate = growthRates.spec.standard;
      spec.landValueGrowthRateStation = growthRates.spec.standardWithStation;
      spec.changeInValueStation = growthRates.spec.changeInValue;
    }
    else {
      alert('no growth rates!!');
    }

    self.clear();

    ///checkboxes      
    
    if (specialHits.length > 0) {
      specials.append(DOM.h5('Special District Rates (check all which apply)'));
      var specialsInner = DOM.div().addClass('specials-inner');
      specials.append(specialsInner);
      specialHits.each(function(special){

        var slug = TTI.specialRateSlug(special);

        var row = DOM.div();      
        var cb = DOM.input().attr('type','checkbox');
        



        var tmp = TTI.storage.getItem(slug);
        if (tmp) {
          cb.attr('checked',true);
          spec.selectedSpecialRates.push(special);           
        }
        
        
        
        cb.click(function(){
        
          spec.selectedSpecialRates = spec.selectedSpecialRates.reject(function(o){
            return o.hash == special.hash;
          });
        
          if (this.checked) {
            spec.selectedSpecialRates.push(special); 
            TTI.storage.setItem(slug,true);
          }
          else {
            TTI.storage.removeItem(slug);          
          }

  
          /////self.publish('recalc',{ baseRate: myRate, specials: TTI.selectedSpecialRates });
          
          self.publish('recalc',spec);
        });
        
        
        
        row.append(cb);
        row.append('&nbsp;');
        row.append(special.spec.Entity);
        row.append('&nbsp;');
        row.append('( +' + special.spec.TaxRate + ')');
        specialsInner.append(row);
      });
    }

      ///input boxes table
      var items = TTI.distributionFields.propertyTax;

      var table = DOM.table().addClass('distribution-fields');
      ////var headerRow = DOM.tr();
      ////headerRow.append(DOM.th('Input'))
      


      var resetButton = DOM.button('reset').addClass('pull-right btn btn-primary');
      resetButton.click(function(){
        self.publish('reset-distribution-fields');
      });   
      table.append(self.tableRow('&nbsp;','&nbsp;',resetButton));
      
      
      
      items.each(function(item){
        var slug = TTI.propertyTaxRateSlug(myRate,item.property);
        ////console.log('PTRslug',slug);

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

        input.keypress(TTI.cellValidator);
        
        
        input.change(function(){
        
          var v = parseFloat(this.value);
          if (isNaN(v)) { return false; }
          myRate.spec[item.property] = v;
          (v == origValue) ? input.removeClass('changed') : input.addClass('changed');
          TTI.storage.setItem(slug,v);
          ///////self.publish('recalc',spec);
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



      var subtotalRow = DOM.tr();
      subtotalRow.append(DOM.th('Subtotal'));
      subtotalRow.append(DOM.td('&nbsp'));
      subtotalRow.append(subtotalCell);
      table.append(subtotalRow);      
      boxes.append(table);
      
      
      
      self.renderLandUseTypesOn(boxes);
      
      
      var sliderItems = [
        { 
          label: 'Average Land Value Growth Rate Without Station', 
          property: 'landValueGrowthRate', 
          min: 0, max: 10, step: 0.1,////000001, 
          format: function(x) { return accounting.toFixed(x,1) + '%'; },
          origValue: growthRates.spec.standard
        },
        { 
          label: 'Average Land Value Growth Rate With Station', 
          property: 'landValueGrowthRateStation', 
          min: 0, max: 15, step: 0.1, 
          format: function(x) { return accounting.toFixed(x,1) + '%'; },
          origValue: growthRates.spec.standardWithStation
        },
        {   
          label: 'One time change in Land Value due to new service', 
          property: 'changeInValueStation', 
          min: 0, max: 20, step: 0.1, 
          format: function(x) { return accounting.toFixed(x,1) + '%'; },
          origValue: growthRates.spec.changeInValue
        },
      ];



      resetButton = DOM.button('reset sliders').addClass('pull-right btn btn-primary');
      resetButton.click(function(){
        self.publish('reset-sliders');
      });   
      sliders.append(resetButton);
      sliders.append(DOM.div('&nbsp;').addClass('clear-both'));


      
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
        var input = DOM.div();/////.attr('type','range').attr('min',item.min).attr('max',item.max).attr('step',item.step);
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
      ////self.publish('recalc',{ baseRate: myRate, specials: TTI.selectedSpecialRates });
      self.publish('recalc',spec);///{ baseRate: myRate, specials: TTI.selectedSpecialRates });
    
  });


  self.subscribe('recalc',function(payload){
    var E14 = payload.baseRate.getTotalAverageTaxRate();
    E14 = payload.selectedSpecialRates.inject(E14,function(total,o){  return total + o.spec.TaxRate;  });
    ////console.log('subtotal',E14);
    subtotalCell.text(accounting.toFixed(E14,3));
  });
  

  return self;
};



TTI.Widgets.PropertyTaxReport = function(spec) {
  var self = TTI.PubSub({});
  var wrap = false;


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
  

  spec.inputs.subscribe('zero-hits',function(o){ 
    console.log('zero!!!');
    self.publish('data-changed',null);   
  });
  spec.inputs.subscribe('multiple-hits',function(o){ 
    console.log('*** multiple!!!');
    self.publish('data-changed',null);   
  });
  
   
  spec.inputs.subscribe('recalc',function(o){ self.publish('recalc',o); });

  self.renderOn = function(o) {
    wrap = o;
  };

    self.subscribe('recalc',function(payload){
      console.log('RECALC!!!!',payload);   
      //console.log('subtotal',payload.baseRate.getTotalAdValoremTaxRate());
      ////console.log('subtotal',payload.baseRate.getTotalWithAverage());
      TTI.payload = payload;      

      var E14 = payload.baseRate.getTotalAverageTaxRate();
      
      

      
      E14 = payload.selectedSpecialRates.inject(E14,function(total,o){  return total + o.spec.TaxRate;  });
      console.log('subtotal/E14',E14);
      
      
      var br = payload.baseRate.spec;
      
      
      var landUseRecord = TTI.getPropertyTaxLandUseRecordForCityType(br.city,'TOTAL');

      ///console.log('landUseRecord',landUseRecord);
      
      
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
          halfMileDistribution: {},
          quarterMileDistribution: {}
        };
      });

      data.constants.thisYear = (new Date).getFullYear();
      data.constants.fiveYears = data.constants.yearRange.select(function(year){ return year >= data.constants.thisYear && year < data.constants.thisYear + 5; });
      data.constants.tenYears = data.constants.yearRange.select(function(year){ return year >= data.constants.thisYear && year < data.constants.thisYear + 10; });
      ////console.log('fiveYears',fiveYears);
      
      data.constants.distributionFields = TTI.distributionFields.propertyTax;

      data.constants.yearRange.each(function(year){

        data[year].baseCase.halfMile = landUseRecord.baseCase(year,payload.landValueGrowthRate) * br.halfMile  * E14 / 100;
        data[year].baseCase.quarterMile = landUseRecord.baseCase(year,payload.landValueGrowthRate) * br.quarterMile  * E14 / 100;


        data[year].station.halfMile = (( landUseRecord.totalStationCase(year,payload) / landUseRecord.spec.totalAcres) * br.halfMile) * E14 / 100;
        data[year].station.quarterMile = (( landUseRecord.totalStationCase(year,payload) / landUseRecord.spec.totalAcres) * br.quarterMile) * E14 / 100;

        data[year].change.halfMile = data[year].station.halfMile - data[year].baseCase.halfMile;
        data[year].change.quarterMile = data[year].station.quarterMile - data[year].baseCase.quarterMile;
        
        ///////////
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          data[year].halfMileDistribution[field] = data[year].change.halfMile * br[field] / E14;
          data[year].quarterMileDistribution[field] = data[year].change.quarterMile * br[field] / E14;
        });

        data[year].halfMileDistribution.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[year].halfMileDistribution[field]; 
        });
        data[year].quarterMileDistribution.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[year].quarterMileDistribution[field]; 
        });

      });      
      ///////console.log('data',data);

      ['fiveYears','tenYears'].each(function(timespan){

        data[timespan].baseCase.halfMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].baseCase.halfMile;  });
        data[timespan].baseCase.quarterMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].baseCase.quarterMile;  });

        data[timespan].station.halfMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].station.halfMile;  });
        data[timespan].station.quarterMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].station.quarterMile;  });

        data[timespan].change.halfMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].change.halfMile;  });
        data[timespan].change.quarterMile = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].change.quarterMile;  });

        data.constants.distributionFields.each(function(o){
          var field = o.property;
          data[timespan].halfMileDistribution[field] = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].halfMileDistribution[field];  });
          data[timespan].quarterMileDistribution[field] = data.constants[timespan].inject(0,function(tot,year){ return tot + data[year].quarterMileDistribution[field];  });
        });
        
        data[timespan].halfMileDistribution.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[timespan].halfMileDistribution[field]; 
        });

        data[timespan].quarterMileDistribution.total = data.constants.distributionFields.inject(0,function(total,o){ 
          var field = o.property;
          return total + data[timespan].quarterMileDistribution[field]; 
        });

      });
      self.publish('data-changed',data);
    });
    return self;
  };


TTI.Widgets.PropertyTaxSummary = function(spec) {
  var self = TTI.PubSub({});

  self.getYearRow = function(range) {
    var row = DOM.tr().addClass('year-row');
    row.append(DOM.th('&nbsp;'));
    range.each(function(item){
      var th = DOM.th(item.label);
      row.append(th);
    });
    return row;        
  };


  self.getMyRange = 'subclass responsibility';

  self.renderOn = function(wrap) {
    spec.report.subscribe('data-changed',function(data){
      wrap.empty();
      
      if (!data) { return false; }
      
      var tmpRow = false;
      var table = DOM.table();
      //wrap.append('FOO TEST');
      ///wrap.append(Math.random());
      console.log('summary here',data);
  
      var table = DOM.table().addClass('table-responsive');
      
      
      var myRange = self.getMyRange(data);
      
      table.append(self.getYearRow(myRange));    
        
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('Base Case Prop Tax Rev').attr('colspan',14));
        table.append(tmpRow);        

        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/2 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].baseCase.halfMile;
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
          rounded = accounting.formatMoney(rounded,'$',0);
          
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        
        
        tmpRow = DOM.tr().addClass('title-row').addClass('title-row');
        tmpRow.append(DOM.th('Station Prop Tax Rev').attr('colspan',14));
        table.append(tmpRow);        
        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/2 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].station.halfMile;
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
          rounded = accounting.formatMoney(rounded,'$',0);

          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        
        


        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('Change in Property Tax Revenue').attr('colspan',14));
        table.append(tmpRow);        
        
        tmpRow = DOM.tr();
        tmpRow.append(DOM.td('1/2 Mile'));
        myRange.each(function(item){
          var td = DOM.td().addClass('value-cell');
          var rounded = data[item.property].change.halfMile;
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
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        


        //////////////////////////////////////////////////////////////////////////////////////////////////////
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('1/2 Mile Distribution (Only Additional Funds)').attr('colspan',14));
        table.append(tmpRow);        
        
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          var label = o.label;
        
          tmpRow = DOM.tr();
          tmpRow.append(DOM.td(label));
          myRange.each(function(item){
            var td = DOM.td().addClass('value-cell');
            var rounded = data[item.property].halfMileDistribution[field];
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
          var rounded = data[item.property].halfMileDistribution.total;
          ////rounded = TTI.precision(rounded,2);
          rounded = accounting.formatMoney(rounded,'$',0);
          td.text(rounded);
          tmpRow.append(td);
        });
        table.append(tmpRow);        


        table.append(self.getYearRow(myRange));    




        //////////////////////////////////////////////////////////////////////////////////////////////////////
        tmpRow = DOM.tr().addClass('title-row');
        tmpRow.append(DOM.th('1/4 Mile Distribution (Only Additional Funds)').attr('colspan',14));
        table.append(tmpRow);        
        
        data.constants.distributionFields.each(function(o){
          var field = o.property;
          var label = o.label;
        
          tmpRow = DOM.tr();
          tmpRow.append(DOM.td(label));
          myRange.each(function(item){
            var td = DOM.td().addClass('value-cell');
            var rounded = data[item.property].quarterMileDistribution[field];
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
          var rounded = data[item.property].quarterMileDistribution.total;
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



TTI.Widgets.PropertyTaxFullSummary = function(spec) {
  var self = TTI.Widgets.PropertyTaxSummary(spec);
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



TTI.Widgets.PropertyTaxBriefSummary = function(spec) {
  var self = TTI.Widgets.PropertyTaxSummary(spec);

  self.getMyRange = function(data) {
      var myRange = [
        { label: 'Five Years', property: 'fiveYears' },
        { label: 'Ten Years', property: 'tenYears' }
      ];
    return myRange;
  };

  return self;
};





TTI.Widgets.PropertyTaxStyledSummary = function(spec) {
  var self = TTI.Widgets.PropertyTaxSummary(spec);

  self.getMyRange = function(data) {
      var myRange = [
        { label: 'Five Years', property: 'fiveYears' },
        { label: 'Ten Years', property: 'tenYears' }
      ];
    return myRange;
  };
  
  


  self.renderSummaryTableOn = function(wrap,item,data) {
    console.log('rSTO');
  
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
    tmpRow.append(DOM.th('Property Tax Revenue'));
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
        rounded = accounting.formatMoney(rounded / 1000000,'$',1) + 'M';
        td.text(rounded);
        tmpRow.append(td);
      });
      table.append(tmpRow); 
    });

    //
    rowData = [
      { label: '1/2 Mile (Additional Funds)',property: data[item.property].halfMileDistribution },
      { label: '1/4 Mile (Additional Funds)',property: data[item.property].quarterMileDistribution },
    ];

    columnData = JSON.parse(JSON.stringify(data.constants.distributionFields));
    columnData.push({ label: 'Total', property: 'total' });
    
    console.log('just pushed Total onto columnData',data.constants.distributionFields);


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
        //rounded = accounting.formatMoney(rounded,'$',0);
        rounded = accounting.formatMoney(rounded / 1000000,'$',1) + 'M';
        
        td.text(rounded);
        tmpRow.append(td);
      });
      table.append(tmpRow); 
    });
    wrap.append(table);  
  };



  self.renderOn = function(wrap) {
    console.log('renderOn');
    spec.report.subscribe('data-changed',function(data){
      console.log('data-changed!!');
      wrap.empty();
	// wrap.addClass('table-responsive');
      if (!data) { return false; }
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


















