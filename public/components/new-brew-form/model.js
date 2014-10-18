define([
    'text!./template.html',
    'knockout',
    'run',
    'socket',
    'location'
], function(template, ko, run, socket, location) {
    function Model(params, componentInfo) {
        this.name = ko.observable("");
        this.description = ko.observable("");
        this.programNames = ko.observableArray();
        this.programName = ko.observable("");
        this.parameters = ko.observableArray();

        this.disabled = ko.pureComputed(function() {
            var empty = this.parameters().filter(function(parameter) {
                return parameter.value() === "";
            });

            return empty.length > 0 || this.name() === "" || this.description() === "";
        }.bind(this));

        this.submit = function() {
            if (this.disabled()) {
                return;
            }

            var options = {
                name: this.name(),
                description: this.description(),
                programName: this.programName(),
                parameters: this.parameters().map(function(parameter) {
                    return { name: parameter.name, value: parameter.value() };
                })
            };

            socket.emit("startBrew", options, function(error) {
                if (error) {
                    console.error(error);
                    return;
                }
            });
        };

        socket.emit('getProgramNames', {}, function(error, programNames) {
            if (error) {
                console.error(error);
                return;
            }

            this.programNames(programNames);
        }.bind(this));

        this.programName.subscribe(function(programName) {
            this.parameters.removeAll();

            if (!programName) {
                return;
            }

            socket.emit('getProgramParameters', programName, function(error, parameters) {
                if (error) {
                    console.error(error);
                    return;
                }

                this.parameters(parameters.map(function(parameter) {
                    return { name: parameter, value: ko.observable("") };
                }));
            }.bind(this));
        }.bind(this));
    }

    return { viewModel: Model, template: template };
});
