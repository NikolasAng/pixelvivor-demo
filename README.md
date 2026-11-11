# PIXELVIVOR (Demo) — GitHub Game Off 2026

**PIXELVIVOR** is a grimdark open-world **Survivors-like / Bullet Heaven action RPG** running natively in the browser with vanilla HTML5 Canvas, JavaScript ES Modules, and custom pixel-art assets.

This repository hosts the public source code of the playable **Demo build** submitted to **GitHub Game Off 2026** (Theme: **SHIFT**).

## Theme Connection — `SHIFT`
- **World & Realm Shifting:** Shift dynamically between the **Valley Camp** sanctuary hub and infinite procedurally generated frontier expeditions, plus **Underground Caves**, **Mountain Sanctuaries**, the **Abyssal Rift**, and **Dream** encounters.
- **Day, Night & Blood Moon Shifts:** Time continuously shifts across dawn, day, dusk, night, and **Blood Moon** events, altering lighting, visibility fog-of-war, weather, and enemy threats.
- **Tactical Loadout & Combat Shifts:** Customize weapons, armor sets, relics, trinkets, and mounts between expeditions in Camp, shifting builds as bosses and elites escalate.

## Running Locally
Because the game uses native JavaScript ES Modules (`<script type="module">`), serve the directory over a local HTTP server rather than opening `index.html` directly via `file://`:

```bash
# Python 3
python -m http.server 8000

# or Node.js
npx serve .
```

Then open `http://localhost:8000` in a modern Chromium/Firefox/Edge browser.

## Controls
- **Move:** `W A S D` or Arrow Keys
- **Interact (NPCs / Shrines / Portals / Camp):** `E`
- **Pause / Menu:** `Esc` or `P`
- **Fullscreen / Audio / Settings:** Available via HUD & Settings

## Repository Structure
- `index.html` — Entry shell, Camp & HUD containers, and the Grimdark Story Prologue controller
- `styles.css` — UI, overlays, and responsive HUD styling
- `src/` — Vanilla ES Module game engine (`game-core.mjs`, `renderer.mjs`, `world-chunks.mjs`, `weapons-combat.mjs`, `camp.mjs`, `quests.mjs`, `save.mjs`, `ui-hud.mjs`, etc.)
- `assets/`, `characters/`, `16xcharacters/`, `music/` — Game sprites, animations, audio tracks, and prologue narration

## Notes & Disclosure
- Narration voice lines for the Story Prologue were generated using ElevenLabs TTS from original script text.
- Please check asset and repository terms before reusing sprites, music, or voice assets outside of playing/reviewing this jam entry.
