TTI.Widgets.BenefitCostInputs = function(spec) {
  var self = TTI.PubSub({});

  var waiter = TTI.Widgets.Procrastinator({ timeout: 100 });

  var origSpec = JSON.parse(JSON.stringify(spec));

  ///self.spec = spec;

  var boxes = DOM.table().addClass('boxes');
  var sliders = DOM.div().addClass('sliders');
  var dropdowns = DOM.table().addClass('dropdowns');

  /***
  var specials = DOM.div().addClass('specials');
  ***/

  var serviceTypeItems = TTI.serviceTypeItems;

  /* Parker: Red, Rowlett: Blue, Denton: Green,
Beltline: Orange, Lawnview: Green, T&P: Red,
BRT: Black, Streetcar: Black */
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
  
  /// 
  var dropdownItems = [
    { label: 'Type of Service', items: serviceTypeItems, property: 'serviceType' },
    { label: 'Closest Exiting Station', items: closestStationItems, property: 'closestStation' },
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
      opt.attr('style',o.style);
      opt.text(o.label);
      input.append(opt);
    });
    input.change(function(){
      spec[ddItem.property] = ddItem.items[this.selectedIndex].property;
      TTI.storage.setItem(TTI.slugify(ddItem.property),spec[ddItem.property]);
      self.publish('recalc',spec);
    });
    ////li.append(input);
    
    var row = TTI.tableRow(ddItem.label,'&nbsp;',input);
    dropdowns.append(row);

  });



  var sliderItems = [
    { label: 'Approximate miles to connecting station', property: 'milesToStation', min: 2, max: 15, step: 1, value: spec.milesToStation, format: function(x) { return x; } },
    { label: 'Ridership at new station', property: 'rider', min: 10000, max: 300000, step: 10000, value: spec.rider, format: function(x) { return accounting.formatNumber(x); } },
    { label: 'Discount rate', property: 'discountRate', min: 0, max: 0.1, step: 0.001, value: spec.discountRate, format: function(x) { return accounting.toFixed(x*100,1) + '%'; } },
    { label: 'Travel growth rate', property: 'travelGrowthRate', min: 0, max: 0.05, step: 0.001, value: spec.travelGrowthRate, format: function(x) { return accounting.toFixed(x*100,1) + '%'; } },
  ];



  var resetButton = DOM.button('reset sliders').addClass('btn btn-primary btn-reset pull-right');
  resetButton.click(function(){
    self.publish('reset-sliders');
  });
  sliders.append(resetButton);
  sliders.append(DOM.div('&nbsp;').css('clear','both'));

  
  
  
  sliderItems.each(function(item){
    var slug = TTI.slugify('benefit-cost-' + item.property);
    var changed = false;
    var origValue = origSpec[item.property];

    var tmp = TTI.storage.getItem(slug);
    if (tmp) {
      tmp = parseFloat(tmp);
      if (tmp !== origValue) {
        changed = true;
      }
      spec[item.property] = tmp;
    }
    var theValue = spec[item.property];
    /////var theValue = item.value;

    //jquery UI slider
    var input = DOM.div();/////.attr('type','range').attr('min',item.min).attr('max',item.max).attr('step',item.step);
    input.val(theValue);
    var span = DOM.span();
    span.text(item.format(theValue));
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
      /////self.publish('recalc',spec);
      waiter.beg(self,'recalc',spec);
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
      input.slider( "option", "value", origValue);  //this triggers the "change" -> refresher -> recalc 
      spec[item.property] = origValue;
      TTI.storage.setItem(slug,origValue);
    });
    
    
    sliders.append(DOM.label(item.label));
    sliders.append('&nbsp;');
    sliders.append(span);  
    sliders.append(input);  
    sliders.append(DOM.div('&nbsp;').css('clear','both'));
  });



  var textboxItems = [
    { label: 'Construction starts', property: 'constructionStartYear', value: 2015 },
    { label: 'Operation starts', property: 'operationStartYear', value: 2018 },
    { label: 'Constant year', property: 'constantYear', value: 2015 },
    /////{ label: 'Project scenario', property: 'projectScenario', value: 0.1 },
  ];
  
  
  var resetButton = DOM.button('reset boxes').addClass('btn btn-primary pull-right');
  resetButton.click(function(){
    self.publish('reset-boxes');
  });     
  dropdowns.append(TTI.tableRow('&nbsp;','&nbsp;',resetButton));
  
  
  
  textboxItems.each(function(item){

    var slug = TTI.slugify('benefit-cost-' + item.property);

    var changed = false;
    var origValue = origSpec[item.property];


    var tmp = TTI.storage.getItem(slug);
    if (tmp) {
      tmp = parseInt(tmp,10);
      if (tmp !== origValue) {
        changed = true;
      }
      spec[item.property] = tmp;
    }
    


    var li = DOM.li();
    var label = item.label;
    var input = DOM.input().attr('type','text').addClass('form-control');
    input.val(spec[item.property]);
    if (changed) {
      input.addClass('changed');
    }
    
    
    input.change(function(){

      var v = parseInt(this.value,10);  
      if (isNaN(v)) { return false; }
      spec[item.property] = v;
      (v == origValue) ? input.removeClass('changed') : input.addClass('changed');
      TTI.storage.setItem(slug,v);
      waiter.beg(self,'recalc',spec);  
      
    });
    self.subscribe('reset-boxes',function(){
      spec[item.property] = origValue;
      TTI.storage.setItem(slug,origValue);
      input.val(origValue);
      input.trigger('change');
    });
    

    /***
    li.append(label);
    li.append('&nbsp;');
    li.append(input);
    li.append(DOM.div('&nbsp').addClass('clear-both'));
    ****/
    
    var row = TTI.tableRow(label,'&nbsp;',input);
  
    boxes.append(row);
  }); 

  self.nudge = function() {
    self.publish('recalc',spec);
  };

  self.renderOn = function(wrap) {
    wrap.append(dropdowns);
    wrap.append(boxes);
    wrap.append(sliders);
    //wrap.append(specials);
  };
  return self;
};


