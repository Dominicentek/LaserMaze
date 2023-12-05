package com.lasermaze;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.math.EarClippingTriangulator;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.utils.ShortArray;

import java.awt.geom.Rectangle2D;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Stack;

public class RenderAPI {
    private static ArrayList<Float> vertices = new ArrayList<>();
    private static ArrayList<Integer> indices = new ArrayList<>();
    private static HashMap<String, Texture> textureCache = new HashMap<>();
    private static boolean renderingPolygon = false;
    private static final Texture pixel;
    private static final TextureRegion regionPixel;
    private static Texture texture;
    private static float translateX = 0;
    private static float translateY = 0;
    static {
        Pixmap pixmap = new Pixmap(1, 1, Pixmap.Format.RGBA8888);
        pixmap.drawPixel(0, 0, 0xFFFFFFFF);
        pixel = new Texture(pixmap);
        regionPixel = new TextureRegion(pixel);
    }
    public static void polygon() {
        if (renderingPolygon) return;
        vertices.clear();
        renderingPolygon = true;
    }
    public static void vertex(float x, float y, float u, float v, int rgba) {
        y = Gdx.graphics.getHeight() - y;
        vertices.add(x + translateX);
        vertices.add(y - translateY);
        vertices.add(new Color(rgba).toFloatBits());
        vertices.add(u);
        vertices.add(v);
    }
    public static void render() {
        if (!renderingPolygon) return;
        float[] vtxarr = new float[vertices.size()];
        float[] vtx = new float[vertices.size() * 2 / 5];
        for (int i = 0; i < vertices.size() / 5; i++) {
            for (int j = 0; j < 5; j++) {
                vtxarr[i * 5 + j] = vertices.get(i * 5 + j);
                if (j >= 2) continue;
                vtx[i * 2 + j] = vertices.get(i * 5 + j);
            }
        }
        short[] indices = new EarClippingTriangulator().computeTriangles(vtx).toArray();
        for (int i = 0; i < indices.length / 3; i++) {
            float[] quad = new float[20];
            for (int j = 0; j < 4; j++) {
                int idx = Math.min(j, 2);
                System.arraycopy(vtxarr, indices[i * 3 + idx] * 5, quad, j * 5, 5);
            }
            Main.batch.draw(texture, quad, 0, 20);
        }
        renderingPolygon = false;
    }
    public static void texture(String path) {
        if (path == null) texture = pixel;
        else {
            if (textureCache.containsKey(path)) texture = textureCache.get(path);
            else {
                texture = new Texture(Gdx.files.internal("assets/" + path));
                textureCache.put(path, texture);
            }
        }
    }
    public static void translate(float x, float y) {
        translateX += x;
        translateY += y;
    }
    public static void resetTranslation() {
        translateX = 0;
        translateY = 0;
    }
    public static void renderLine(float x1, float y1, float x2, float y2, int rgba, float thickness) {
        float length = (float)Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        float angle = -(float)Math.toDegrees(Math.atan2(y2 - y1, x2 - x1));
        Main.batch.setColor(new Color(rgba));
        float offsetX =  (float)Math.sin(angle) * (thickness / 2);
        float offsetY = -(float)Math.cos(angle) * (thickness / 2);
        y1 = Gdx.graphics.getHeight() - y1;
        Main.batch.draw(regionPixel, x1 + offsetX + translateX, y1 + offsetY - translateY, 0, 0, length, thickness, 1, 1, angle);
    }
}
