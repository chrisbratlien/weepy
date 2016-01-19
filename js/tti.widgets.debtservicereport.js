TTI.Widgets.DebtServiceReport = function(spec) {
  var self = TTI.PubSub({});


  function convertToTbl(d) {
    //d:{Headers:[],RowIndex:[],Rows[]}
    var keys = Object.keys(d);
    //console.log(keys);
    var tbl = DOM.table();
    var headerRow = DOM.tr();
    if (keys.indexOf('Rows')!==-1)
    {
        headerRow.append(DOM.td('id'));
        d.Headers.forEach(function (h) {
            var c = DOM.td(h);
            headerRow.append(c);
        });
        tbl.append(headerRow);
        d.RowIndex.forEach(function (y) {
            var id = y - d.RowIndex[0];
            var row = DOM.tr();
            var dataRow = d.Rows[id];
            row.append(DOM.td(y));
            d.Headers.forEach(function (h) {
                var c;
                var v;
                if (isNaN(v=dataRow[h]))
                    c = DOM.td(v);
                else
                    c = DOM.td(v.toFixed(1));
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
  };

  self.renderOn = function(wrap) {
    accounting.settings.currency.format = {
    	pos : "%s%v",   // for positive values, eg. "$ 1.00" (required)
    	///neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
    	neg : "(%s%v)", // for negative values, eg. "$ (1.00)" [optional]
    	zero: "%s%v"  // for zero values, eg. "$  --" [optional]
    };    

    var results = false;
    var model = TTI.Models.DebtServicesModel({ input: spec });
    model.setInputs(spec);
    results = model.run().results;
    wrap.empty();
    wrap.append(convertToTbl(results));

    self.publish('redraw-complete',wrap);
  };

  return self;
};