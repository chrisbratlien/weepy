    TTI.PropertyTaxGuru = function(spec) {

      var wrap = false;
      ///var sticky = spec.sticky;
      var sticky = {};
      var orderedDimensions = [
        { label: 'County', property: 'county' },
        { label: 'City', property: 'city' },
        { label: 'School District', property: 'schoolDistrictName' },
      ];
     
      var self = TTI.PubSub({});
      var candidates = spec.candidates;
      
      //console.log('candidates',candidates);
      
      
      var allChoicesByDim = { };
      var allChoicesArray = [];
      var dropdownList = [[],[],[]];
      //var selectedDim = 0;
      var selectedChoiceByDim = {};

      //init to false, followed by anything sticky
      orderedDimensions.each(function(od){
        var dimension = od.property;
        selectedChoiceByDim[dimension] = false;
        
        if (sticky[dimension]) {
          selectedChoiceByDim[dimension] = sticky[dimension];
        }
      });
      
      var hitCount = DOM.div().addClass('hit-count');
      self.refresh = function() {

        var hits = self.getHitsForSelection(); //defaults to zero due to false values
        console.log('hits',hits);
        self.renderControlsOn(wrap,hits);
        
        if (hits.length == 0) {
          console.log('ZERO!!',selectedChoiceByDim);
          self.publish('zero-hits');
        }
        else if (hits.length == 1) {
          console.log('single!!',selectedChoiceByDim);
          self.publish('single-hit',hits[0]);
        }
        else if (hits.length > 1) {
          console.log('MULT!',selectedChoiceByDim);
          self.publish('multiple-hits',hits);
        }        
      };
      
      
      self.getHitsForSelection = function() {
        var result = spec.candidates;
        Object.keys(selectedChoiceByDim).each(function(key){
          result = result.select(function(o){ 
            if (!selectedChoiceByDim[key]) { return true; }
            
            
            var candidate = self.noParens(o.spec[key]);
            var selected = self.noParens(selectedChoiceByDim[key]);
            
            ///////console.log('candidate',candidate,'selected',selected);
            
            return candidate == selected;
          });
        });
        return result;
      };
      
      
      self.noParens = function(o) {
        if (!o) { return o; }
        return o.replace(/\(.*\)/,'').trim();
      };
      
      self.choiceItemsForDimension = function(dim,sample) {
          console.log('self.choiceItemsForDimension',dim,sample);
                      
        var dimName = orderedDimensions[dim].property;
        
        console.log('dimName',dimName);
        
        var filter = function(hit){
            var flag = true;
            orderedDimensions.forEach(function(k,i){
                if (dim<=i) return;
                var d = self.noParens(k.property);
                var s = self.noParens(selectedChoiceByDim[d]);
                if (s){
                    if(hit.spec[d]!==s) flag = false;                         
                }                                   
            });           
            return flag;
            
            
            
            };        
         
          var selectedSample = sample.select(filter);
          var choices = selectedSample.map(function(o){ 
            //console.log('choice',o);
            
            var result = o.spec[dimName];
            result = result.trim();
            return result; 
          });
          
          ////console.log('choices22',choices,'sample22',sample);
          
          var uniq = choices.unique();
          var choiceItems = uniq.map(function(o){ 
            
            var noParens = self.noParens(o); 
            
            return { label: o, object: noParens }; 
            
            
          });
          choiceItems.unshift({ label: 'No choice', object: false });
          return choiceItems;
      }
      
      self.renderControlsOn = function(wrap,sample,dim) {
        var controls = DOM.div().addClass('controls');
        
        orderedDimensions.forEach(function(od,i){
       
          
       
          var dimension = od.property;
          var choiceItems;
          
          var  choiceItems = self.choiceItemsForDimension(i,sample);
          
          console.log('choiceItems for',dimension,choiceItems,i,od);

          
          var dropdown = DOM.select();
          var dropdownItem = [];
          choiceItems.each(function(choice){
            if (!choice.label || choice.label.length == 0) { return false; }
            ///console.log('>>>>' + choice.label + '<<<<<');
            dropdownItem.push(choice.label);
            var opt = DOM.option(choice.label);
            
            
            //console.log('choice',choice,'choice.object',choice.object,'selectedChoiceByDim[dimension]',selectedChoiceByDim[dimension]);
            
            
            if (selectedChoiceByDim[dimension] == choice.object) {
              opt.attr('selected',true);
            }
            ///console.log('dimension',dimension,'sticky[dimension]',sticky[dimension],'choice.object',choice.object);
            dropdown.append(opt);
          });
          dropdownList[i]=dropdownItem;
          dropdown.change(function(){
            var selected = choiceItems[this.selectedIndex].object;
            console.log('SELECTED',selected);
            selectedChoiceByDim[dimension] = selected;
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
        //console.log(dropdownList);
      };
      
      self.renderOn = function(o) {
        wrap = o;
        self.renderControlsOn(wrap,candidates);
        self.refresh();
      }
    
      self.update = function(s) {
        self.refresh();
      };
      return self;
    };
