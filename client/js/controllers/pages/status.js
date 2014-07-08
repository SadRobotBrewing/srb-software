define([
  'knockout',
  'observer',
  'server'
], function(ko, observer, server) {
  var page = {
    pageTitle: 'Status',
    loading: ko.observable(false),
    error: ko.observable(""),
    valves: ko.observableArray([
      { id: "V01", name: "HERMS ut",     state: ko.observable(false) },
      { id: "V02", name: "HLT förbi",    state: ko.observable(false) },
      { id: "V03", name: "HERMS in",     state: ko.observable(false) },
      { id: "V04", name: "Utlopp HLT",   state: ko.observable(false) },
      { id: "V05", name: "Utlopp MLT",   state: ko.observable(false) },
      { id: "V06", name: "Utlopp KET",   state: ko.observable(false) },
      { id: "V07", name: "Till HLT",     state: ko.observable(false) },
      { id: "V08", name: "P1 till MLT",  state: ko.observable(false) },
      { id: "V09", name: "P2 till MLT",  state: ko.observable(false) },
      { id: "V10", name: "Till KET",     state: ko.observable(false) },
      { id: "V11", name: "Till FV",      state: ko.observable(false) },
      { id: "P1",  name: "Vatten",       state: ko.observable(false) },
      { id: "P2",  name: "Vatten, Vört", state: ko.observable(false) }
    ]),
    selected: ko.observable(false),
    name: ko.observable(""),
    description: ko.observable(""),
    programs: ko.observableArray(),
    load: function(id) {
      observer.publish('page', 'status');
      this.loading(true);
      this.error("");

      server.send("loadPrograms", {}, function(error, programs) {
        this.loading(false);

        if (error) {
          this.error(error);
          return;
        }

        this.programs(programs);



         /* for (var n = 0; n < this.programs().length; n++) {
            if (this.programs()[n].id === this.selected()) {
              this.loading(true);

              this.name(this.programs()[n].name);
              this.description(this.programs()[n].description);

              for (var i = 0; i < this.valves().length; i++) {
                this.valves()[i].state(this.programs()[n].valves.indexOf(this.valves()[i].id) !== -1);
              }

              this.loading(false);
            }
          }
        }*/
      }.bind(this));
    },
    valveHandler: function(valve) {
      valve.state(!valve.state());
    }
  };
  
  page.selected.subscribe(function(value) {
    var valves = [];
    
    for (var n = 0; n < page.programs().length; n++) {
      if (page.programs()[n].id === page.selected()) {
        

        page.name(page.programs()[n].name);
        page.description(page.programs()[n].description);

        for (var i = 0; i < page.valves().length; i++) {
          page.valves()[i].state(page.programs()[n].valves.indexOf(page.valves()[i].id) !== -1);
          
          if (page.valves()[i].state()) {
            valves.push(page.valves()[i].id);
          }
        }
      } 
    }
    
    page.loading(true);
    
    server.send("setValves", valves, function(error) {
      this.loading(false);

      if (error) {
        this.error(error);
        return;
      }
      
      console.log("Set valves", valves);
    }.bind(this));
  }.bind(page));

  return page;
});
