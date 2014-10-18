define([
    'knockout',
    'socket'
], function(ko, socket) {
    function Me() {
        this.brew = ko.observable(false);
        this.steps = ko.pureComputed(function() {
            return this.brew().steps;
        }.bind(this));

        socket.on("brew", function(brew) {
            console.log("brew", brew);
            this.brew(brew);
        }.bind(this));

        socket.emit("getBrew", {}, function(error, brew) {
            if (error) {
                console.error(error);
                return;
            }

            console.log("brew", brew);
            this.brew(brew);
        }.bind(this));
    }

    return new Me();
});
