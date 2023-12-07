// === LIBRARIES ===

use("default.js");
use("controller.js");
use("renderer.js");
use("console.js");
use("viewport.js");
use("queue.js");

// === CONSTANTS ===

// directions
var UP    = 0;
var LEFT  = 1;
var DOWN  = 2;
var RIGHT = 3;
var NW    = 4;
var NE    = 5;
var SW    = 6;
var SE    = 7;

// ui alignments
var TOP_LEFT      = 0;
var TOP_CENTER    = 1;
var TOP_RIGHT     = 2;
var CENTER_LEFT   = 3;
var CENTER_CENTER = 4;
var CENTER_RIGHT  = 5;
var BOTTOM_LEFT   = 6;
var BOTTOM_CENTER = 7;
var BOTTOM_RIGHT  = 8;

// ui screens
var UI_NONE            = 0;
var UI_TITLE_SCREEN    = 1;
var UI_LEVEL_COMPLETED = 2;
var UI_GAME_COMPLETED  = 3;

// tables
var flipTable = table_builder() // flipped = flipTable[vertical][dir];
    (false, table_builder()
        (NW, SW)
        (NE, SE)
        (SW, NW)
        (SE, NE)
    ())
    (true, table_builder()
        (NW, NE)
        (NE, NW)
        (SW, SE)
        (SE, SW)
    ())
();

var angleTable = table_builder() // angle = angleTable[dir]
    (RIGHT, 0  )
    (SE,    45 )
    (DOWN,  90 )
    (SW,    135)
    (LEFT,  180)
    (NW,    225)
    (UP,    270)
    (NE,    315)
();

var reverseAngleTable = table_builder() // dir = reverseAngleTable[angle]
    (0  , RIGHT)
    (45 , SE   )
    (90 , DOWN )
    (135, SW   )
    (180, LEFT )
    (225, NW   )
    (270, UP   )
    (315, NE   )
();

var alignmentTable = table_builder() // alignment = alignmentTable[alignmentConst]
    (TOP_LEFT,      [ 0,   0   ])
    (TOP_CENTER,    [ 0.5, 0   ])
    (TOP_RIGHT,     [ 1,   0   ])
    (CENTER_LEFT,   [ 0,   0.5 ])
    (CENTER_CENTER, [ 0.5, 0.5 ])
    (CENTER_RIGHT,  [ 1,   0.5 ])
    (BOTTOM_LEFT,   [ 0,   1   ])
    (BOTTOM_CENTER, [ 0.5, 1   ])
    (BOTTOM_RIGHT,  [ 1,   1   ])
();

// === VARIABLES ===

var currentLevel = 1;
var playerPosX = 0;
var playerPosY = 0;
var tilemapWidth = 0;
var tilemapHeight = 0;
var currentTilemap = [];
var currentObjects = [];
var laserDrawList = [];
var currdir = NW;
var uiScreen = UI_TITLE_SCREEN;
var laserColor = 0;
var textHidden = true;

// angle conversions
var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;

// === LEVEL DATA ===

