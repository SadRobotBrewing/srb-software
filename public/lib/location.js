define([
    'knockout',
], function(ko, socket) {
    function Me() {
        this.query = ko.observable({});

        var parse = function(hash) {
            var parts = hash.split("&");
            var query = {};

            for (var n = 0; n < parts.length; n++) {
                var nv = parts[n].split("=");
                query[nv[0]] = nv[1];
            }

            this.query(query);
        }.bind(this);

        window.onhashchange = function() {
            parse(document.location.hash.substr(1));
        };

        this.goto = function(query) {
            var parts = [];

            for (var name in query) {
                parts.push(name + "=" + query[name]);
            }

            document.location.hash = "#" + parts.join("&");
        };

        parse(document.location.hash.substr(1));
    }

    return new Me();
});
