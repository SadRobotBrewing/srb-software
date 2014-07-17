define([
  'knockout',
  'observer',
  'server'
], function(ko, observer, server) {
  var loading = ko.observable(false);
  var errorText = ko.observable("");
  var valves = ko.observableArray();
  var programs = ko.observableArray();
  var selected = ko.observableArray();
  var newProgramName = ko.observable("");
  
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
        return { id: element.id, state: ko.observable("") };
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
  
  function saveProgram() {
    loading(true);
    errorText("");

    var program = selected()[0];
    program.valves = valves().filter(function(element) {
      return element.state() !== "";
    });
    
    program.valves = program.valves.map(function(element) {
      return { id: element.id, state: element.state() };
    });

    server.send("saveProgram", program, function(error, program) {
      loading(false);

      if (error) {
        errorText(error);
        return;
      }
    });
  }

  var page = {
    pageTitle: "Programs",
    loading: loading,
    error: errorText,
    valves: valves,
    selected: selected,
    programs: programs,
    newProgramName: newProgramName,
    load: function() {
      observer.publish("page", "programs");
      
      getPrograms();
      getValves();
    },
    valveHandler: function(valve) {
      var state = "";
      
      if (valve.state() === "") {
        valve.state("on");
      } else if (valve.state() === "on") {
        valve.state("off");
      } else if (valve.state() === "off") {
        valve.state("");
      }
      
      saveProgram();
    },
    selectProgram: function(program) {
      selected([ program ]);
      
      for (var n = 0; n < valves().length; n++) {
        valves()[n].state("");
        
        for (var i = 0; i < program.valves.length; i++) {
          if (valves()[n].id === program.valves[i].id) {
            valves()[n].state(program.valves[i].state);
          }
        }
      }
    },
    addProgram: function() {
      loading(true);
      errorText("");

      server.send("addProgram", newProgramName(), function(error, program) {
        loading(false);

        if (error) {
          errorText(error);
          return;
        }

        newProgramName("");
        programs.push(program);
        selected(program);
      }.bind(this));
    }
  };

  return page;
});
