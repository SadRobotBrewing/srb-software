define([
  "knockout",
  "observer",
  "server"
], function(ko, observer, server) {
  var loading = ko.observable(false);
  var errorText = ko.observable("");
  var valves = ko.observableArray();
  var programs = ko.observableArray();
  var categories = ko.observableArray();
  var selectedCategory = ko.observable();
  var visiblePrograms = ko.computed(function() {
    return programs().filter(function(element) {
      element.categories = element.categories || [];
      return element.categories.indexOf(selectedCategory()) !== -1;
    });
  });
  
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
    categories: categories,
    selectedCategory: selectedCategory,
    visiblePrograms: visiblePrograms,
    load: function(id) {
      observer.publish("page", "status");
      
      getCatagories();
      getPrograms();
      getValves();
    },
    valveHandler: function(valve) {
      var state = "";
      
      if (valve.state() === "on") {
        state = "off";
      } else {
        state = "on";
      }
      
      setValves([ { id: valve.id, state: state } ]);
    },
    selectProgram: function(program) {
      var active = isProgramActive(program);
      var list = program.valves.map(function(element) {
        return { id: element.id, state: active ? "off" : element.state };
      });
      
      setValves(list);
    },
    selectCategory: function(category) {
      if (selectedCategory() === category) {
        selectedCategory("");
      } else {
        selectedCategory(category);
      }
      
      console.log(selectedCategory());
    },
    stop: function() {
      var list = [];
      
      for (var n = 0; n < valves().length; n++) {
       list.push({ id: valves()[n].id === id, state: "off" });
      }
      
      setValves(list);
    }
  };
  
  return page;
});
