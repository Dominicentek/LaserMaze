# LaserMaze
A game written in JavaScript with a Java rendering backend powered by libGDX

I would write this in a normal language but this is a school project and they forced me to use JavaScript.

## Java backend

This backend is mainly used for rendering, however, it also includes functionality for the keyboard input and mouse positions.

* `com.lasermaze.JavaScript` - Wrapper for the Nashorn JavaScript Engine, which is built-in to Java itself. It is removed in Java 11 and further.
  * `engine` - The engine class itself
  * `init` - A bool that holds the information if the engine has been initialized or not
  * `usedLibraries` - Contains a list of files imported through the `use` JavaScript function to avoid recursive/duplicate imports
  * `run()` - Runs a script
  * `update()` - Calls the `loop` JavaScript function, which is the entry point for updating the game
  * `use()` - The `use` function itself. It's a wrapper for the `run` function which uses the `usedLibraries` variable to know if it should run or not
* `com.lasermaze.RenderAPI` - Contains several functions for the rendering process, wrapping the `SpriteBatch` class in libGDX
  * `vertices` - A list of vertices for the next polygon
  * `indices` - UNUSED! A list of indices that tell how to connect the vertices of the polygon
  * `textureCache` - Contains all loaded textures
  * `renderingPolygon` - A bool that holds the information if a polygon is being initialized
  * `pixel` - A 1x1 texture with the `#FFFFFF` color
  * `regionPixel` - The `pixel` variable but wrapped inside a `TextureRegion` class
  * `texture` - The current texture for rendering
  * `translateX` - Translation on the X axis for vertices
  * `translateY` - Translation on the Y axis for vertices
  * `polygon()` - Begins the initialization for the new polygon
  * `vertex()` - Appends a new vertex to the vertex list
  * `render()` - Stops the initialization of a polygon and renders it to the screen
  * `texture()` - Sets the current `texture` variable
  * `translate()` - Sets the translation variables
  * `resetTranslation()` - Sets all translation variables to 0
  * `renderLine()` - Renders a new line
* `com.lasermaze.Main` - The main game class
  * `batch` - The `SpriteBatch` variable used by the `RenderAPI` class for rendering
  * `camera` - A camera used to scale the graphics when resizing the window
  * `main()` - Java's entry point to the program, initializes libGDX
  * `create()` - Entry point for libGDX, gets called by libGDX after it gets initialized
  * `render()` - Gets called by libGDX to update the game's state
  * `dispose()` - Disposes all resources to the operating system when the application gets closed

## Libraries

The main script, `scripts/script.js`, imports several scripts from the `scripts/jslib` directory.

* `renderer.js` - A wrapper for the `RenderAPI` class.
* `console.js` - Brings back the `console.log` function. It calls Java's `System.out.println()` method
* `controller.js` - A wrapper for libGDX's input API for the keyboard and mouse
  * `mouseX` - The X position of the mouse relative to the window
  * `mouseY` - The Y position of the mouse relative to the window
  * `clicked` - If the mouse button has been pressed this frame
  * `pressed()` - Checks if a key is pressed this frame
  * `down()` - Checks if a key is currently being held down
  * `query()` - Updates the mouse properties
* `default.js` - Has a function to return a default value when the input is `undefined`
* `queue.js` - A task queue
  * `schedule()` - Schedules a new function call after a set amount of `process()` calls
  * `append()` - Wrapper for the `schedule()` function. Sets the delay to 0
  * `process()` - Processes the queue
* `viewport.js` - Contains calls for `Gdx.graphics.getWidth()` and `Gdx.graphics.getHeight()` to get the window size

## script.js

wip
