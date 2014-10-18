define([
    'text!./template.html',
    'knockout',
    'socket'
], function(template, ko, socket) {
    function Model(params, componentInfo) {
        this.valves = {
            V01: ko.observable(false),
            V02: ko.observable(false),
            V03: ko.observable(false),
            V04: ko.observable(false),
            V05: ko.observable(false),
            V06: ko.observable(false),
            V07: ko.observable(false),
            V08: ko.observable(false),
            V09: ko.observable(false),
            V10: ko.observable(false),
            V11: ko.observable(false),
            P1: ko.observable(false),
            P2: ko.observable(false)
        };

        this.timers = ko.observableArray();

        this.setStatus = function(status) {
            console.log("status", status);

            for (var name in status.outputs) {
                this.valves[name](status.outputs[name]);
            }

            var timers = [];

            for (var name in status.timers) {
                var totalSec = status.timers[name] / 1000;
                var hours = parseInt(totalSec / 3600, 10) % 24;
                var minutes = parseInt(totalSec / 60, 10) % 60;
                var seconds = Math.floor(totalSec % 60);

                var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);


                timers.push({ name: name, left: result });
            }

            this.timers(timers);
        };

        socket.emit('getStatus', {}, function(error, status) {
            if (error) {
                console.error(error);
                return;
            }

            this.setStatus(status);
        }.bind(this));

        socket.on("status", function(status) {
            this.setStatus(status);
        }.bind(this));
    }

    return { viewModel: Model, template: template };
});
