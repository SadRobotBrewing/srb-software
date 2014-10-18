requirejs.config({
    baseUrl: './',
    paths: {
        text: 'node_modules/requirejs-text/text',
        knockout: 'node_modules/knockout/build/output/knockout-latest.debug',
        jquery: 'node_modules/jquery/dist/jquery.min',
        bootstrap: 'node_modules/bootstrap/dist/js/bootstrap.min',
        socketio: 'socket.io/socket.io',
        socket: 'lib/socket',
        run: 'lib/run',
        location: 'lib/location'
    }
});

define([
    "knockout",
    "run"
], function(ko, run) {
    ko.components.register("new-brew-form", { require: "components/new-brew-form/model" });
    ko.components.register("brew-run", { require: "components/brew-run/model" });
    ko.components.register("status", { require: "components/status/model" });

    function Model() {
        this.run = run;
    }

    ko.applyBindings(new Model(), document.getElementsByTagName("body")[0]);
});
