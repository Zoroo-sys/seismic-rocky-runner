# Seismic Rocky Runner

A 3D endless runner built with Three.js, structured as native ES6 modules.
No build step, no bundler, no `npm install` - just static files. Deploys
to GitHub Pages (or any static host) as-is.

## Running it

Because the game is loaded as ES modules (`<script type="module">`),
browsers require it to be served over `http(s)`, not opened directly as a
`file://` URL. Locally, that just means running any static file server
from the project root, e.g.:

```
python3 -m http.server 8080
```

then visiting `http://localhost:8080/`. On GitHub Pages this is a
non-issue - it's already served over https.

## Structure

```
index.html          entry point, loads Three.js from a CDN + src/main.js
style.css           all HUD/screen styling
src/
  core/
    Engine.js            renderer/scene/camera bootstrap + the render loop
    InputController.js   keyboard, swipe, and on-screen button handling
    ScreenShake.js        trauma-based camera shake
    MathUtils.js          damp/lerp/easing helpers
    format.js             shared time formatting
  entities/
    Rocky.js              the player character: build + eased movement
    World.js               ground, lane strips, trees, ambient lurkers
    Obstacles.js            factories for every obstacle/collectible/gate
  systems/
    RunState.js            score, shield, vulnerability, win/lose - pure state
    Spawner.js              spawn scheduling, scrolling, despawn
    CollisionResolver.js    lane/z overlap -> reactions (score, shield, damage)
    Particles.js            pooled THREE.Points burst system
    AudioDirector.js        procedural Web Audio synth engine, no audio files
  ui/
    Hud.js                  score/timer/bars/banners
    Screens.js              start/codex/lose/win overlay screens
    ShareCard.js            canvas-drawn shareable result image
  data/
    Copy.js                 every piece of narrative text, in one place
  main.js               wires all of the above together
test/
  three-stub.js         minimal fake THREE for offline testing
  offline-check.html    same game, pointed at the stub instead of the CDN

Note: AI tools were used for only 15% of the development, limited to structural scaffolding, debugging, and code refinement.
