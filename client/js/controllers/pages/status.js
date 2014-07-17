define([
  "knockout",
  "observer",
  "server"
], function(ko, observer, server) {
  var loading = ko.observable(false);
  var errorText = ko.observable("");
  var valves = ko.observableArray();
  var programs = ko.observableArray();
  
  function getValveState(id) {
    for (var n = 0; n < valves().length; n++) {
      if (valves()[n].id === id) {
        return valves()[n].state();
      }
    }
    
    return "";
  }
  
  function isProgramActive(program) {
    for (var i = 0; i < program.valves.length; i++) {
      if (program.valves[i].state !== getValveState(program.valves[i].id)) {
        return false;
      }
    }
    
    return true;
  }
  
  var selected = ko.computed(function() {
    return programs().filter(function(element) {
      return isProgramActive(element);
    });
    
    return list;
  });
  
  function setValves(list) {
    loading(true);
    errorText("");
    
    server.send("setValves", list, function(error) {
      loading(false);

      if (error) {
        errorText(error);
        return;
      }
      
      console.log("Set valves", list);
      getValves(); // TODO
    });
  }
  
  function getValves() {
    loading(true);
    errorText("");
    
    server.send("getValves", {}, function(error, valveList) {
      loading(false);
      
      if (error) {
        errorText(error);
        return;
      }
      
      console.log("valveList", valveList);
      
      valves(valveList.map(function(element) {
        return { id: element.id, state: ko.observable(element.state) };
      }));
    });
  }
  
  function getPrograms() {
    loading(true);
    errorText("");

    server.send("loadPrograms", {}, function(error, programList) {
      loading(false);

      if (error) {
        errorText(error);
        return;
      }
      
      console.log("programList", programList);

      programs(programList);
    });
  }
  
  var page = {
    pageTitle: "Status",
    loading: loading,
    error: errorText,
    valves: valves,
    selected: selected,
    programs: programs,
    load: function(id) {
      observer.publish("page", "status");
      
      getPrograms();
      getValves();
    },
    valveHandler: function(valve) {
      var state = "";
      
      if (valve.state() === "") {
        state = "on";
      } else if (valve.state() === "on") {
        state = "off";
      } else if (valve.state() === "off") {
        state = "";
      }
      
      setValves([ { id: valve.id, state: state } ]);
    },
    selectProgram: function(program) {
      var active = isProgramActive(program);
      var list = program.valves.map(function(element) {
        return { id: element.id, state: active ? "off" : element.state };
      });
      
      setValves(list);
    }
  };
  
  return page;
});
