# LaserMaze
Logická hra napsaná v JavaScriptu s Java rendering backendem, který využívá libGDX

Tlačte boxy a používejte zrcadla a portály aby jste připojily laser vysílaným laserovým vysílačem k laserovému přijímači

## Buildování

1. Spusťte `./gradlew dist` ve složce projektu
2. JAR soubor by měl být uložen v `core/build/libs/core-1.0.jar`
3. Spusťte soubor s Java 8 až Java 10

## Java backend

Tento backend je hlavně využívaný pro backend, ale má i funkce pro klávesový vstup a pozici myši

* `com.lasermaze.JavaScript` - Wrapper pro Nashorn JavaScript Engine, který je vestavěný do Javy. Byl odebrán v Java 11.
  * `engine` - Instance JavaScriptového enginu
  * `init` - Bool, který určuje, jestli je engine připravený nebo ne
  * `usedLibraries` - Seznam importovaných knihoven, které byly importovány přes funkci `use`. Tento seznam je využívaný pro zabránění rekurzivního nebo duplikovaného importu
  * `run(String script)` - Spustí JavaScriptový kód
    * `script` - Samotný kód pro spuštění
  * `update()` - Zavolá JavaScriptovou funkci `loop`, která slouží jako vstupní bod do kódu pro aktualizování stavu hry
  * `use(String path)` - Importuje knihovny. Je to wrapper pro funkci `run` která používá proměnnou `usedLibraries` aby funkce věděla, jestli má spustit kód nebo ne
    * `path` - Cesta do lokace knihovny relativní ke složce `scripts/jslib`
* `com.lasermaze.RenderAPI` - Obsahuje funkce pro renderování hry, wrapuje třídu `SpriteBatch` v libGDX
  * `vertices` - Seznam bodů pro následující polygon
  * `indices` - NEPOUŽITO! Seznam indexů aby renderer věděl, jak má vertexy připojit pro vykreslení polygonu
  * `textureCache` - Cache, která obsahuje veškeré načtené textury
  * `renderingPolygon` - Bool, který určuje, jesti se polygon staví nebo ne
  * `pixel` - 1x1 textura s barvou `#FFFFFF`
  * `regionPixel` - Proměnná `pixel` ale ve třídě `TextureRegion`
  * `texture` - Aktuální textura, ze kterou renderer vykresluje
  * `translateX` - Posun po ose X pro vertexy
  * `translateY` - Posun po ose Y pro vertexy
  * `polygon()` - Začne stavět nový polygon
  * `vertex(float x, float y, float u, float v, int rgba)` - Přidá vertex do polygonu
    * `x` - Pozice X na obrazovce, relativní k levé straně obrazovky
    * `y` - Pozice Y na obrazovce, relativní k levé straně obrazovky
    * `u` - Horizontální souřadnice textury
    * `v` - Vertikální souřadnice textury
    * `rgba` - Barva vertexu, ve formátu RGBA32
  * `render()` - Zastaví stavění nového polygonu a vykreslí ho na obrazovku
  * `texture(String path)` - Nastaví novou texturu pro renderer
    * `path` - Cesta k textuře, relativní ke složce `scripts/assets`. Jesli je hodnota `null`, použije se textura uložená v proměnné `pixel`
  * `translate(float x, float y)` - Nastaví nové posunutí pro vertexy
    * `x` - Posunutí po ose X
    * `y` - Posunutí po ose Y
  * `resetTranslation()` - Resetuje posunutí na 0
  * `renderLine(float x1, float y1, float x2, float y2, int rgba, float thickness)` - Vykreslí čáru z bodu A do bodu B
    * `x1` - Pozice na ose X pro bod A, relativní na levou stranu obrazovky
    * `y1` - Pozice na ose Y pro bod A, relativní na horní stranu obrazovky
    * `x2` - Pozice na ose X pro bod B, relativní na levou stranu obrazovky
    * `y2` - Pozice na ose Y pro bod B, relativní na horní stranu obrazovky
    * `rgba` - Barva čáry ve formátu RGBA32
    * `thickness` - Tloušťka (v pixelech) čáry
* `com.lasermaze.Main` - Hlavní třída hry
  * `batch` - Proměnná třídy `SpriteBatch` využívána třídou `RenderAPI` pro vykreslování na obrazovku
  * `camera` - Kamera používaná pro zvětšování nebo zmenšování grafiky při měnění velikosti okna
  * `main(String[] args)` - Vstupní bod do programu pro Javu
    * `args` - Argumenty pro program
  * `create()` - Vstupní bod pro libGDX, zavolán z libGDX když se knihovna připraví
  * `render()` - Zavolána z libGDX pro aktualizaci herního stavu
  * `dispose()` - Když se aplikace zavře, uvolní pamět pro operační systém

