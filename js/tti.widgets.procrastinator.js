if (typeof TTI == "undefined") { var TTI = {}; }
if (typeof TTI.Widgets == "undefined") { TTI.Widgets = {}; }
TTI.Widgets.Procrastinator = function(spec) {

  ///console.log('spec',spec);

  var updateRequests = [];
  var lastStamp = new Date().getTime();
  var timeout = spec.timeout || 1200; //update Threshold
  
  function checkRequests() {
    ////console.log('cr updateRequests.length',updateRequests.length);


    if (updateRequests.length > 1) {
      updateRequests.shift();
      return false;
    }
    
    var winner = updateRequests.shift();
    
    ///console.log('winner',winner);
    TTI.winner = winner;
    
    if (typeof winner.callback != "undefined") {
      winner.callback();
      return false;
    }
    
    winner.receiver.publish(winner.topic,winner.payload);
  }

  var self = TTI.PubSub({});
  self.beg = function(receiver,topic,payload) {
    if (updateRequests.length > 5) { return false; }
    
    ////console.log('yay!!!',receiver,topic,payload);
    
    
    if (!topic) {
      updateRequests.push({ callback: receiver });
    }
    else {
      updateRequests.push({ receiver: receiver, topic: topic, payload: payload });  
    }
    
    
    setTimeout(function() { checkRequests(); } ,timeout);
  };
  
  return self;
};