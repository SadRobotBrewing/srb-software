
var phidget = require('phidgetapi').phidget;

module.exports = function() {
  var p = new phidget();
  
  var relays = [
    { id: "V01", name: "HERMS ut",     key: "1" },
    { id: "V02", name: "HLT förbi",    key: "2" },
    { id: "V03", name: "HERMS in",     key: "3" },
    { id: "V04", name: "Utlopp HLT",   key: "4" },
    { id: "V05", name: "Utlopp MLT",   key: "5" },
    { id: "V06", name: "Utlopp KET",   key: "6" },
    { id: "V07", name: "Till HLT",     key: "7" },
    { id: "V08", name: "P1 till MLT",  key: "8" },
    { id: "V09", name: "P2 till MLT",  key: "9" },
    { id: "V10", name: "Till KET",     key: "10" },
    { id: "V11", name: "Till FV",      key: "11" },
    { id: "P1",  name: "Vatten",       key: "12" },
    { id: "P2",  name: "Vatten, Vört", key: "13" }
  ];
  
  function getIdFromKey(key) {
    for (var n = 0; n < relays.length; n++) {
      if (key === relays[n].key) {
        return relays[n].id;
      }
    }
  };
  
    
  
  this.connect = function(callback) {
    
    p.on("log", function(data) {
      console.log('log ', data);
    });

    p.on("error", function(data) {
      console.log('error ', data);
    });  
    
    p.on('phidgetReady', function() {
      console.log('InterfaceKit (p) ready');
      console.log(p.data);
        /*
        p.set(       {
                    type:'Output',
                    key:'10',
                    value:'1'
                }
        );*/
        
      callback();
    });
    
    p.connect({
      host    : 'localhost',
      port    : 5001,
      version : '1.0.10', //older phidgetwebservice installs may require 1.0.9
      password: null,
      type    : 'PhidgetInterfaceKit',
      rawLog  : true
    });
  };
  
  this.setValves = function(valves) {
    for (var n = 0; n < relays.length; n++) {
      var id = getIdFromKey(relays[n].key);
      
      var value = valves.indexOf(id) === -1 ? "0" : "1";
      console.log("key", relays[n].key, "id", id, "value", value, valves);
      
      p.set({
        type:'Output',
        key:relays[n].key,
        value:value
      });
    }
  }
};