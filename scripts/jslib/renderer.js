use("default.js");

var renderer = {
    polygon: function() {
        Java.type("com.lasermaze.RenderAPI").polygon();
    },
    vertex: function(x, y, color, u, v) {
        Java.type("com.lasermaze.RenderAPI").vertex(x, y, default_value(u, 0), default_value(v, 0), color);
    },
    render: function() {
        Java.type("com.lasermaze.RenderAPI").render();
    },
    texture: function(path) {
        Java.type("com.lasermaze.RenderAPI").texture(path);
    },
    reset_translation: function() {
        Java.type("com.lasermaze.RenderAPI").resetTranslation();
    },
    translate: function(x, y) {
        Java.type("com.lasermaze.RenderAPI").translate(x, y);
    },
    line: function(x1, y1, x2, y2, color, thickness) {
        Java.type("com.lasermaze.RenderAPI").renderLine(x1, y1, x2,  y2, color, default_value(thickness, 1));
    }
};