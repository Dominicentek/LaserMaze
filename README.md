# LaserMaze
A game written in JavaScript with a Java rendering backend powered by libGDX

I would write this in a normal language but this is a school project and they forced me to use JavaScript.

## Java backend

This backend is mainly used for rendering, however, it also includes functionality for the keyboard input and mouse positions.

* `com.lasermaze.JavaScript` - Wrapper for the Nashorn JavaScript Engine, which is built-in to Java itself. It is removed in Java 11 and further.
  * `engine` - The engine class itself
  * `init` - A bool that holds the information if the engine has been initialized or not
  * `usedLibraries` - Contains a list of files imported through the `use` JavaScript function to avoid recursive/duplicate imports
  * `run(String script)` - Runs a script
    * `script` - The script itself
  * `update()` - Calls the `loop` JavaScript function, which is the entry point for updating the game
  * `use(String path)` - The `use` function itself. It's a wrapper for the `run` function which uses the `usedLibraries` variable to know if it should run or not
    * `path` - Path to the script relative to `scripts/jslib`
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
  * `vertex(float x, float y, float u, float v, int rgba)` - Appends a new vertex to the vertex list
    * `x` - X pixel position of the vertex, relative to the left of the screen
    * `y` - Y pixel position of the vertex, relative to the top of the screen
    * `u` - Horizontal coordinate of the texture
    * `v` - Vertical coordinate of the texture
    * `rgba` - Color of the vertex, in the RGBA32 format
  * `render()` - Stops the initialization of a polygon and renders it to the screen
  * `texture(String path)` - Sets the current `texture` variable
    * `path` - Path to the texture, relative to `scripts/assets`. If `null`, the 1x1 white pixel texture is used
  * `translate(float x, float y)` - Sets the translation variables
    * `x` - X pixel position
    * `y` - Y pixel position
  * `resetTranslation()` - Sets all translation variables to 0
  * `renderLine(float x1, float y1, float x2, float y2, int rgba, float thickness)` - Renders a new line from point A to point B
    * `x1` - X pixel position of point A, relative to the left of the screen
    * `y1` - Y pixel position of point A, relative to the top of the screen
    * `x2` - X pixel position of point B, relative to the left of the screen
    * `y2` - Y pixel position of point B, relative to the top of the screen
    * `rgba` - Color of the line, in RGBA32 format
    * `thickness` - Thickness (in pixels) of the line
* `com.lasermaze.Main` - The main game class
  * `batch` - The `SpriteBatch` variable used by the `RenderAPI` class for rendering
  * `camera` - A camera used to scale the graphics when resizing the window
  * `main(String[] args)` - Java's entry point to the program, initializes libGDX
    * `args` - The program arguments
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
  * `pressed(key)` - Checks if a key is pressed this frame
    * `key` - libGDX keycode
  * `down(key)` - Checks if a key is currently being held down
    * `key` - libGDX keycode
  * `query()` - Updates the mouse properties
* `default.js` - Has a function to return a default value when the input is `undefined`
* `queue.js` - A task queue
  * `schedule(id, func, time, args)` - Schedules a new function call after a set amount of `process()` calls
    * `id` - ID of the task, prevents from creating tasks with duplicate IDs
    * `func` - The function to call
    * `time` - The amont of `process()` calls
    * `args` - Arguments for the function
  * `append(id, func, args)` - Wrapper for the `schedule()` function. Sets the delay to 0
  * `process()` - Processes the queue
* `viewport.js` - Contains calls for `Gdx.graphics.getWidth()` and `Gdx.graphics.getHeight()` to get the window size

## script.js