## Knihovny

Hlavní JavaScript soubor, `scripts/script.js`, importuje několik knihoven ze složky `scripts/jslib`.

* `renderer.js` - Wrapper pro třídu `RenderAPI`
* `console.js` - Přináši zpátky funkci `console.log`. Volá metodu `System.out.println()` v Javě
* `controller.js` - Wrapper pro vstupní API v libGDX pro klávesníci a myš
  * `mouseX` - X pozice myši na obrazovce relatvní k hernímu oknu
  * `mouseY` - Y pozice myši na obrazovce relatvní k hernímu oknu
  * `clicked` - Jestli je levé tlačitko myši právě stisknuto v tomto framu
  * `pressed(key)` - Zkontroluje, jesti je klávesa právě stisknutá v tomto framu
    * `key` - libGDX keycode
  * `down(key)` - Zkontroluje, jesti je klávesa stisknutá
    * `key` - libGDX keycode
  * `query()` - Aktualizuje hodnoty pro myš
* `default.js` - Obsahuje funkci která vrátí druhý parametr pokud je první `undefined`, jinak vrací první parametr
* `queue.js` - Řada plánovaných volaní funkcí
  * `schedule(id, func, time, args)` - Naplánuje nové volání funkce za určitý počet volání funkce `process()`
    * `id` - ID naplánované funkce
    * `func` - Samotná funkce, která se potom zavolá
    * `time` - Počet volání funkce `process()`
    * `args` - Argumenty pro funkci
  * `append(id, func, args)` - Wrapper pro funkci `schedule()`. Nastaví počet volání funkce `process()` na 0
  * `process()` - Zpracuje řadu
* `viewport.js` - Wrapper pro funkce `Gdx.graphics.getWidth()` a `Gdx.graphics.getHeight()` pro získání velikosti okna

## script.js

* `currentLevel` - Proměnná, která určuje, jaký level se potom načte
* `playerPosX` - Pozice na ose X pro hráče na levelu
* `playerPosY` - Pozice na ose Y pro hráče na levelu
* `tilemapWidth` - Délka celého levelu
* `tilemapHeight` - Výška celého levelu
* `currentTilemap` - Data načteného levelu
* `currentObjects` - Všechny načtené herní objekty
* `currdir` - NEPOUŽITO! V procesu debugování, kurzor vysílal laser v levelu. Tato proměnná určuje směr vysílaného laseru
* `uiScreen` - Jaké UI prvky se mají vykreslit
* `laserColor` - Barva ve formátu RGBA32, která určuje barvu laseru
* `textHidden` - Zabrání vykreslení herního objektu `text`
* `buttonID` - Tato proměnná se používa při přípravě UI tlačítka, aby každé tlačítko mělo ojedinělé číslo
* `levelData` - Obsahuje data pro každý level ve hře. Při načítání, hodnoty se kopírují do jejich příslušných proměnných:
  * `tilemap` -> `currentTilemap`
  * `objects` -> `currentObjects`
  * `spawnX` -> `playerPosX`
  * `spawnY` -> `playerPosY`
  * `width` -> `tilemapWidth`
  * `height` -> `tilemapHeight`
* `find_object(id)` - Vrátí první herní objekt z proměnné `currentObjects`, který se shoduje s parametrem `id`
  * `id` - ID herního objektu
* `process_objects()` - U každého herního objektu zavolá funkci `funcUpdate` pokud existuje. Předá instanci aktuálního herního objektu do 1. parametru funkce
* `tileFuncs` - Seznam funkcí které se volají funkcí `obj_player_update`. Funkce se volají když hráč přestoupí na jinou "dlaždici". Jestli funkce vrátí `true`, hráč se vrátí zpátky na jeho předchozí místo. Pokud funkce vrátí `false`, nic se nestane a hráč se objeví na nové pozici.
* `loop()` - Vstupní bod pro aktualizování herního stavu. Tato funkce je volána funkcí `update` ve třídě `com.lasermaze.JavaScript`
* `render_game()` - Vykreslí celou hru po aktualizování herního stavu
* `render_ui()` - Vykreslí UI prvky určené pomocí proměnné `uiScreen`
* `render_level()` - Vykreslí všechny dlaždice v aktuálního levelu
* `render_objects()` - Vykreslí každý herní objekt. Volá funkci `funcRender` v datech objektu, s instanci aktuálního objektu předaná v prvním parametru funkce
* `render_logo()` - Vykreslí logo hry na titulní obrazovce
* `emit_laser(x, y, dir)` - Začne simulovat laser který byl vyzařen z nějaké pozice v nějakém směru
  * `x` - Pozice laseru na ose X
  * `y` - Pozice laseru na ose Y
  * `dir` - Směr laseru, tento argument musí být směrová konstanta