TTI.Widgets.BenefitCostReport = function(spec) {
  var self = TTI.PubSub({});
  var results = false; 



  function convertToTbl(d) {
    //d:{Headers:[],RowIndex:[],Rows[]}
    var keys = Object.keys(d);
    //console.log(keys);
    var tbl = DOM.table();
    var headerRow = DOM.tr().addClass('header-row');
    if (keys.indexOf('Rows')!==-1)
    {
        //headerRow.append(DOM.td('id'));
        d.Headers.forEach(function (h) {
            var c = DOM.th(h);
            headerRow.append(c);
        });
        tbl.append(headerRow);
        d.RowIndex.forEach(function (y) {
            var id = y - d.RowIndex[0];
            var row = DOM.tr();
  
            var bcRatio = false;
            var jobs = false;
            ////var cssClass = 
            
            
            var dataRow = d.Rows[id];
            //row.append(DOM.td(y));
            d.Headers.forEach(function (h) {
                var c;
                var v;
                if (isNaN(v=dataRow[h])) { // labeled cell
                
                  if (v == 'Benefit/Cost Ratio') {  
                    bcRatio = true; 
                  }
                  if (v.match(/jobs/i)) {  
                    jobs = true; 
                  }
                    c = DOM.td(v);
                    var slug = TTI.slugify(v);
                    row.addClass(slug);
                }
                else { //value cell
                  var rounded;
                  if (bcRatio) {
                    rounded = v.toFixed(1);
                    c = DOM.td(rounded);
                  }
                  else {
                    rounded = v / 1000000;
                    


                    if (jobs) {
                      rounded = accounting.toFixed(rounded,0);
                    }
                    else {                  
                      rounded = accounting.formatMoney(rounded,'$',0);
                    }
                    
                    
                    
                    
                    
                    c = DOM.td(rounded);
                  }
                 c.addClass('value-cell');
                }
                row.append(c);
            });
            tbl.append(row);
        });
        return tbl;
    }
    else
    {
        keys.forEach(function(k){
            var nTbl = DOM.table();
            nTbl.append(DOM.caption(k));
            nTbl.append(convertToTbl(d[k]));
            tbl.append(nTbl);
        });
        return tbl;
    }   
  }


  spec.inputs.subscribe('recalc',function(data){
    var bca = TTI.Models.BenefitCostAnalysis({
      input: data
    });
    
    bca.setInputs(data);
    results = bca.run().results;
    var report = results.report;
  
    wrap.empty();
    wrap.append(convertToTbl(report));
    self.publish('refresh-complete',wrap);
    self.publish('redraw-complete',wrap);
  });

  self.renderOn = function(o) {
    wrap = o;
    ////console.log('RENDER HAWN!!!!');
    inputs.nudge();
    
    self.publish('render-complete');
  }; 

  return self;

};
