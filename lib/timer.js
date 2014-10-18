
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var path = require("path");
var fs = require("q-io/fs");

function Timer(name) {
    EventEmitter.call(this);

    this.finishAt = false;
    this.interval = false;

    fs.read(path.join("./state", "timer_" + name))
    .then(function(finishAt) {
        console.log(finishAt);
        this.finishAt = parseInt(finishAt, 10);
        this.start();
    }.bind(this));

    this.setInMinutes = function(timeout) {
        this.setInSeconds(timeout * 60);
    };

    this.setInSeconds = function(timeout) {
        if (!this.hasExpired()) {
            console.log("Timer " + name + " is already set, will ignore new set");
            return;
        }

        this.finishAt = new Date().getTime() + (timeout * 1000);

        fs.write(path.join("./state", "timer_" + name), this.finishAt.toString());

        this.start();
    };

    this.start = function() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        console.log("Timer " + name + " started, will expire at " + this.finishAt);

        this.interval = setInterval(function() {
            var now = new Date().getTime();

            if (now >= this.finishAt) {
                clearInterval(this.interval);
                this.interval = false;
                this.finishAt = false;

                fs.remove(path.join("./state", "timer_" + name));

                this.emit("expired");
            } else {
                this.emit("tick", this.finishAt - now);
            }
        }.bind(this), 1000);
    };

    this.getTimeLeft = function() {
        return this.finishAt ? this.finishAt - new Date().getTime() : 0;
    };

    this.hasExpired = function() {
        return this.finishAt === false;
    };
}

util.inherits(Timer, EventEmitter);

module.exports = Timer;
