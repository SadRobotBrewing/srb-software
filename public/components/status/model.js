define([
    'text!./template.html',
    'knockout',
    'socket'
], function(template, ko, socket) {
    function Model(params, componentInfo) {
        this.outputs = {
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
            P2: ko.observable(false),

            HLT3P: ko.observable(false),
            KET3P1: ko.observable(false),
            KET3P2: ko.observable(false),
        };

        this.temperatures = {
            HLTPT1: ko.observable(0),
            MLTPT1: ko.observable(0),
            KETPT1: ko.observable(0)
        };

        this.timers = ko.observableArray();

        this.setStatus = function(status) {
            console.log("status", status);

            for (var name in status.outputs) {
                if (this.outputs[name]) {
                    this.outputs[name](status.outputs[name]);
                }
            }

            for (var name in status.temperatures) {
                this.temperatures[name](status.temperatures[name]);
            }

            var timers = [];

            for (var name in status.timers) {
                timers.push({ name: name, left: status.timers[name] });
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
