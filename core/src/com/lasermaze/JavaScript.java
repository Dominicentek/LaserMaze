package com.lasermaze;

import com.badlogic.gdx.Gdx;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.util.ArrayList;

public class JavaScript {
    public static ScriptEngine engine;
    private static boolean init;
    private static final ArrayList<String> usedLibraries = new ArrayList<>();
    public static boolean compiled = false;
    public static void init() {
        try {
            if (init) return;
            init = true;
            ScriptEngineManager manager = new ScriptEngineManager();
            engine = manager.getEngineByName("javascript");
            engine.eval("function use(path) { Java.type(\"com.lasermaze.JavaScript\").use(path); }");
            compiled = true;
        }
        catch (Exception e) {
            e.printStackTrace();
            compiled = false;
        }
    }
    public static void run(String script) {
        try {
            if (!init) return;
            engine.eval(script);
            compiled = true;
        }
        catch (Exception e) {
            e.printStackTrace();
            compiled = false;
        }
    }
    public static void update() {
        try {
            if (!compiled) return;
            ((Invocable) engine).invokeFunction("loop");
        }
        catch (Exception e) {
            e.printStackTrace();
            compiled = false;
        }
    }
    public static void use(String path) {
        if (usedLibraries.contains(path)) return;
        usedLibraries.add(path);
        run(Gdx.files.internal("jslib/" + path).readString());
    }
}