var levelData = [
    {
        tilemap: [
            0,0,0,1,0,0,0,0,0,0,0,0,
            0,0,0,1,0,0,0,2,0,0,0,0,
            0,0,0,1,0,0,0,2,0,0,0,0,
            1,2,1,1,1,3,1,1,1,2,1,0,
            0,0,0,0,0,0,0,1,1,0,1,0,
            0,0,0,0,0,0,0,1,1,0,1,0,
            0,0,0,0,0,0,0,1,1,0,1,0,
            1,1,1,1,0,2,2,0,1,0,1,0,
            0,0,0,1,0,0,0,0,0,0,0,0,
            0,0,0,1,0,0,0,0,0,0,0,0,
            0,0,0,1,0,0,0,0,0,0,0,0,
        ],
        objects: [
            { id: "player", funcUpdate: obj_player_update, funcRender: obj_player_render, priority: 1 },
            { id: "button", x: 3, y: 5, funcUpdate: obj_button_update, funcRender: obj_button_render },
            { id: "barrier", x: 9, y: 5, funcRender: obj_barrier_render, priority: -1 },
            { id: "laser_emitter", x: 9.5, y: 4, attached: { x: 9, y: 3 }, dir: DOWN, flipped: false, funcUpdate: obj_laser_emitter_update, funcRender: obj_laser_emitter_render },
            { id: "mirror", x: 6.5, y: 11, vertical: false, funcRender: obj_mirror_render },
            { id: "laser_receiver", x: 5.5, y: 8, attached: { x: 5, y: 7 }, dir: DOWN, funcRender: obj_laser_receiver_render },
            { id: "blue_portal", x: 4, y: 8.5, dir: RIGHT, funcRender: obj_blue_portal_render },
            { id: "orange_portal", x: 1.5, y: 11, dir: UP, funcRender: obj_orange_portal_render },
            { id: "mirror", x: 0, y: 9.5, vertical: true, funcRender: obj_mirror_render },
            { id: "mirror", x: 1.5, y: 8, vertical: false, funcRender: obj_mirror_render },
            { id: "mirror", x: 3, y: 9.5, vertical: true, funcRender: obj_mirror_render },
            { id: "barrier", x: 4, y: 7, funcRender: obj_barrier_render, priority: -1 },
            { id: "text", text: "Use WSAD to move", x: 2.5, y: 1.25, funcRender: obj_text_render },
            { id: "text", text: "You can push tiles", x: -0.5, y: 0.1, funcRender: obj_text_render },
            { id: "text", text: "that are not shaded", x: -0.5, y: 0.6, funcRender: obj_text_render },
            { id: "text", text: "Buttons close and open doors", x: 0.5, y: 6.25, funcRender: obj_text_render },
            { id: "text", text: "This glass doesn't let you move through", x: 10.5, y: 5.1, funcRender: obj_text_render },
            { id: "text", text: "However, it lets pushable tiles and lasers", x: 10.5, y: 5.6, funcRender: obj_text_render },
            { id: "text", text: "Some objects are attached to pushables", x: 10.5, y: 3.25, funcRender: obj_text_render },
            { id: "text", text: "This mirror bounces the laser", x: 6.5, y: 11.25, funcRender: obj_text_render },
            { id: "text", text: "Whenever the laser hits a receiver, the level ends", x: 4.5, y: 8.25, funcRender: obj_text_render },
            { id: "text", text: "Portals teleport lasers", x: 0, y: 11.25, funcRender: obj_text_render }
        ],
        spawnX: 1,
        spawnY: 1,
        width: 12,
        height: 11
    },
    {
        tilemap: [
            0,0,0,1,0,0,0,
            0,0,0,2,0,0,0,
            0,0,0,1,0,0,0,
            1,1,1,1,0,0,0,
            1,1,1,1,0,0,0,
            1,0,2,0,0,0,0,
            1,0,0,0,1,0,0
        ],
        objects: [
            { id: "player", funcUpdate: obj_player_update, funcRender: obj_player_render, priority: 1 },
            { id: "laser_emitter", x: 4, y: 1.5, dir: RIGHT, flipped: false, attached: { x: 3, y: 1 }, funcUpdate: obj_laser_emitter_update, funcRender: obj_laser_emitter_render },
            { id: "mirror", x: 7, y: 1.5, vertical: true, funcRender: obj_mirror_render },
            { id: "mirror", x: 2.5, y: 5, vertical: false, attached: { x: 2, y: 5 }, funcRender: obj_mirror_render },
            { id: "laser_receiver", x: 4, y: 3.5, dir: RIGHT, funcRender: obj_laser_receiver_render }
        ],
        spawnX: 1,
        spawnY: 1,
        width: 7,
        height: 7
    }
];

// === OBJECT FUNCTIONS ===

// finds and returns an object
function find_object(id) {
    for (var i = 0; i < currentObjects.length; i++) {
        if (currentObjects[i].id == id) return currentObjects[i]
    }
    return null;
}

// updates every object
function process_objects() {
    // sort by priority
    for (var i = 0; i < currentObjects.length; i++) {
        for (var j = i + 1; j < currentObjects.length; j++) {
            var a = currentObjects[i].priority || 0;
            var b = currentObjects[j].priority || 0;
            if (a > b) {
                var temp = currentObjects[i];
                currentObjects[i] = currentObjects[j];
                currentObjects[j] = temp;
            }
        }
    }

    // process them
    for (var i = 0; i < currentObjects.length; i++) {
        if (currentObjects[i].hasOwnProperty("funcUpdate")) currentObjects[i].funcUpdate(currentObjects[i]);
    }
}

