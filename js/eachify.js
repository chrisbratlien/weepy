function eachify(ary) {
  ary.eachPCN = function() { //gives your callback a view of previous, current, and next
  
    var length = ary.length;
    var c,p,n = false;
    var timeout = false;
    var callback = arguments[0];
    
    if (arguments.length > 1) { timeout = arguments[1]; }    
    function iterate() {
        callback({ prev: ary[p], current: ary[c], next: ary[n], p: p, c: c, n: n, length: length });    
        c += 1; c %= length;
        n += 1; n %= length;
        p += 1; p %= length;
    }
    function spin() {
      iterate();
      setTimeout(spin,timeout);
    }
    switch(length) {
        case 0:
          console.log('err-OR! does not compute. ');
          break;
        case 1:
          c = 0; n = 0; p = 0;
          break;
        case 2: 
          c = 0; n = 1; p = 1;
          break;
        default:
          c = 0; n = 1; p = length - 1;
          break;
    }    
    
    if (timeout) { spin(); }
    else {
        for(var i = 0; i < length; i += 1) { iterate(); }      
    }
  };
  return ary;
}