* `render_laser()` - Vykreslí všechny vyzařené lasery
* `apply_alignment(pos, size, container, alignment)` - Zarovná rámeček na základě zarovnání
  * `pos` - Odsazení od výsledné polohy
  * `size` - Velikost rámečku
  * `container` - Velikost rámečku, ve kterém je vnitřní rámeček zarovnán
  * `alignment` - Samotné zarovnání. `float`ová hodnota mezi 0 a 1
  * vrátí výslednou zarovnanou polohu rámečku relativní k vnejšímu rámečku
* `gui_button(text, x, y, w, h, alignment)` - Zpracuje a vykreslí UI tlačítku
  * `text` - Text, který se na tlačítko vykreslí
  * `x` - Pozice tlačítka na ose X na obrazovce
  * `y` - Pozice tlačítka na ose Y na obrazovce
  * `w` - Délka tlačítka
  * `h` - Výška tlačítka
  * `alignment` - Zarovnání tlačítka na obrazove, tento argument musí být zarovnávací konstanta
* `render_rect(x, y, w, h, color)` - Vykreslí jednobarevný obdelník na obrazovku
  * `x` - Pozice obdelníku na ose X na obrazovce
  * `y` - Pozice obdelníku na ose Y na obrazovce
  * `w` - Délka obdelníku
  * `h` - Výška obdelníku
  * `color` - Barva obdelníku ve formátu RGBA32
* `render_gradient_vertical(x, y, w, h, from, to)` - Vykreslí obdelník s vertikálním přechodem
  * `x` - Pozice obdelníku na ose X na obrazovce
  * `y` - Pozice obdelníku na ose Y na obrazovce
  * `w` - Délka obdelníku
  * `h` - Výška obdelníku
  * `from` - Horní barva obdelníku ve formátu RGBA32
  * `to` - Spodní barva obdelníku ve formátu RGBA32
* `render_gradient_horizontal(x, y, w, h, from, to)` - Vykreslí obdelník s horizontálním přechodem
  * `x` - Pozice obdelníku na ose X na obrazovce
  * `y` - Pozice obdelníku na ose Y na obrazovce
  * `w` - Délka obdelníku
  * `h` - Výška obdelníku
  * `from` - Levá barva obdelníku ve formátu RGBA32
  * `to` - Pravá barva obdelníku ve formátu RGBA32
* `render_multigradient(x, y, w, h, tl, tr, bl, br)` - Vykreslí obdelník s libovolným přechodem
  * `x` - Pozice obdelníku na ose X na obrazovce
  * `y` - Pozice obdelníku na ose Y na obrazovce
  * `w` - Délka obdelníku
  * `h` - Výška obdelníku
  * `tl` - Horní levá barva obdelníku ve formátu RGBA32
  * `tr` - Horní pravá barva obdelníku ve formátu RGBA32
  * `bl` - Spodní levá barva obdelníku ve formátu RGBA32
  * `br` - Spodní pravá barva obdelníku ve formátu RGBA32
* `render_logo_line(x1, y1, x2, y2)` - Vykreslí čáru, která je použita při výkresu loga hry. Používá proměnnou `laserColor` jako barvu čáry, vykreslí čáru přes celou obrazovku, kde definovaná úsečka je tlustší než zbytek
  * `x1` - Pozice bodu A na ose X
  * `y1` - Pozice bodu A na ose Y
  * `x2` - Pozice bodu B na ose X
  * `y2` - Pozice bodu B na ose Y
* `render_text(text, x, y, color, scale)` - Vykreslí text na obrazovku
  * `text` - Text na vykreslení
  * `x` - Posice textu na ose X
  * `y` - Pozice textu na ose Y
  * `color` - Barva textu ve formátu RGBA32
  * `scale` - Zvětšení nebo zmenšení písmen textu
* `distance_to_line(px, py, x1, y1, x2, y2)` - Vypočítá vzdálenost od bodu k úsečce
  * `px` - Pozice bodu na ose X
  * `py` - Pozice bodu na ose Y
  * `x1` - Pozice bodu A čáry na ose X
  * `y1` - Pozice bodu A čáry na ose Y
  * `x2` - Pozice bodu B čáry na ose X
  * `y2` - Pozice bodu B čáry na ose Y
  * vrátí vypočítanou vzdálenost mezi bodem a úsečkou