function obj_player_update(obj) {
    var prevPosX = playerPosX;
    var prevPosY = playerPosY;
    var direction;
         if (controller.pressed(51)) { playerPosY--; direction = UP    } // W
    else if (controller.pressed(47)) { playerPosY++; direction = DOWN  } // S
    else if (controller.pressed(29)) { playerPosX--; direction = LEFT  } // A
    else if (controller.pressed(32)) { playerPosX++; direction = RIGHT } // D

    // execute tile function
    // if it returns true, then cancel the player's movement
    if (tileFuncs[get_tile(playerPosX, playerPosY)](direction)) {
        playerPosX = prevPosX;
        playerPosY = prevPosY;
    }
}

function obj_laser_emitter_update(obj) {
    var dirs = [ NE, NW,
                 NW, SW,
                 SW, SE,
                 SE, NE ];
    var dir = dirs[obj.dir * 2 + obj.flipped];
    emit_laser(obj.x, obj.y, dir);
}

function obj_button_update(obj) {
    var x = Math.floor(obj.x);
    var y = Math.floor(obj.y);

    var prevActive = !!obj.active; // two negations to convert to boolean

    // check if its activated
    obj.active = (x == playerPosX && y == playerPosY) || get_tile(x, y) == 2;

    // activate
    if (obj.active && !prevActive) {
        for (var i = 0; i < currentTilemap.length; i++) {
            if (currentTilemap[i] == 3) currentTilemap[i] = 4;
        }
    }

    // deactivate
    if (!obj.active && prevActive) {
        for (var i = 0; i < currentTilemap.length; i++) {
            if (currentTilemap[i] == 4) currentTilemap[i] = 3;
        }
    }
}

function obj_player_render(obj) {
    renderer.translate(playerPosX * 32, playerPosY * 32);
    renderer.texture("player.png");
    renderer.polygon();
    renderer.vertex(0,  0,  0xFFFFFFFF, 0, 0);
    renderer.vertex(32, 0,  0xFFFFFFFF, 1, 0);
    renderer.vertex(32, 32, 0xFFFFFFFF, 1, 1);
    renderer.vertex(0,  32, 0xFFFFFFFF, 0, 1);
    renderer.render();
    renderer.translate(playerPosX * -32, playerPosY * -32);
    renderer.texture(null);
}

function obj_laser_emitter_render(obj) {
    renderer.translate(obj.x * 32, obj.y * 32);
    renderer.texture(null);
    renderer.polygon();
    switch (obj.dir) {
        case UP:
            renderer.vertex( 0, -8, 0x7F0000FF);
            renderer.vertex(-8,  8, 0x7F0000FF);
            renderer.vertex( 8,  8, 0x7F0000FF);
            break;
        case LEFT:
            renderer.vertex(-8,  0, 0x7F0000FF);
            renderer.vertex( 8, -8, 0x7F0000FF);
            renderer.vertex( 8,  8, 0x7F0000FF);
            break;
        case DOWN:
            renderer.vertex( 0,  8, 0x7F0000FF);
            renderer.vertex(-8, -8, 0x7F0000FF);
            renderer.vertex( 8, -8, 0x7F0000FF);
            break;
        case RIGHT:
            renderer.vertex( 8,  0, 0x7F0000FF);
            renderer.vertex(-8, -8, 0x7F0000FF);
            renderer.vertex(-8,  8, 0x7F0000FF);
            break;
            
    }
    renderer.render();
    renderer.translate(obj.x * -32, obj.y * -32);
}

function obj_mirror_render(obj, color) {
    color = default_value(color, 0xAFAFAFFF);
    var vertical = default_value(obj.vertical, !(obj.dir == UP || obj.dir == DOWN));
    renderer.translate(obj.x * 32, obj.y * 32);
    renderer.texture(null);
    renderer.polygon();
    if (vertical) {
        renderer.vertex(-4, -16, color);
        renderer.vertex(-4,  16, color);
        renderer.vertex( 4,  16, color);
        renderer.vertex( 4, -16, color);
    }
    else {
        renderer.vertex(-16, -4, color);
        renderer.vertex(-16,  4, color);
        renderer.vertex( 16,  4, color);
        renderer.vertex( 16, -4, color);
    }
    renderer.render();
    renderer.translate(obj.x * -32, obj.y * -32);
}

