
var Q = require("q");
var socketio = require('socket.io');

function WebIO() {
    this.io = null;
    this.funcs = {};

    this.setup = function(server) {
        var deferred = Q.defer();
        this.io = socketio(server);

        this.io.on('connection', function(socket) {
            for (var name in this.funcs) {
                socket.on(name, this.funcs[name]);
            }
        }.bind(this));

        deferred.resolve();
        return deferred.promise;
    };

    this.register = function(name, fn) {
        this.funcs[name] = function(data, ack) {
            console.log("Client called " + name);
            fn(data)
            .then(function(result) {
                ack(null, result);
            })
            .catch(function(error) {
                console.error("WebIO registered function " + name + " failed, error: " + error);
                console.error(error.stack);
                ack(error);
            });
        };
    };

    this.emit = function(event, data) {
        //console.log("Emitting " + event + " to client");
        this.io.emit(event, data);
    };
};

module.exports = new WebIO();
