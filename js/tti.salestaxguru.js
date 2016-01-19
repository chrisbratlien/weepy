    TTI.SalesTaxGuru = function(spec) {

      var wrap = false;
      ///var sticky = spec.sticky;
      var sticky = {};
      var orderedDimensions = [
        ///{ label: 'County', property: 'county' },
        { label: 'City', property: 'city' },
        /////{ label: 'School District', property: 'schoolDistrictName' },
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


        var tmp = TTI.storage.getItem(TTI.slugify(dimension));
        if (tmp) { selectedChoiceByDim[dimension] = tmp; }
        
        if (sticky[dimension]) {
          selectedChoiceByDim[dimension] = sticky[dimension];
        }
      });
      
      var hitCount = DOM.div().addClass('hit-count');
      self.refresh = function() {

        var hits = candidates;

        self.renderControlsOn(wrap,hits);

        var newHits = self.getHitsForSelection(); //defaults to zero due to false values
        if (newHits.length == 0) {
          ///console.log('ZERO!!',selectedChoiceByDim);
          self.publish('zero-hits');
        }
        else if (newHits.length == 1) {
          ///console.log('single!!',selectedChoiceByDim);
          ///console.log('ST guru single-hit');
          self.publish('single-hit',newHits[0]);
        }
        else if (newHits.length > 1) {
          ///console.log('MULT!',selectedChoiceByDim);
          self.publish('multiple-hits',newHits);
        }        
      };
      
      
      self.getHitsForSelection = function() {
        var result = spec.candidates;
        Object.keys(selectedChoiceByDim).each(function(key){
          result = result.select(function(o){ 
            if (!selectedChoiceByDim[key]) { return true; }
            var candidate = TTI.noParens(o.spec[key]);
            var selected = TTI.noParens(selectedChoiceByDim[key]);
            return candidate == selected;
          });
        });
        return result;
      };
      
      
      
      
      
      
      self.choiceItemsForDimension = function(dim,sample) {
        ///console.log('self.choiceItemsForDimension',dim,sample);
                      
        var dimName = orderedDimensions[dim].property;
        var filter = function(hit){
            var flag = true;
            orderedDimensions.forEach(function(k,i){
                if (dim<=i) return;
                var d = k.property;
                var s = TTI.noParens(selectedChoiceByDim[d]);
                var v = TTI.noParens(hit.spec[d]);
                if (s){
                    if(v !==s ) flag = false;                         
                }                                   
            });           
            return flag;
            
            
            
            };        
         
          var selectedSample = sample.select(filter); 
          var choices = selectedSample.map(function(o){ 
            //console.log('choice',o);
            
            var result = o.spec[dimName]; //NOTE: let the parens stay here
            result = result.trim();
            return result; 
          });
          
          ////console.log('choices22',choices,'sample22',sample);
          
          var uniq = choices.unique();
          var choiceItems = uniq.map(function(o){ return { label: o, object: o }; });
          choiceItems.unshift({ label: 'No choice', object: false });
          return choiceItems;
      }
      
      self.renderControlsOn = function(wrap,sample,dim) {
        ////var controls = DOM.div().addClass('controls');
        
        var controls = DOM.table().addClass('controls');
        
        
        orderedDimensions.forEach(function(od,i){
       
          var dimension = od.property;
          var choiceItems;
          ///console.log('dimension',dimension);
          /////var isSticky = od.sticky;
          ////console.log('rCO::sample',sample);
          
          var  choiceItems = self.choiceItemsForDimension(i,sample);
          var dropdown = DOM.select().addClass('form-control');
          var dropdownItem = [];
          choiceItems.each(function(choice){
            if (!choice.label || choice.label.length == 0) { return false; }
            ///console.log('>>>>' + choice.label + '<<<<<');
            dropdownItem.push(choice.label);
            var opt = DOM.option(choice.label);
            
            
            //console.log('choice',choice,'choice.object',choice.object,'selectedChoiceByDim[dimension]',selectedChoiceByDim[dimension]);
            
            
            if (TTI.noParens(selectedChoiceByDim[dimension]) == TTI.noParens(choice.object)) {
              opt.attr('selected',true);
            }
            ///console.log('dimension',dimension,'sticky[dimension]',sticky[dimension],'choice.object',choice.object);
            dropdown.append(opt);
          });
          dropdownList[i]=dropdownItem;
          dropdown.change(function(){
            var selected = choiceItems[this.selectedIndex].object;
            selectedChoiceByDim[dimension] = TTI.noParens(selected);
            TTI.storage.setItem(TTI.slugify(dimension),selectedChoiceByDim[dimension]);
            self.refresh();
          });
          
          //var control = DOM.li().addClass('control');
          var control = TTI.tableRow(od.label,'&nbsp;',dropdown);
          
          
          
          
          //control.append(DOM.label(od.label));
          //control.append('&nbsp;');
          ///control.append(dropdown);
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
