TTI.Widgets.EconomicImpactInputs = function(spec) {
  var self = TTI.PubSub({});
  
  self.spec = spec;


  var boxes = DOM.ul().addClass('boxes');
  var sliders = DOM.div().addClass('sliders');
  var dropdowns = DOM.ul().addClass('dropdowns');


  
  self.nudge = function() {
    self.publish('change',spec);
  };

  self.renderOn = function(wrap) {
    var li;

    var cipInput = DOM.input();
    cipInput.val(spec.changeInProduction);
    
    
    cipInput.change(function(){
      spec.changeInProduction = parseInt(this.value,10);
      self.publish('change',spec);
    });  
    
    
    var model = TTI.Models.InputOutputModel({
      input: spec
    });
    
    ////console.log("ZZmodel",model);
    
    var sectorItems = Object.keys(model.data).map(function(o){
      var result = {};
      result.sector = model.data[o].Sector;
      result.name = o;
      result.label = o;
      result.property = model.data[o].Sector;
      return result;
    });
      
    ///}); 
    ///console.log('sectorItems',sectorItems);  
    var sectorInput = DOM.select();  
    sectorItems.each(function(o){
      var opt = DOM.option();
      opt.text(o.label);
      
      opt.attr('selected',spec.selected.detect(function(z){ return z == o.property }));
      
      sectorInput.append(opt);
    });    
    sectorInput.change(function(){
      var sector = sectorItems[this.selectedIndex].property;
      
      spec.selected = [sector];
      
      //////console.log('wookie');
      self.publish('change',spec);
    });



    li = DOM.li();
    li.append(DOM.label('Sector'));
    li.append('&nbsp;');
    li.append(sectorInput);

    dropdowns.append(li);    


    
    li = DOM.li();

    li.append(DOM.label('Change in Production'));
    li.append('&nbsp;');
    li.append(cipInput);

    boxes.append(li);

    
    wrap.append(dropdowns);
    wrap.append(boxes);
  };
  return self;
};


TTI.Widgets.EconomicImpactReport = function(spec) {
  var self = TTI.PubSub({});
  var results = false; 

  var inputs = spec.inputs;
  
  
  var wrap = false;


  self.getResults = function() {
    return results;
  };

  inputs.subscribe('change',function(data) {
    ////console.log('yay',data);
  
    var model = TTI.Models.InputOutputModel({
        input: data
    });
    
    /////console.log('model',model);
    
    
    model.show();
    results = model.run().results;  
    self.publish('results-ready',results);  
    self.publish('plot-level1',{ results: results, title: spec.title });
  });

  
  self.subscribe('plot-level1',function(o){
    if (!wrap) { return false; } //headless
    wrap.empty();
    
    var keys = Object.keys(o.results);
    keys.each(function(key){
    
      var titleString = o.title;
      /////titleString = titleString.replace(/Trade/,'Sales');
    
      var reportTitle = DOM.caption(titleString).addClass('report-title');
      
      wrap.append(reportTitle);
      self.publish('plot-level2',o.results[key]);
    });
    
  });
    
    self.subscribe('plot-level2',function(o){
      //console.log('level2',o);
      var keys = Object.keys(o);
      ////console.log('level2::keys',keys);
      //var table = DOM.table();
      keys.each(function(key){


        var titleString = key;      
        titleString = titleString.replace(/Production/,'Retail Sales');
        titleString = titleString.replace(/Retail\ Trade/,'Retail Sales');

        self.publish('plot-level3',{ data: o[key], table: wrap, title: titleString });
      });
     // wrap.append(table);
      self.publish('redraw-complete',wrap);
    });
    
    self.subscribe('plot-level3',function(o){
      var data = o.data;
      var table = o.table;
      var rowIndex = data.RowIndex;
      
      var title = o.title;
      
      var titleRow = DOM.tr().addClass('dart-yellow-bg black-fg');
      var titleCell = DOM.th().attr('colspan',2);
      titleCell.text(title);
      titleRow.append(titleCell);
      table.append(titleRow);

      
      data.Headers.each(function(header) {
        var dataRow = data.Rows[0];
        
        ///var header = data.Headers[index];
        ////var dataRow = data.Rows[index];
        var value = dataRow[header];
        
        var row = DOM.tr();
        
        var headerString = header;
        headerString = headerString.replace(/Production/,'Retail Sales');
        
        row.append(DOM.td(headerString).addClass('subhead'));
        var rounded = value;
        
        if (spec.inputs.spec.full) {
          rounded = accounting.formatMoney(rounded,'$',0);
        }
        else if (title.match(/Income|Activity|Production|Retail\ Trade|Retail\ Sales/)) {
          rounded = accounting.formatMoney(rounded / 1000000,'$',1) + 'M';
        }
        else if (title.match(/Number of Jobs/)) {
          rounded = accounting.toFixed(rounded,0);
        }
        
        row.append(DOM.td(rounded).addClass('value-cell'));
        table.append(row);
      });
    });
    

    self.renderOn = function(o) {
      var table = DOM.table();
      o.append(table);      
      wrap = table;
      ////console.log('RENDER HAWN!!!!');
      inputs.nudge();
    }; 

  return self;

};