function obj_laser_receiver_render(obj) {
    renderer.translate(obj.x * 32, obj.y * 32);
    renderer.texture(null);
    renderer.polygon();
    switch (obj.dir) {
        case UP:
            renderer.vertex( 0,  12, 0x000000FF);
            renderer.vertex(-8, -4,  0x000000FF);
            renderer.vertex( 8, -4,  0x000000FF);
            break;
        case LEFT:
            renderer.vertex( 12,  0, 0x000000FF);
            renderer.vertex(-4,  -8, 0x000000FF);
            renderer.vertex(-4,   8, 0x000000FF);
            break;
        case DOWN:
            renderer.vertex( 0, -12, 0x000000FF);
            renderer.vertex(-8,  4,  0x000000FF);
            renderer.vertex( 8,  4,  0x000000FF);
            break;
        case RIGHT:
            renderer.vertex(-12,  0, 0x000000FF);
            renderer.vertex( 4,  -8, 0x000000FF);
            renderer.vertex( 4,   8, 0x000000FF);
            break;
    }
    renderer.render();
    renderer.translate(obj.x * -32, obj.y * -32);
}

function obj_blue_portal_render(obj) {
    obj_mirror_render(obj, 0x7F7FFFFF);
}

function obj_orange_portal_render(obj) {
    obj_mirror_render(obj, 0xFF7F00FF);
}

function obj_button_render(obj) {
    if (get_tile(obj.x, obj.y) == 2) return;
    renderer.translate(obj.x * 32, obj.y * 32);
    renderer.texture(obj.active ? "button_pressed.png" : "button.png");
    renderer.polygon();
    renderer.vertex(0,  0,  0xFFFFFFFF, 0, 0);
    renderer.vertex(32, 0,  0xFFFFFFFF, 1, 0);
    renderer.vertex(32, 32, 0xFFFFFFFF, 1, 1);
    renderer.vertex(0,  32, 0xFFFFFFFF, 0, 1);
    renderer.render();
    renderer.translate(obj.x * -32, obj.y * -32);
    renderer.texture(null);
}

function obj_barrier_render(obj) {
    if (get_tile(obj.x, obj.y) == 2) return;
    renderer.texture(null);
    render_rect(obj.x * 32, obj.y * 32, 32, 32, 0x7F0000FF);
}

function obj_text_render(obj) {
    if (textHidden) return;
    var color = default_value(obj.color, 0xFFFFFFFF);
    var scale = default_value(obj.scale, 1);
    render_text(obj.text, obj.x * 32, obj.y * 32, color, scale);
}

// === TILE FUNCTIONS ===

function tile_air(dir) { return false; }
function tile_wall(dir) { return true; }

function tile_pushable(dir, x, y) {
    // get push destination
    x = default_value(x, playerPosX);
    y = default_value(y, playerPosY);
    var origX = x;
    var origY = y;
    if (dir == UP)    y--;
    if (dir == LEFT)  x--;
    if (dir == DOWN)  y++;
    if (dir == RIGHT) x++;

    // check if solid
    if (tileFuncs[get_tile(x, y)](dir, x, y)) return true;

    // push
    set_tile(x, y, 2);
    set_tile(origX, origY, 0);

    // process attached objects
    for (var i = 0; i < currentObjects.length; i++) {
        if (!currentObjects[i].hasOwnProperty("attached")) continue;
        var attached = currentObjects[i].attached;
        if (attached.x != origX || attached.y != origY) continue;

        // push them
        currentObjects[i].attached.x = x;
        currentObjects[i].attached.y = y;
        currentObjects[i].x += x - origX;
        currentObjects[i].y += y - origY;
    }
    
    return false;
}

var tileFuncs = [
    tile_air,
    tile_wall,
    tile_pushable,
    tile_wall,
    tile_air
];

// === MAIN GAME FUNCTIONS ===

// main game update function
function loop() {
    controller.query();

    // get new laser color
    laserColor = (rng(200, 255) << 24) | 0xFF;

    if (uiScreen == UI_NONE) process_objects();
    render_game();
    render_ui();

    queue.process();
}

