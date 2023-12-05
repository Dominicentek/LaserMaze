var controller = {
    mouseX: 0,
    mouseY: 0,
    clicked: false,
    pressed: function(key) {
        return Java.type("com.badlogic.gdx.Gdx").input.isKeyJustPressed(key);
    },
    down: function(key) {
        return Java.type("com.badlogic.gdx.Gdx").input.isKeyPressed(key);
    },
    query: function() {
        this.mouseX = Java.type("com.badlogic.gdx.Gdx").input.getX();
        this.mouseY = Java.type("com.badlogic.gdx.Gdx").input.getY();
        this.clicked = Java.type("com.badlogic.gdx.Gdx").input.isButtonJustPressed(0);
    }
};