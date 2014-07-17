define([
  'knockout',
  'observer',
  'server'
], function(ko, observer, server) {
  var loading = ko.observable(false);
  var errorText = ko.observable("");
  var valves = ko.observableArray();
  var programs = ko.observableArray();
  var categories = ko.observableArray();
  var selected = ko.observableArray();
  var newProgramName = ko.observable("");
  var selectedCategories = ko.computed(function() {
    if (selected().length > 0) {
      console.log("selectedCategories", selected()[0].categories);
      return selected()[0].categories || [];
    }
    
    return [];
  });
  
  
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
  
  function getCatagories() {
    loading(true);
    errorText("");

    server.send("loadCategories", {}, function(error, categoryList) {
      loading(false);

      if (error) {
        errorText(error);
        return;
      }
      
      console.log("loadCategories", categoryList);

      categories(categoryList);
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
      
      selected([ program ]);
    });
  }

  var page = {
    pageTitle: "Programs",
    loading: loading,
    error: errorText,
    valves: valves,
    selected: selected,
    programs: programs,
    categories: categories,
    selectedCategories: selectedCategories,
    newProgramName: newProgramName,
    load: function() {
      observer.publish("page", "programs");
      
      getCatagories();
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
    categoryHandler: function(data) {
      if (selected().length === 0) {
        return false;
      }
      
      selected()[0].categories = selected()[0].categories || [];
      var pos = selected()[0].categories.indexOf(data);
      
      console.log(data, selected()[0].categories, pos);
      
      if (pos === -1) {
        selected()[0].categories.push(data);
      } else {
        selected()[0].categories.splice(pos, 1);
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