// renders the whole game
function render_game() {
    // reset values
    renderer.texture(null);
    render_rect(0, 0, viewport.width(), viewport.height(), 0x3F3F3FFF);
    
    // calculate level origin
    var originX = viewport.width()  / 2 - tilemapWidth  * 16;
    var originY = viewport.height() / 2 - tilemapHeight * 16;
    renderer.translate(originX, originY);

    // render everything
    render_level();
    render_laser();
    render_objects();

    renderer.reset_translation();
}

// render ui
function render_ui() {
    if (uiScreen != UI_NONE) render_rect(0, 0, viewport.width(), viewport.height(), 0x0000007F);
    switch (uiScreen) {
        case UI_NONE:
            if (gui_button("Reset", -5, 5, 80, 80, TOP_RIGHT)) {
                load_level(currentLevel);
            }
            if (!textHidden) if (gui_button("Hide Text", -90, 5, 160, 80, TOP_RIGHT)) {
                textHidden = true;
            }
            break;
        case UI_TITLE_SCREEN:
            render_logo();
            if (gui_button("Start", 0, -56, 256, 48, CENTER_CENTER)) {
                uiScreen = UI_NONE;
            }
            if (gui_button("Tutorial", 0, 0, 256, 48, CENTER_CENTER)) {
                uiScreen = UI_NONE;
                textHidden = false;
                load_level(currentLevel = 0);
            }
            if (gui_button("Quit",  0, 56, 256, 48, CENTER_CENTER)) {
                Java.type("java.lang.System").exit(0);
            }
            break;
        case UI_LEVEL_COMPLETED:
            render_text("level completed :)", viewport.width() / 2 - 280, 40, 0xFFFFFFFF, 4);
            if (gui_button("Next", 0,  0, 256, 48, CENTER_CENTER)) {
                uiScreen = UI_NONE;
                load_level(++currentLevel);
            }
            break;
        case UI_GAME_COMPLETED:
            render_text("very epok u win :D", viewport.width() / 2 - 280, 40, 0xFFFFFFFF, 4);
            if (gui_button("Quit", 0,  0, 256, 48, CENTER_CENTER)) {
                Java.type("java.lang.System").exit(0);
            }
            break;
    }
}

function render_level() {
    // render
    for (var x = 0; x < tilemapWidth; x++) {
        for (var y = 0; y < tilemapHeight; y++) {
            var tile = currentTilemap[y * tilemapWidth + x];
            if (tile != 0 && tile != 4) {
                if (tile == 3) render_rect(x * 32, y * 32, 32, 32, 0x1F1F1FFF);
                continue;
            }

            // draw the air tile
            for (var X = 0; X < 3; X++) {
                for (var Y = 0; Y < 3; Y++) {
                    // calculate shadows
                    var lightTL = has_neighbors(x +    X    / 3, y +    Y    / 3);
                    var lightTR = has_neighbors(x + (X + 1) / 3, y +    Y    / 3);
                    var lightBL = has_neighbors(x +    X    / 3, y + (Y + 1) / 3);
                    var lightBR = has_neighbors(x + (X + 1) / 3, y + (Y + 1) / 3);
                
                    // draw the tile
                    render_multigradient((x + X / 3) * 32, (y + Y / 3) * 32 + Y / 3, 32 / 3, 32 / 3,
                        lightTL * 0x10101000 + 0x1F1F1FFF,
                        lightTR * 0x10101000 + 0x1F1F1FFF,
                        lightBL * 0x10101000 + 0x1F1F1FFF,
                        lightBR * 0x10101000 + 0x1F1F1FFF
                    );
                }
            }
        }
    }
}

// renders every object onto the screen
function render_objects() {
    for (var i = 0; i < currentObjects.length; i++) {
        if (currentObjects[i].hasOwnProperty("funcRender")) currentObjects[i].funcRender(currentObjects[i]);
    }
}