* `line_intersect(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b)` - Vypočítá bod setkání mezi dvěma čárami
  * `x1a` - Pozice bodu A čáry A na ose X
  * `y1a` - Pozice bodu A čáry A na ose Y
  * `x2a` - Pozice bodu B čáry A na ose X
  * `y2a` - Pozice bodu B čáry A na ose Y
  * `x2a` - Pozice bodu A čáry B na ose X
  * `y2a` - Pozice bodu A čáry B na ose Y
  * `x2a` - Pozice bodu B čáry B na ose X
  * `y2a` - Pozice bodu B čáry B na ose Y
  * vrátí vypočítaný bod setkání `{ x, y }` dvou čar, `null` pokud se nesetkají
* `line_rect_intersect(x1, y1, x2, y2, rx, ry, rw, rh)` - Vypočítá vod setkání mezi obdelníkem a čárou
  * `x1` - X position of the line's point A
  * `y1` - Y position of the line's point A
  * `x2` - X position of the line's point B
  * `y2` - Y position of the line's point B
  * `rx` - X position of the rectangle
  * `ry` - Y position of the rectangle
  * `rw` - Width of the rectangle
  * `ry` - Height of the rectangle
  * vrátí vypočítaný bod setkání `{ x, y }` obdelníku který je blíž k bodu A čáry, `null` pokud se nesetkají
* `clone(obj)` - Hluboce kopíruje objekt nebo pole
  * `obj` - Objekt pro kopírování
  * vrací kopírovaný objekt
* `load_level(id)` - Načte level z proměnné `levelData`
  * `id` - Index pro pole `levelData`
* `has_neighbors(x, y)` - Zjistí, jestli má vertex dlaždice pevné dlaždice kolem sebe
  * `x` - Pozice vertexu na ose X
  * `y` - Pozice vertexu na ose Y
  * vrátí `true` pokud jeden z dlaždic je pevný, `false` pokud ne
* `get_tile(x, y)` - Vrátí dlaždici z pole `currentTilemap`, s kontrolou, jestli jsou souřadnice mimo hranice aktuálníko levelu
  * `x` - Pozice dlaždice na ose X
  * `y` - Pozice dlaždice na ose Y
  * vrátí ID dlaždice. Pokud jsou souřadnice mimo hranice aktuálního level, vrátí `1`
* `set_tile(x, y, tile)` - Nastavi dlaždici do pole `currentTilemap`, s kontrolou, jestli jsou souřadnice mimo hranice aktuálníko levelu
  * `x` - Pozice dlaždice na ose X
  * `y` - Pozice dlaždice na ose Y
  * `tile` - Dlaždice, která se na dané souřadnice nastaví
* `table_builder()` - Vrátí funkci pro sestavu tabulky. Pokud nejsou do vrácené funkce předány žádné argumenty, vrátí sestavenou tabulku. Jesli se předají do funkce klíč a hodnota, tak se do tabulky tyto hodnoty vloží a funkce vrátí sama sebe
* `rng(min, max)` - Vygeneruje náhodné číslo v intervalu `<min, max>`
  * `min` - Minimální číslo
  * `max` - Maximální číslo
  * vrátí vygenerované náhodné číslo

## Data herních objektů

Proměnná `currentObjects` obsahuje data herních objektů. Herní objekt je JavaScriptový objekt které má různé hodnoty

### Sdílené hodnoty

* `id` - ID herního objektu
* `x*` - Pozice objektu na ose X
* `y*` - Pozice objektu na ose Y
* `funcUpdate?` - funkce herního objektu pro aktualizování
* `funcRender?` - funkce herního objektu pro vykreslení
* `priority = 0` - vykreslovací priorita pro tento herní objekt. Herní objekty z nižší prioritou se aktualizují a vykreslují první

\* Herní objekt `player` může mýt tyto hodnoty nastavené jako `undefined`

? Tato hodnota může být nastavená jako `undefined` v každém herním objektu

### `laser_emitter`

`dir` - Směr laserového vysílače, **rovná** směrová konstanta
`flipped` - Jesli je laserový vysílač převrácen, vysílá laser na jeho levou stranu. Jestli ne, vysíla laser na jeho pravou stranu.

### `laser_receiver`, `blue_portal`, `orange_portal`

`dir` - Směr herního objektu, **rovná** směrová konstanta

### `mirror`

`vertical` - Jestli je zrcadlo vertikální nebo ne

### `text`

`text` - Text na vykreslení
