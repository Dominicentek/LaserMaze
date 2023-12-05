package com.lasermaze;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.math.Vector3;

import java.awt.*;

public class Main extends ApplicationAdapter {
	public static SpriteBatch batch;
	public static OrthographicCamera camera;
	public static void main(String[] arg) {
	  Dimension size = Toolkit.getDefaultToolkit().getScreenSize();
		Lwjgl3ApplicationConfiguration config = new Lwjgl3ApplicationConfiguration();
		config.setForegroundFPS(60);
		config.setWindowedMode(size.width * 3 / 4, size.height * 3 / 4);
		config.setTitle("LaserMaze");
		new Lwjgl3Application(new Main(), config);
	}
	public void create() {
		batch = new SpriteBatch();
		JavaScript.init();
		JavaScript.run(Gdx.files.internal("script.js").readString());
		camera = new OrthographicCamera(Gdx.graphics.getWidth(), Gdx.graphics.getHeight());
	}
	public void render() {
		camera.viewportWidth = Gdx.graphics.getWidth();
		camera.viewportHeight = Gdx.graphics.getHeight();
		camera.position.x = Gdx.graphics.getWidth() / 2f;
		camera.position.y = Gdx.graphics.getHeight() / 2f;
		camera.update();
		batch.begin();
		batch.setProjectionMatrix(camera.combined);
		JavaScript.update();
		batch.end();
	}
	public void dispose() {
		batch.dispose();
	}
}