// render the game's logo
function render_logo() {
    renderer.translate(0, 60);

    // L
    render_logo_line(0    , 1, 0    , 3);
    render_logo_line(0    , 3, 1    , 3);

    // A
    render_logo_line(2    , 3, 2.5  , 1);
    render_logo_line(2.5  , 1, 3    , 3);
    render_logo_line(2.25 , 2, 2.75 , 2);

    // S
    render_logo_line(4    , 1, 5    , 1);
    render_logo_line(4    , 2, 5    , 2);
    render_logo_line(4    , 3, 5    , 3);
    render_logo_line(4    , 1, 4    , 2);
    render_logo_line(5    , 2, 5    , 3);

    // E
    render_logo_line(6    , 1, 7    , 1);
    render_logo_line(6    , 2, 7    , 2);
    render_logo_line(6    , 3, 7    , 3);
    render_logo_line(6    , 1, 6    , 3);

    // R
    render_logo_line(8    , 1, 8    , 3);
    render_logo_line(8    , 2, 9    , 2);
    render_logo_line(8    , 1, 9    , 1);
    render_logo_line(9    , 1, 9    , 2);
    render_logo_line(9    , 3, 8    , 2);

    // M
    render_logo_line(10   , 1, 10   , 3);
    render_logo_line(11   , 1, 11   , 3);
    render_logo_line(10   , 1, 10.5 , 2);
    render_logo_line(11   , 1, 10.5 , 2);

    // A
    render_logo_line(12   , 3, 12.5 , 1);
    render_logo_line(12.5 , 1, 13   , 3);
    render_logo_line(12.25, 2, 12.75, 2);

    // Z
    render_logo_line(14   , 1, 15   , 1);
    render_logo_line(14   , 3, 15   , 3);
    render_logo_line(14   , 3, 15   , 1);

    // E
    render_logo_line(16   , 1, 17   , 1);
    render_logo_line(16   , 2, 17   , 2);
    render_logo_line(16   , 3, 17   , 3);
    render_logo_line(16   , 1, 16   , 3);

    queue.process("line"); // run all queued renderer.line calls, so that the logo gets drawn in front of everything

    renderer.translate(0, -60);
}

// === LASER FUNCTIONS ===

// emits and simulates a new laser
function emit_laser(x, y, dir) {
    // get the angle
    var angle = angleTable[dir] * DEG2RAD;

    // get the end point
    var endX = x + Math.cos(angle) * 25;
    var endY = y + Math.sin(angle) * 25;
    
    // we didn't hit anything, check for tiles instead
    for (var X = -1; X <= tilemapWidth; X++) {
        for (var Y = -1; Y <= tilemapHeight; Y++) {
            // check intersection
            var tile = get_tile(X, Y);
            if (tile == 0 || tile == 4) continue;
            var intersect = line_rect_intersect(x, y, endX, endY, X, Y, 1, 1);
            if (intersect == null) continue;
            
            // replace the end point if the intersection is closer
            var endDst = (x - endX) * (x - endX) + (y - endY) * (y - endY);
            var dst = (x - intersect.x) * (x - intersect.x) + (y - intersect.y) * (y - intersect.y);
            
            if (dst < 0.01) continue; // intersection is too close
            
            if (dst < endDst) {
                endX = intersect.x;
                endY = intersect.y;
            }
            hit = true;
        }
    }

    // raycast for entities
    for (var i = 0; i < currentObjects.length; i++) {
        var dst = Math.sqrt((currentObjects[i].x - x) * (currentObjects[i].x - x) + (currentObjects[i].y - y) * (currentObjects[i].y - y));
        if (dst < 0.1) continue; // too close, ignore
        
        var distance = distance_to_line(currentObjects[i].x, currentObjects[i].y, x, y, endX, endY);
        if (distance > 0.25) continue;
        hit = true;
        switch (currentObjects[i].id) {
            case "mirror":
                endX = currentObjects[i].x;
                endY = currentObjects[i].y;
                emit_laser(currentObjects[i].x, currentObjects[i].y, flipTable[currentObjects[i].vertical][dir]);
                break;
            case "blue_portal":
            case "orange_portal":
                endX = currentObjects[i].x;
                endY = currentObjects[i].y;
                var out = find_object(currentObjects[i].id == "blue_portal" ? "orange_portal" : "blue_portal");

                // get in and out angles
                var inAngle = angleTable[currentObjects[i].dir];
                var outAngle = angleTable[out.dir];

                // calculate the angle of output laser
                var angle = angleTable[dir];
                angle += outAngle - inAngle + 180;
                while (angle < 0  ) angle += 360;
                while (angle > 360) angle -= 360;

                // emit it
                emit_laser(out.x, out.y, reverseAngleTable[angle]);
                break;
            case "laser_receiver":
                queue.schedule("level_end", function() {
                    uiScreen = levelData.length - 1 == currentLevel ? UI_GAME_COMPLETED : UI_LEVEL_COMPLETED;
                }, 10);
                break;
        }
    }

    // add to draw list
    laserDrawList.push({ x1: x, y1: y, x2: endX, y2: endY });
}

