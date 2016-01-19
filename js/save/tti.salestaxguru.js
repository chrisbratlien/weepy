    TTI.SalesTaxGuru = function(spec) {

      var wrap = false;
      
      var sticky = spec.sticky;
      var orderedDimensions = [
        /** 
        these are now sticky.
        { label: 'Surface Type', property: 'surfaceType' },
        { label: 'Category', property: 'category' },
        { label: 'Wet/Dry', property: 'wetDry'},
        { label: 'Freeze/No Freeze', property: 'freezeNoFreeze', },
        **/
        ///{ label: 'County', property: 'county' },
        { label: 'City', property: 'city' },
        ////{ label: 'School District', property: 'schoolDistrictName' },
      ];
      
      var self = TTI.PubSub({});
      var candidates = spec.candidates;
      
      /////////console.log('candidates',candidates);
      
      
      var allChoicesByDim = { };
      var allChoicesArray = [];

      var selectedChoiceByDim = {};

      //init to false, followed by anything sticky
      orderedDimensions.each(function(od){
        var dimension = od.property;
        selectedChoiceByDim[dimension] = false;
        
        if (sticky[dimension]) {
          selectedChoiceByDim[dimension] = sticky[dimension];
        }
      });
      
    var ul = DOM.ul().addClass('hits');
      var table = DOM.table().addClass('table table-bordered table-condensed');
      var thead = DOM.thead();
      var headRow = DOM.tr();
      thead.append(headRow);
      
      headRow.append(DOM.th('Total Ad Valorem Tax Rate (from spec)').addClass('th-inverse'));
      headRow.append(DOM.th('Total Ad Valorem Tax Rate (computed)').addClass('th-inverse'));
      
      var tbody = DOM.tbody();
      table.append(thead);
      table.append(tbody);



      
      var hitCount = DOM.div().addClass('hit-count');

      ///var controlsWrap = false;/////DOM.div().addClass('controls-wrap');

    
      self.refresh = function() {

        ////console.log('REFRESH!!');
        var hits = candidates;
        ///console.log('hits/cand',hits);

  

        //console.log('sticky',sticky,'cand.length', candidates.length);


        orderedDimensions.each(function(od,i){
          //console.log('od',od);
          var dimension = od.property;
          hits = hits.select(function(hit){
            var selected = selectedChoiceByDim[dimension];
            /////console.log('selected',dimension,'is',selected);
            
            if (!selected) { return true; } //not going to rule this candidate out if there's no filter specified for this dimension
            return hit.spec[dimension] == selected;
          });


          ///console.log('refresh::hits',hits);

          self.renderControlsOn(wrap,hits);

        });

        ul.empty();
        
        tbody.empty();
        
        hits.each(function(o){
        
          //console.log('hit',o);
        
          var li = DOM.li();
          
          var recommended = DOM.div().addClass('recommended');
          var acceptDiv = DOM.div().addClass('accept');
          
          
          var row = DOM.tr();
          row.append(DOM.td(o.spec.city));
          row.append(DOM.td(o.spec.economicDevSec4A));
          tbody.append(row);
          
          
          ///li.html(o.distressDesc + ' => ' + ' (acceptable) ' +  o.treatment.accept + ' (recommended) ' + o.treatment.best);
          ul.append(li);
        });
        
        
        //console.log('hits',hits);
        
        hitCount.text(hits.length + ' hits');
        
        
        
        
        
        if (hits.length == 1) {
        
          self.publish('single-hit',hits[0]);
        
          ////table.show();
        }
        else {
          table.hide();
        }
      
      };
      
      self.choiceItemsForDimension = function(dimension,sample) {
        ///console.log('sample',sample);

          var choices = sample.map(function(o){ 
            //console.log('choice',o);
            
            var result = o.spec[dimension];
            result = result.trim();
            return result; 
          });
          
          ////console.log('choices22',choices,'sample22',sample);
          
          var uniq = choices.unique();
          var choiceItems = uniq.map(function(o){ return { label: o, object: o }; });
          choiceItems.unshift({ label: 'No choice', object: false });
          return choiceItems;
      }
      
      self.renderControlsOn = function(wrap,sample) {
        var controls = DOM.div().addClass('controls');
        orderedDimensions.forEach(function(od,i){
          var dimension = od.property;
          
          ///console.log('dimension',dimension);
          /////var isSticky = od.sticky;
          ////console.log('rCO::sample',sample);
          
          var choiceItems = self.choiceItemsForDimension(dimension,sample);
          var dropdown = DOM.select();
          choiceItems.each(function(choice){
            if (!choice.label || choice.label.length == 0) { return false; }
            ///console.log('>>>>' + choice.label + '<<<<<');
            
            var opt = DOM.option(choice.label);
            
            
            //console.log('choice',choice,'choice.object',choice.object,'selectedChocieByDim[dimension]',selectedChoiceByDim[dimension]);
            
            
            if (selectedChoiceByDim[dimension] == choice.object) {
              opt.attr('selected',true);
            }
            
            ///console.log('dimension',dimension,'sticky[dimension]',sticky[dimension],'choice.object',choice.object);
            /***
            if (TTI.sticky[dimension] && TTI.sticky[dimension] == choice.object) {
              opt.attr('selected',true);
            }
            ***/
            
            dropdown.append(opt);
          });
          
          dropdown.change(function(){
            var selected = choiceItems[this.selectedIndex].object;
            
            selectedChoiceByDim[dimension] = selected;
          
            /***
            if (isSticky) {
              sticky[dimension] = selected;
            }
            ****/
            
            ///console.log('selected',selected);
            self.refresh();
          });
          
          var control = DOM.li().addClass('control');
          control.append(DOM.label(od.label));
          control.append('&nbsp;');
          control.append(dropdown);
          controls.append(control);
        });
        
        ///console.log('wrap',wrap);
        
        wrap.empty();
        wrap.append(controls);
        wrap.append(DOM.div('&nbsp;').css('clear','both'));
      };
      
      self.renderOn = function(o) {
        /////console.log('renderOn called');
        ////wrap.append(controlsWrap);
        wrap = o;
        
        ////console.log('rO::candidates',candidates);
        
        self.renderControlsOn(wrap,candidates);
        wrap.append(hitCount);
        //wrap.append(ul);
        //////wrap.append(table);
        self.refresh();
      }
    
    
    
      self.update = function(s) {
        console.log('alreight, update!!')
        sticky = s;
        orderedDimensions.each(function(od){
          var dimension = od.property;
          ////selectedChoiceByDim[dimension] = false;
          if (sticky[dimension]) {
            selectedChoiceByDim[dimension] = sticky[dimension];
          }
        });
        self.refresh();
      };
      return self;
    };
