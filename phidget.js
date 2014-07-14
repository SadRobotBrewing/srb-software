
var phidget = require('phidget-interfacekit');

module.exports = function() {
  var relays = [
    { id: "V01", name: "HERMS ut",     key: 1 },
    { id: "V02", name: "HLT förbi",    key: 2 },
    { id: "V03", name: "HERMS in",     key: 3 },
    { id: "V04", name: "Utlopp HLT",   key: 4 },
    { id: "V05", name: "Utlopp MLT",   key: 5 },
    { id: "V06", name: "Utlopp KET",   key: 6 },
    { id: "V07", name: "Till HLT",     key: 7 },
    { id: "V08", name: "P1 till MLT",  key: 8 },
    { id: "V09", name: "P2 till MLT",  key: 9 },
    { id: "V10", name: "Till KET",     key: 10 },
    { id: "V11", name: "Till FV",      key: 11 },
    { id: "P1",  name: "Vatten",       key: 12 },
    { id: "P2",  name: "Vatten, Vört", key: 13 }
  ];
  
  function getIdFromKey(key) {
    for (var n = 0; n < relays.length; n++) {
      if (key === relays[n].key) {
        return relays[n].id;
      }
    }
  };
  
    
  
  this.connect = function(callback) {
    try {
      phidget.create();
      
      phidget.on("attach", function() {
        console.log("Phidget attached!");
      });
      
      phidget.on("detach", function() {
        console.log("Phidget detached!");
      });
      
      phidget.on("error", function(errorCode) {
        console.log("Phidget error!", errorCode);
      });

      phidget.open(-1);

      console.log("Waiting for interface kit to be attached....");
      
      phidget.waitForAttachment(10000);
      
      console.log("Device Type: " + phidget.getDeviceType());
      console.log("Device Serial Number: " + phidget.getSerialNumber());
      console.log("Device Version: " + phidget.getDeviceVersion());
      console.log("Device Input Count: " + phidget.getInputCount());
      console.log("Device Output Count: " + phidget.getOutputCount());
      console.log("Device Sensor Count: " + phidget.getSensorCount());
      console.log("Device Ratiometric: " + phidget.getRatiometric());
      
      callback();
    } catch (e) {
      console.error(e);
      callback(e);
    }
  };
  
  this.setValves = function(valves) {
    for (var n = 0; n < relays.length; n++) {
      var id = getIdFromKey(relays[n].key);
      
      var value = valves.indexOf(id) === -1 ? 0 : 1;
      console.log("key", relays[n].key, "id", id, "value", value, valves);
      
      try {
        phidget.setOutputState(relays[n].key, value);
      } catch (e) {
        console.error(e);
      }
    }
  }
};