// renders the laser
function render_laser() {
    for (var i = 0; i < laserDrawList.length; i++) {
        renderer.line(laserDrawList[i].x1 * 32, laserDrawList[i].y1 * 32, laserDrawList[i].x2 * 32, laserDrawList[i].y2 * 32, laserColor);
    }
    laserDrawList = [];
}

// === UI ===

// applies an alignment to a position with size
function apply_alignment(pos, size, container, alignment) {
    return (container - size) * alignment + pos;
}

function gui_button(text, x, y, w, h, alignment) {
    // calculate alignment
    alignment = default_value(alignment, TOP_LEFT);
    x = apply_alignment(x, w, viewport.width(),  alignmentTable[alignment][0]);
    y = apply_alignment(y, h, viewport.height(), alignmentTable[alignment][1]);

    var hover = controller.mouseX >= x     && controller.mouseY >= y &&
                controller.mouseX <  x + w && controller.mouseY <  y + h;

    // render the button
    render_rect(x, y, w, h, 0xFFFFFF00 | (hover ? 0x7F : 0x3F));
    var textX = w / 2 - text.length * 7;
    var textY = h / 2 - 14;
    render_text(text, x + textX, y + textY, 0xFFFFFFFF, 2);

    // check if clicked
    return hover && controller.clicked;
}

// === UTILITY ===

// all vertices have a shared color, creating a simple rectangle
function render_rect(x, y, w, h, color) {
    render_multigradient(x, y, w, h, color, color, color, color);
}

// top vertices and bottom vertices have different colors, creating a vertical gradient
function render_gradient_vertical(x, y, w, h, from, to) {
    render_multigradient(x, y, w, h, from, from, to, to);
}

// left vertices and right vertices have different colors, creating a horizontal gradient
function render_gradient_horizontal(x, y, w, h, from, to) {
    render_multigradient(x, y, w, h, from, to, from, to);
}

// each vertex has its own color
function render_multigradient(x, y, w, h, tl, tr, bl, br) {
    renderer.polygon();
    renderer.vertex(  x  ,   y  , tl);
    renderer.vertex(x + w,   y  , tr);
    renderer.vertex(x + w, y + h, br);
    renderer.vertex(  x  , y + h, bl);
    renderer.render();
}

// renders a special line seen in the logo
function render_logo_line(x1, y1, x2, y2) {
    var scale = 30;

    // center
    x1 += viewport.width() / scale / 2 - 17 / 2;
    x2 += viewport.width() / scale / 2 - 17 / 2;

    // scale
    x1 *= scale;
    y1 *= scale;
    x2 *= scale;
    y2 *= scale;

    // calculate angles and stuff
    var angle = Math.atan2(y1 - y2, x1 - x2);
    var X1 = x1 + Math.cos(angle) * 10000;
    var Y1 = y1 + Math.sin(angle) * 10000;
    var X2 = x2 - Math.cos(angle) * 10000;
    var Y2 = y2 - Math.sin(angle) * 10000;

    // render the actual line
    renderer.line(X1, Y1, X2, Y2, laserColor - 64, 1);
    queue.append("line_" + x1 + "," + y1 + "," + x2 + "," + y2, renderer.line, [x1, y1, x2, y2, laserColor, 4]); // we'll call this later
}

// renders text
function render_text(text, x, y, color, scale) {
    color = default_value(color, 0xFFFFFFFF);
    scale = default_value(scale, 1);
    renderer.texture("font.png");
    var w = 7 * scale;
    var h = 14 * scale;
    for (var i = 0; i < text.length; i++) {
        var char = text.charCodeAt(i);
        var tx = char % 16;
        var ty = Math.floor(char / 16) - 2;
        renderer.polygon();
        renderer.vertex(x     + i * w, y,     color,  tx      / 16,  ty      / 6);
        renderer.vertex(x + w + i * w, y,     color, (tx + 1) / 16,  ty      / 6);
        renderer.vertex(x + w + i * w, y + h, color, (tx + 1) / 16, (ty + 1) / 6);
        renderer.vertex(x     + i * w, y + h, color,  tx      / 16, (ty + 1) / 6);
        renderer.render();
    }
    renderer.texture(null);
}

