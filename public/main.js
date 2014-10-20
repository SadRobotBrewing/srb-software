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
    "run",
    "jquery"
], function(ko, run, $) {
    ko.components.register("new-brew-form", { require: "components/new-brew-form/model" });
    ko.components.register("brew-run", { require: "components/brew-run/model" });
    ko.components.register("status", { require: "components/status/model" });

    ko.bindingHandlers.timer = {
        update: function(element, valueAccessor, allBindings) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value);

            var totalSec = valueUnwrapped / 1000;
            var hours = parseInt(totalSec / 3600, 10) % 24;
            var minutes = parseInt(totalSec / 60, 10) % 60;
            var seconds = Math.floor(totalSec % 60);

            var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);

            $(element).text(result);
        }
    };

    ko.bindingHandlers.outputList = {
        update: function(element, valueAccessor, allBindings) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value).map(function(element) {
                return "<strong>" + element + "</strong>";
            });

            var list = "";

            if (valueUnwrapped.length > 0) {
                var last = valueUnwrapped[valueUnwrapped.length - 1];
                valueUnwrapped.length = valueUnwrapped.length - 1;

                list = valueUnwrapped.join(", ") + " and " + last;
            }

            $(element).html(list);
        }
    };

    function Model() {
        this.run = run;
    }

    ko.applyBindings(new Model(), document.getElementsByTagName("body")[0]);
});