* `currentLevel` - Variable for controlling what level to load next
* `playerPosX` - The player's X position on the map
* `playerPosY` - The player's Y position on the map
* `tilemapWidth` - Width of the level
* `tilemapHeight` - Height of the level
* `currentTilemap` - The loaded level data
* `currentObjects` - All loaded objects
* `currdir` - UNUSED! In the debugging stages, the mouse would emit a laser. This variable controlled in what direction the laser went
* `uiScreen` - Which UI elements to draw
* `laserColor` - RGBA32 color of the laser
* `textHidden` - Hides tutorial text
* `buttonID` - This value is used in button initialization to give each button a unique number
* `levelData` - Holds the data of every level, during loading, its properties are copied to their respective variables:
  * `tilemap` -> `currentTilemap`
  * `objects` -> `currentObjects`
  * `spawnX` -> `playerPosX`
  * `spawnY` -> `playerPosY`
  * `width` -> `tilemapWidth`
  * `height` -> `tilemapHeight`
* `find_object(id)` - Returns the first object in the object list with the input ID
  * `id` - The entity ID
* `process_objects()` - Calls every object's `funcUpdate` function, if it exists. It passes the object into the 1st parameter of the function
* `tileFuncs` - A list of functions called by `obj_player_update` function. Gets called when a player walks on a tile. If it returns true, it prevents the player from going onto the tile. Returns false otherwise.
* `loop()` - Entry point for the game update. Gets called by `com.lasermaze.JavaScript`'s `update` function
* `render_game()` - Renders the whole game after a frame has been finished processing
* `render_ui()` - Draws the UI elements based on the `uiScreen` variable
* `render_level()` - Renders the level's tiles
* `render_objects()` - Renders every object. Calls the `funcRender` function in an object, with the object its updating being passed as the 1st paramter to the function
* `render_logo()` - Renders the game's logo on the title screen
* `emit_laser(x, y, dir)` - Emits and simulates a laser at a position into a direction
  * `x` - X position of the laser
  * `y` - Y position of the laser
  * `dir` - Direction of the laser, pass a directional constant here
* `render_laser()` - Renders the laser
* `apply_alignment(pos, size, container, alignment)` - Aligns a box based on an alignment
  * `pos` - Offset from the resulting alignment
  * `size` - Size of the box
  * `container` - Size of the container the box is being aligned in
  * `alignment` - The alignment. A float in the range from 0 to 1
  * `return`s the aligned position of the box relative to the container's position
* `gui_button(text, x, y, w, h, alignment)` - Draws and processes a button
  * `text` - Text that gets drawn onto the button
  * `x` - X pixel position of the button
  * `y` - Y pixel position of the button
  * `w` - Width of the button
  * `h` - Height of the button
  * `alignment` - Alignment constant for the button
* `render_rect(x, y, w, h, color)` - Draws a rectangle in a flat color
  * `x` - X pixel position of the rectangle
  * `y` - Y pixel position of the rectangle
  * `w` - Width of the rectangle
  * `h` - Heigh of the rectangle
  * `color` - RGBA32 color of the rectangle
* `render_gradient_vertical(x, y, w, h, from, to)` - Draws a rectangle with a vertical gradient
  * `x` - X pixel position of the rectangle
  * `y` - Y pixel position of the rectangle
  * `w` - Width of the rectangle
  * `h` - Heigh of the rectangle
  * `from` - RGBA32 color of the top vertices
  * `to` - RGBA32 color of the bottom vertices
* `render_gradient_horizontal(x, y, w, h, from, to)` - Draws a rectangle with a horizontal gradient
  * `x` - X pixel position of the rectangle
  * `y` - Y pixel position of the rectangle
  * `w` - Width of the rectangle
  * `h` - Heigh of the rectangle
  * `from` - RGBA32 color of the left vertices
  * `to` - RGBA32 color of the right vertices
* `render_multigradient(x, y, w, h, tl, tr, bl, br)` - Renders a rectangle with custom vertex colors
  * `x` - X pixel position of the rectangle
  * `y` - Y pixel position of the rectangle
  * `w` - Width of the rectangle
  * `h` - Heigh of the rectangle
  * `tl` - RGBA32 color of the top left vertex
  * `tr` - RGBA32 color of the top right vertex
  * `bl` - RGBA32 color of the bottom left vertex
  * `br` - RGBA32 color of the bottom right vertex