// returns the distance between a line and a point
// chatgpt
function distance_to_line(px, py, x1, y1, x2, y2) {
    var length = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    if (length == 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));

    var t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / length));

    var closestX = x1 + t * (x2 - x1);
    var closestY = y1 + t * (y2 - y1);

    var distance = Math.sqrt((px - closestX) * (px - closestX) + (py - closestY) * (py - closestY));

    return distance;
}

// checks if 2 lines intersect, returns the intersection point
// chatgpt
function line_intersect(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b) {
    // calculate the direction
    var dx1 = x2a - x1a;
    var dy1 = y2a - y1a;
    var dx2 = x2b - x1b;
    var dy2 = y2b - y1b;

    // calculate the determinant
    var determinant = dx1 * dy2 - dx2 * dy1;

    // check if lines are parallel to each other (determinant is close to zero)
    if (Math.abs(determinant) < 1e-6) {
        return null; // lines are parallel
    }

    // calculate the parameters for the parametric equations of the two lines
    var t1 = ((x1b - x1a) * dy2 - (y1b - y1a) * dx2) / determinant;
    var t2 = ((x1b - x1a) * dy1 - (y1b - y1a) * dx1) / determinant;

    // check if the lines intersect each other
    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
        // calculate the intersection
        var xIntersect = x1a + t1 * dx1;
        var yIntersect = y1a + t1 * dy1;
        return { x: xIntersect, y: yIntersect };
    }

    return null; // lines do not intersect
}

function line_rect_intersect(x1, y1, x2, y2, rx, ry, rw, rh) {
    var left   = rx;
    var top    = ry;
    var right  = rx + rw;
    var bottom = ry + rh;

    // get the intersection point
    var intersection_points = [];
    intersection_points.push(line_intersect(x1, y1, x2, y2, left,  top,    right, top   ));
    intersection_points.push(line_intersect(x1, y1, x2, y2, left,  bottom, right, bottom));
    intersection_points.push(line_intersect(x1, y1, x2, y2, left,  top,    left,  bottom));
    intersection_points.push(line_intersect(x1, y1, x2, y2, right, top,    right, bottom));

    // get the nearest
    var nearest = null;
    var nearest_dist = Infinity;
    for (var i = 0; i < intersection_points.length; i++) {
        if (intersection_points[i] == null) continue;
        var point = intersection_points[i];
        var dist = (point.x - x1) * (point.x - x1) + (point.y - y1) * (point.y - y1);
        if (dist < nearest_dist) {
            nearest = point;
            nearest_dist = dist;
        }
    }

    return nearest;
}

// deep copies the object/array
function clone(obj) {
    var newObj = (obj instanceof Array) ? [] : {};
    for (var prop in obj) {
        if (typeof obj[prop] == "object") newObj[prop] = clone(obj[prop]);
        else newObj[prop] = obj[prop];
    }
    return newObj;
};

function load_level(id) {
    currentTilemap = clone(levelData[id].tilemap);
    currentObjects = clone(levelData[id].objects);
    playerPosX = levelData[id].spawnX;
    playerPosY = levelData[id].spawnY;
    tilemapWidth = levelData[id].width;
    tilemapHeight = levelData[id].height;
}

// checks if a vertex has solid neighbors in the tilemap
function has_neighbors(x, y) {
    return get_tile(x - 0.01, y - 0.01) != 1 &&
           get_tile(x + 0.01, y - 0.01) != 1 &&
           get_tile(x - 0.01, y + 0.01) != 1 &&
           get_tile(x + 0.01, y + 0.01) != 1;
}

// gets a tile from the tilemap, with out of bounds checking
function get_tile(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= tilemapWidth || y >= tilemapHeight) return 1;
    return currentTilemap[y * tilemapWidth + x];
}

// sets a tile to the tilemap, with out of bounds checking
function set_tile(x, y, tile) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= tilemapWidth || y >= tilemapHeight) return;
    currentTilemap[y * tilemapWidth + x] = tile;
}

// builds a table
// returns a function where if no parameters are given, returns the built object, otherwise it returns itself
function table_builder() {
    var obj = {};
    var func = function(key, value) {
        if (key == undefined) return obj;
        obj[key] = value;
        return func;
    }
    return func;
}

// returns a random number between min and max inclusive
function rng(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === INIT ===

load_level(currentLevel);