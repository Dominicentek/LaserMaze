var viewport = {
    width: function() {
        return Java.type("com.badlogic.gdx.Gdx").graphics.getWidth();
    },
    height: function() {
        return Java.type("com.badlogic.gdx.Gdx").graphics.getHeight();
    }
}