* `render_logo_line(x1, y1, x2, y2)` - Renders a line used in the logo. It uses the `laserColor` variable as color, draws a line through the whole screen and the specified segment is thicker than the rest
  * `x1` - X pixel position of point A
  * `y1` - Y pixel position of point A
  * `x2` - X pixel position of point B
  * `y2` - Y pixel position of point B
* `render_text(text, x, y, color, scale)` - Renders text onto the screen
  * `text` - The text to render
  * `x` - X pixel position of the text
  * `y` - Y pixel position of the text
  * `color` - RGBA32 color of the text
  * `scale` - Scale of the characters
* `distance_to_line(px, py, x1, y1, x2, y2)` - Calculates a distance from a point to a line
  * `px` - X position of the point
  * `py` - Y position of the point
  * `x1` - X position of line's point A
  * `y1` - Y position of line's point A
  * `x2` - X position of line's point B
  * `y2` - Y position of line's point B
  * `return`s the distance from the point to the line
* `line_intersect(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b)` - Calculates the intersection point of 2 lines
  * `x1a` - X position of line A's point A
  * `y1a` - Y position of line A's point A
  * `x2a` - X position of line A's point B
  * `y2a` - Y position of line A's point B
  * `x1b` - X position of line B's point A
  * `y1b` - Y position of line B's point A
  * `x2b` - X position of line B's point B
  * `y2b` - Y position of line B's point B
  * `return`s the intersection point `{ x, y }` of the 2 lines, `null` if they don't intersect
* `line_rect_intersect(x1, y1, x2, y2, rx, ry, rw, rh)` - Calculates the intersection point of a line and a rectangle
  * `x1` - X position of the line's point A
  * `y1` - Y position of the line's point A
  * `x2` - X position of the line's point B
  * `y2` - Y position of the line's point B
  * `rx` - X position of the rectangle
  * `ry` - Y position of the rectangle
  * `rw` - Width of the rectangle
  * `ry` - Height of the rectangle
  * `return`s the intersection point `{ x, y }` of the rectangle closer to point A, `null` if they don't intersect
* `clone(obj)` - Deep copies an array or an object
  * `obj` - Object to get copied
  * `return`s the copied object
* `load_level(id)` - Loads a level from the `levelData` variable
  * `id` - The index to the `levelData` array
* `has_neighbors(x, y)` - Checks if a tile vertex has solid neighbors in the tilemap
  * `x` - X position of the vertex
  * `y` - Y position of the vertex
  * `return`s `true` if the neighbor is solid, `false` otherwise
* `get_tile(x, y)` - Gets a tile from the `currentTilemap` variable, with out of bounds checking
  * `x` - X position of the tile
  * `y` - Y position of the tile
  * `return`s the tile ID, if out of bounds, returns `1`
* `set_tile(x, y, tile)` - Sets a tile to the `currentTilemap` variable, with out of bounds checking
  * `x` - X position of the tile
  * `y` - Y position of the tile
  * `tile` - Tile to set
* `table_builder()` - Returns a table building function. If no parameters are passed to that function, it returns the built object. Otherwise, if you pass a key and a value, it appends this pair to the object
* `rng(min, max)` - Returns a random number between the range, inclusive
  * `min` - Minimum number
  * `max` - Maximum number
  * `return`s a random number between the range

## Object data

The `currentObjects` array contains object data, which is an object with properies.

### Shared values

* `id` - ID of the object
* `x*` - X position of the object
* `y*` - Y position of the object
* `funcUpdate?` - update function for the object
* `funcRender?` - render function for the object
* `priority = 0` - rendering priority for the object, an object with lower priority gets rendered and updated first

\* The `player` object can have these `undefined`
? Can be `undefined` in any objeect

### `laser_emitter`

`dir` - Direction of the laser emitter, a **straight** directional constant
`flipped` - If the emitted laser is flipped, it emits to the left of the emitter, right otherwise

### `laser_receiver`, `blue_portal`, `orange_portal`

`dir` - Direction of the object, a **straight** directional constant

### `mirror`

`vertical` - If the mirror is vertical or not

### `text`

`text` - Text to render
