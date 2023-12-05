use("default.js");

var queue;
(function() {
    var queued = [];
    queue = {
        schedule: function(id, func, time, args) {
            for (var i = 0; i < queued.length; i++) {
                if (queued[i].id == id) return;
            }
            queued.push({ id: id, func: func, time: time, args: args });
        },
        append: function(id, func, args) {
            this.schedule(id, func, 0, args);
        },
        process: function(starting_with) {
            starting_with = default_value(starting_with, "");
            var i = 0;
            while (i < queued.length) {
                if (queued[i].id && !queued[i].id.startsWith(starting_with)) {
                    i++;
                    continue;
                }
                if (queued[i].time-- > 0) {
                    i++;
                    continue;
                }
                queued[i].func.apply(null, queued[i].args);
                queued.splice(i, 1);
            }
        }
    };
})();