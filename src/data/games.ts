/**
 * Game catalogue data layer.
 *
 * Each entry describes a single playable game hosted on the portal.
 * The `sourceUrl` points to a self-contained HTML5 bundle served from
 * the `/public/games/<slug>/` directory. This is the URL that gets
 * loaded inside the sandboxed <iframe> on the player page.
 *
 * To add a new game:
 *   1. Drop a self-contained `index.html` into `public/games/<slug>/`
 *   2. Append a new `Game` object to the `games` array below
 *   3. The portal + player pages pick it up automatically — no other code changes required.
 */

export type GameCategory = "2D" | "3D";

export interface Game {
  /** Stable unique identifier (used as React key + DB-style id). */
  id: string;
  /** Human-readable title shown on cards + player page. */
  title: string;
  /** URL-safe slug used in `/games/[slug]` routes. */
  slug: string;
  /** Short marketing description shown on the card + player page. */
  description: string;
  /** Long-form description shown on the player page beneath the canvas. */
  longDescription: string;
  /** Visual dimension category — drives sidebar filtering + card badge. */
  category: GameCategory;
  /** Inline SVG (data URI) used as the card thumbnail. No external assets. */
  thumbnail: string;
  /** Relative URL to the standalone HTML game bundle loaded by the iframe. */
  sourceUrl: string;
  /** Display tags used by the search filter + trending signal. */
  tags: string[];
  /** Keyboard / mouse controls shown on the player page. */
  controls: { keys: string; action: string }[];
  /** Whether the game is currently featured in the Trending rail. */
  trending: boolean;
  /** Accent color used to theme the card hover state. */
  accent: "cyan" | "magenta" | "yellow" | "purple";
  /**
   * Optional setup requirements shown as a prominent warning banner above
   * the game canvas on the player page. Use this when a game needs special
   * pre-launch steps (e.g. importing a skin, enabling a browser flag,
   * providing an asset URL). Omit for games that "just work".
   */
  requirements?: GameRequirement[];
  /**
   * When true, the game opens in a brand-new browser tab at its sourceUrl
   * instead of being embedded in the portal's iframe. Use this for games
   * whose keyboard handling conflicts with the portal's iframe-sandbox
   * shortcuts (e.g. Eaglercraft uses Esc for its in-game menu, which
   * conflicts with the browser's Esc-to-exit-fullscreen and the portal's
   * own Esc handling). The portal player page still renders the title,
   * description, controls, and a prominent "Play in new tab" button —
   * it just skips the iframe embed.
   */
  openInNewTab?: boolean;
}

export interface GameRequirement {
  /** Short label, e.g. "Skin Import Required". */
  title: string;
  /** What the user needs to do, in plain language. */
  body: string;
  /** Optional download URL — rendered as a download button when present. */
  downloadUrl?: string;
  /** Optional filename for the download button. */
  downloadLabel?: string;
  /** Severity drives the banner's accent color. */
  severity?: "warning" | "info" | "critical";
}

/** Builds a self-contained SVG thumbnail as a data URI — no network request needed. */
function svgThumbnail(opts: {
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  icon: string;
}): string {
  const { gradientFrom, gradientTo, glow, icon } = opts;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradientFrom}"/>
      <stop offset="100%" stop-color="${gradientTo}"/>
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${glow}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="480" height="270" fill="url(#g)"/>
  <rect width="480" height="270" fill="url(#grid)"/>
  <rect width="480" height="270" fill="url(#r)"/>
  <g transform="translate(240 135)" opacity="0.95">${icon}</g>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const neonShooterThumbnail = svgThumbnail({
  gradientFrom: "#0b1026",
  gradientTo: "#1a0b2e",
  glow: "#22d3ee",
  icon: `
    <g fill="none" stroke="#22d3ee" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M0 -34 L24 22 L0 10 L-24 22 Z" fill="rgba(34,211,238,0.18)"/>
      <circle cx="0" cy="-2" r="4" fill="#f472b6" stroke="none"/>
      <path d="M0 -50 L0 -42 M0 38 L0 46" stroke="#facc15"/>
    </g>
    <g fill="#f472b6" stroke="none">
      <circle cx="-70" cy="-40" r="8"/>
      <circle cx="60" cy="-30" r="6"/>
      <circle cx="80" cy="50" r="10"/>
    </g>
  `,
});

const cosmicRunnerThumbnail = svgThumbnail({
  gradientFrom: "#0a0f1f",
  gradientTo: "#1f0a1a",
  glow: "#f472b6",
  icon: `
    <g fill="none" stroke="#f472b6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-30 30 L0 -30 L30 30 Z" fill="rgba(244,114,182,0.18)"/>
      <path d="M-30 30 L0 10 L30 30" stroke="#22d3ee"/>
      <path d="M-60 50 L-90 50 M60 50 L90 50 M0 60 L0 80" stroke="#facc15"/>
    </g>
    <g fill="#facc15" stroke="none">
      <rect x="-2" y="-50" width="4" height="10"/>
      <rect x="-12" y="-58" width="24" height="6" rx="2"/>
    </g>
  `,
});

const gravityBoxThumbnail = svgThumbnail({
  gradientFrom: "#0a1a0f",
  gradientTo: "#1a1f0a",
  glow: "#4ade80",
  icon: `
    <g fill="none" stroke="#4ade80" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-40" y="-40" width="80" height="80" rx="8" fill="rgba(74,222,128,0.18)"/>
      <rect x="-22" y="-22" width="24" height="24" rx="3" fill="#facc15" stroke="#facc15"/>
      <circle cx="28" cy="-26" r="8" fill="#f472b6" stroke="#f472b6"/>
      <path d="M-40 12 L40 12" stroke-dasharray="4 4"/>
    </g>
  `,
});

const asteroidStormThumbnail = svgThumbnail({
  gradientFrom: "#0a0f1f",
  gradientTo: "#1f0a1a",
  glow: "#22d3ee",
  icon: `
    <g fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="0" cy="0" r="14" fill="rgba(34,211,238,0.15)"/>
      <circle cx="-30" cy="-20" r="6" fill="rgba(244,114,182,0.4)" stroke="#f472b6"/>
      <circle cx="35" cy="-15" r="8" fill="rgba(250,204,21,0.4)" stroke="#facc15"/>
      <circle cx="-25" cy="30" r="5" fill="rgba(74,222,128,0.4)" stroke="#4ade80"/>
      <circle cx="30" cy="25" r="7" fill="rgba(244,114,182,0.4)" stroke="#f472b6"/>
      <circle cx="0" cy="-45" r="4" stroke="#22d3ee"/>
      <circle cx="-55" cy="5" r="3" stroke="#22d3ee"/>
      <circle cx="55" cy="10" r="4" stroke="#22d3ee"/>
      <path d="M-60 -50 L60 -50 M-60 50 L60 50" stroke-dasharray="2 4" stroke="rgba(34,211,238,0.3)"/>
    </g>
  `,
});

const neonCityRunThumbnail = svgThumbnail({
  gradientFrom: "#0a0a1f",
  gradientTo: "#1a0a2e",
  glow: "#f472b6",
  icon: `
    <g fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-50 30 L-50 -10 L-30 -10 L-30 30 Z" fill="rgba(34,211,238,0.3)" stroke="#22d3ee"/>
      <path d="M-20 30 L-20 -25 L0 -25 L0 30 Z" fill="rgba(244,114,182,0.3)"/>
      <path d="M10 30 L10 -15 L30 -15 L30 30 Z" fill="rgba(250,204,21,0.3)" stroke="#facc15"/>
      <path d="M-50 -10 L-30 -10 M-20 -25 L0 -25 M10 -15 L30 -15" stroke-width="1"/>
      <path d="M-60 30 L60 30" stroke="#22d3ee" stroke-width="1.5"/>
      <path d="M0 35 L0 45 M-15 35 L-15 42 M15 35 L15 42" stroke="#facc15"/>
    </g>
  `,
});

const eaglercraftThumbnail = svgThumbnail({
  gradientFrom: "#1a2f1a",
  gradientTo: "#0a1a0a",
  glow: "#4ade80",
  icon: `
    <g fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Isometric dirt/stone block stack — Minecraft-inspired -->
      <!-- Top face (grass green) -->
      <path d="M0 -36 L34 -18 L0 0 L-34 -18 Z" fill="rgba(74,222,128,0.4)"/>
      <!-- Right face (dirt brown) -->
      <path d="M0 0 L34 -18 L34 18 L0 36 Z" fill="rgba(139,90,43,0.55)" stroke="#a3692f"/>
      <!-- Left face (dirt dark) -->
      <path d="M0 0 L-34 -18 L-34 18 L0 36 Z" fill="rgba(99,60,28,0.55)" stroke="#7a4a22"/>
      <!-- Grass highlight on top edge -->
      <path d="M0 -36 L34 -18 L0 0 L-34 -18 Z" stroke="#86efac" stroke-width="2.4"/>
      <!-- Pixel detail dots on right face -->
      <circle cx="14" cy="0" r="2.4" fill="#7a4a22" stroke="none"/>
      <circle cx="22" cy="10" r="2.4" fill="#a3692f" stroke="none"/>
      <circle cx="10" cy="-6" r="2.4" fill="#7a4a22" stroke="none"/>
      <!-- Pixel detail dots on left face -->
      <circle cx="-14" cy="0" r="2.4" fill="#5a3a1a" stroke="none"/>
      <circle cx="-22" cy="10" r="2.4" fill="#7a4a22" stroke="none"/>
    </g>
  `,
});

const eaglercraftWasmThumbnail = svgThumbnail({
  gradientFrom: "#1a0a2e",
  gradientTo: "#0a0a1f",
  glow: "#a855f7",
  icon: `
    <g fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Isometric block stack with WASM purple accent -->
      <!-- Top face (purple) -->
      <path d="M0 -36 L34 -18 L0 0 L-34 -18 Z" fill="rgba(168,85,247,0.4)"/>
      <!-- Right face (dark purple) -->
      <path d="M0 0 L34 -18 L34 18 L0 36 Z" fill="rgba(89,40,140,0.55)" stroke="#c084fc"/>
      <!-- Left face (darker purple) -->
      <path d="M0 0 L-34 -18 L-34 18 L0 36 Z" fill="rgba(60,28,95,0.55)" stroke="#9333ea"/>
      <!-- Top edge highlight -->
      <path d="M0 -36 L34 -18 L0 0 L-34 -18 Z" stroke="#d8b4fe" stroke-width="2.4"/>
      <!-- Circuit/pixel detail dots on right face -->
      <circle cx="14" cy="0" r="2.4" fill="#9333ea" stroke="none"/>
      <circle cx="22" cy="10" r="2.4" fill="#c084fc" stroke="none"/>
      <circle cx="10" cy="-6" r="2.4" fill="#9333ea" stroke="none"/>
      <!-- Circuit/pixel detail dots on left face -->
      <circle cx="-14" cy="0" r="2.4" fill="#6b21a8" stroke="none"/>
      <circle cx="-22" cy="10" r="2.4" fill="#9333ea" stroke="none"/>
      <!-- WASM hexagon badge -->
      <g transform="translate(38 -38)">
        <polygon points="0,-10 8.66,-5 8.66,5 0,10 -8.66,5 -8.66,-5" fill="rgba(168,85,247,0.85)" stroke="#d8b4fe" stroke-width="1.4"/>
        <text x="0" y="3" text-anchor="middle" fill="#0a0a1f" font-family="Courier New, monospace" font-size="7" font-weight="bold">W</text>
      </g>
    </g>
  `,
});

export const games: Game[] = [
  {
    id: "game-neon-shooter",
    title: "Neon Shooter",
    slug: "neon-shooter",
    description:
      "A relentless neon space shooter. Pilot a glowing starship, blast falling asteroids, and chase a high score against an infinite wave of cosmic debris.",
    longDescription:
      "Neon Shooter is a fast-paced, single-screen arcade experience that drops you into a synthwave galaxy under siege. You pilot a nimble triangular starship at the bottom of the screen while procedurally generated asteroids tumble toward you from above. Each asteroid you shatter with your plasma bolts awards points, and the speed of incoming debris ramps up the longer you survive. The game ends the instant an asteroid collides with your ship — so positioning, rhythm, and trigger discipline all matter. Designed to feel like a cabinet classic, Neon Shooter uses procedural canvas drawing for every visual element, so there are no asset downloads to wait on. The framerate is locked to the browser's refresh loop via requestAnimationFrame, the canvas auto-resizes to fill any iframe, and the entire game state machine (start → playing → game over → restart) is wired through a single keyboard loop.",
    category: "2D",
    thumbnail: neonShooterThumbnail,
    sourceUrl: "/games/neon-shooter/index.html",
    tags: ["arcade", "shooter", "space", "neon", "retro"],
    controls: [
      { keys: "← →", action: "Move ship horizontally" },
      { keys: "Space", action: "Fire plasma bolt" },
      { keys: "R", action: "Restart after game over" },
    ],
    trending: true,
    accent: "cyan",
  },
  {
    id: "game-cosmic-runner",
    title: "Cosmic Runner",
    slug: "cosmic-runner",
    description:
      "A 3D endless runner that hurtles you through a neon canyon. Dodge obstacles, weave between energy gates, and ride the synthwave horizon for as long as you can.",
    longDescription:
      "Cosmic Runner is a 3D-flavored endless runner built entirely with canvas-rendered perspective projection — no WebGL pipeline, no asset loading, no shader overhead. The track stretches toward a vanishing point at the center of the screen, lanes snap left-center-right, and obstacles spawn in the distance before rushing forward at escalating speed. Survival is measured in meters traveled, with the difficulty curve throttling both spawn density and forward velocity every few seconds. Because the renderer is pure 2D canvas pretending to be 3D, the bundle stays tiny and the framerate stays high even on mid-tier laptops. The game loops on a single requestAnimationFrame tick, listens for arrow-key lane changes, and exposes a clean start → running → crashed → restart state machine that integrates perfectly with the portal's iframe sandbox.",
    category: "3D",
    thumbnail: cosmicRunnerThumbnail,
    sourceUrl: "/games/cosmic-runner/index.html",
    tags: ["runner", "3d", "endless", "neon", "synthwave"],
    controls: [
      { keys: "← →", action: "Switch lane left / right" },
      { keys: "↑", action: "Jump over low obstacle" },
      { keys: "↓", action: "Slide under high obstacle" },
      { keys: "R", action: "Restart after crash" },
    ],
    trending: true,
    accent: "magenta",
  },
  {
    id: "game-gravity-box",
    title: "Gravity Box",
    slug: "gravity-box",
    description:
      "A minimalist physics puzzle. Drop, stack, and balance neon crates onto a tilting platform to reach the target height without toppling the tower.",
    longDescription:
      "Gravity Box is a bite-sized physics puzzle game where every level is a self-contained stacking challenge. A platform sits at the bottom of the screen and a stream of crates slides in from the side; your job is to drop them at the right moment so they stack cleanly. Each crate obeys a lightweight Verlet-style gravity model — boxes accelerate downward, settle on contact, and transfer momentum when nudged. The level clears when your stack crosses the target height line, and fails if any crate falls off the platform's edge. Because the physics step is intentionally simplified, the simulation runs at a stable 60 fps inside the iframe without any external engine. The visuals lean into the portal's neon identity: glowing wireframe crates, a grid-floor that scrolls with the camera, and a target line that pulses when you're close to clearing the level.",
    category: "2D",
    thumbnail: gravityBoxThumbnail,
    sourceUrl: "/games/gravity-box/index.html",
    tags: ["puzzle", "physics", "stacking", "minimal", "logic"],
    controls: [
      { keys: "← →", action: "Move crane horizontally" },
      { keys: "Space", action: "Drop current crate" },
      { keys: "R", action: "Reset current level" },
    ],
    trending: false,
    accent: "yellow",
  },
  {
    id: "game-asteroid-storm-3d",
    title: "Asteroid Storm 3D",
    slug: "asteroid-storm-3d",
    description:
      "A true 3D cockpit shooter powered by Three.js. Fly through a field of 12,000 instanced asteroids, blast the red threats, and survive the storm at 60fps.",
    longDescription:
      "Asteroid Storm 3D is a fully 3D first-person cockpit shooter built on Three.js (r160). The entire asteroid field is rendered as a single THREE.InstancedMesh with 12,000 instances — meaning the GPU draws every asteroid in one draw call instead of 12,000, which is what keeps the framerate pinned at 60fps even on mid-tier hardware. You pilot a neon cockpit at the center of the storm; mouse-look aims your reticle, WASD strafes through space, and clicking fires a plasma bolt that travels as a real 3D projectile with raycast hit detection against the instanced field. Hostile asteroids (red-tinted instances) pulse to telegraph their threat, while neutral debris (cyan instances) drifts harmlessly. The storm intensifies over time — asteroids accelerate, hostile density rises, and your survival score climbs faster. Because the rendering pipeline uses InstancedMesh + a single shared geometry + a single shared material with per-instance color attributes, the scene holds tens of thousands of components without breaking a sweat. This is the same instancing pattern AAA games use for foliage, crowds, and particle fields.",
    category: "3D",
    thumbnail: asteroidStormThumbnail,
    sourceUrl: "/games/asteroid-storm-3d/index.html",
    tags: ["3d", "threejs", "shooter", "instanced", "cockpit", "webgl"],
    controls: [
      { keys: "Mouse", action: "Aim reticle / look around" },
      { keys: "W A S D", action: "Strafe through space" },
      { keys: "Click", action: "Fire plasma bolt" },
      { keys: "R", action: "Restart after destruction" },
    ],
    trending: true,
    accent: "cyan",
  },
  {
    id: "game-neon-city-run",
    title: "Neon City Run",
    slug: "neon-city-run",
    description:
      "A synthwave flight through a procedurally generated megacity. 10,000+ instanced neon buildings rush past at escalating speed — how far can you fly before you crash?",
    longDescription:
      "Neon City Run is a 3D endless flight game built on Three.js (r160). The city is a single THREE.InstancedMesh containing 10,000+ buildings, each with its own per-instance position, scale, rotation, and color — rendered in one draw call so the GPU doesn't break a sweat even at maximum density. The buildings stream toward the camera and recycle to the back of the track when they pass behind you, creating an infinite city that consumes a fixed memory footprint. A neon wireframe grid floor rolls beneath you, a synthwave sun sinks into the horizon, and your ship leaves a magenta particle trail as you weave between skyscrapers. The difficulty curve ramps forward velocity every 8 seconds, so the cityscape eventually becomes a blur of neon streaks. Crash detection uses bounding-sphere intersection against a subset of the instanced matrix — fast enough to run every frame without slowing the render loop. This is the same InstancedMesh + matrix-recycling pattern used by AAA racing games and endless runners to render massive environments at constant framerates.",
    category: "3D",
    thumbnail: neonCityRunThumbnail,
    sourceUrl: "/games/neon-city-run/index.html",
    tags: ["3d", "threejs", "runner", "instanced", "synthwave", "webgl"],
    controls: [
      { keys: "A D", action: "Strafe ship left / right" },
      { keys: "W S", action: "Pitch ship up / down" },
      { keys: "Shift", action: "Boost speed" },
      { keys: "R", action: "Restart after crash" },
    ],
    trending: true,
    accent: "magenta",
  },
  {
    id: "game-eaglercraft",
    title: "Eaglercraft 26.1.2",
    slug: "eaglercraft",
    description:
      "Eaglercraft 26.1.2 — a WebGPU-powered Minecraft sandbox in a single self-contained 62 MB HTML file. Build, mine, and survive in a voxel world rendered via WebGPU for native-feeling framerates.",
    longDescription:
      "Eaglercraft 26.1.2 (novix-u0-v1.1 build) is a fully playable browser port of Minecraft that targets WebGPU instead of the WebGL + TeaVM pipeline used by older Eaglercraft builds. The entire game — code, assets, textures, sounds — is packed into a single self-contained 62 MB HTML file with no external asset bundles to fetch, which means no remote loader, no asset download progress bar, and no Google Drive dependency. The game boots instantly once the HTML loads. WebGPU is the modern successor to WebGL: it offers lower-overhead access to the GPU, native compute shaders, and dramatically better performance on complex scenes — but it requires a recent browser (Chrome 113+, Edge 113+, or any Chromium-based browser with hardware acceleration enabled). Firefox and Safari do not yet have stable WebGPU support as of mid-2026, so users on those browsers should use the Eaglercraft 1.21.11 WASM build instead. Singleplayer worlds persist to IndexedDB between sessions. The full Minecraft 26.1.2 sandbox is playable: survival, creative, mob AI, redstone, crafting, all block types. Loaded inside the portal's sandboxed iframe with pointer-lock enabled for first-person camera control. If the game shows a 'No WebGPU' error, enable hardware acceleration in your browser settings (chrome://settings/system) and check chrome://gpu for blocklisted drivers.",
    category: "3D",
    thumbnail: eaglercraftThumbnail,
    sourceUrl: "/games/eaglercraft/index.html",
    tags: ["3d", "voxel", "sandbox", "minecraft", "webgpu", "survival", "eaglercraft", "26.1.2", "novix"],
    controls: [
      { keys: "Mouse", action: "Look around (click to lock pointer)" },
      { keys: "W A S D", action: "Move player" },
      { keys: "Space", action: "Jump" },
      { keys: "Shift", action: "Sneak / descend" },
      { keys: "E", action: "Open inventory" },
      { keys: "Left Click", action: "Mine block / attack" },
      { keys: "Right Click", action: "Place block / use item" },
      { keys: "Esc", action: "Release pointer / open menu" },
    ],
    requirements: [
      {
        title: "WebGPU browser required",
        body:
          "This build of Eaglercraft 26.1.2 uses WebGPU (the modern successor to WebGL) and will not run on browsers without it. Use Chrome 113+, Edge 113+, or any Chromium-based browser with hardware acceleration enabled. Firefox and Safari are NOT supported — switch to the Eaglercraft 1.21.11 WASM build if you're on one of those. If you see a 'No GPU adapter' error, enable 'Use hardware acceleration' in chrome://settings/system and check chrome://gpu for blocklisted drivers.",
        severity: "warning",
      },
    ],
    trending: true,
    accent: "yellow",
    openInNewTab: true,
  },
  {
    id: "game-eaglercraft-wasm",
    title: "Eaglercraft 1.21.11 WASM",
    slug: "eaglercraft-wasm",
    description:
      "Eaglercraft 1.21.11 compiled to WebAssembly (WASM) — a leaner, faster Minecraft 1.21.11 sandbox build that runs in modern browsers via native WebAssembly. Same voxel world, smaller bundle.",
    longDescription:
      "Eaglercraft 1.21.11 WASM is a newer-generation browser port of Minecraft 1.21.11 that targets WebAssembly instead of compiling to plain JavaScript via TeaVM. WebAssembly produces smaller bundles and faster startup than the older JavaScript transpilation pipeline — that's why this build is roughly 48 MB. The trade-off is browser support: WASM requires a recent browser, so older browsers may fail to launch the game. Singleplayer worlds persist to IndexedDB between sessions, and multiplayer is wired to the same public Eaglercraft relay network as the other builds. The full Minecraft 1.21.11 sandbox is playable: survival, creative, mob AI, redstone, crafting, all block types. Loaded inside the portal's sandboxed iframe with pointer-lock enabled for first-person camera control. IMPORTANT: this build ships without a default player skin. You MUST import your own skin before launching the game — without one, the game will fail to render the player model and may refuse to start. An example 64×64 PNG skin (a gamer-slime character) is provided as a download in the Requirements banner above the canvas; save it locally and import it through the in-game skin picker on the title screen.",
    category: "3D",
    thumbnail: eaglercraftWasmThumbnail,
    sourceUrl: "/games/eaglercraft-1-21-11-wasm/index.html",
    tags: ["3d", "voxel", "sandbox", "minecraft", "wasm", "eaglercraft", "1.21.11", "survival", "skin-required"],
    controls: [
      { keys: "Mouse", action: "Look around (click to lock pointer)" },
      { keys: "W A S D", action: "Move player" },
      { keys: "Space", action: "Jump" },
      { keys: "Shift", action: "Sneak / descend" },
      { keys: "E", action: "Open inventory" },
      { keys: "Left Click", action: "Mine block / attack" },
      { keys: "Right Click", action: "Place block / use item" },
      { keys: "Esc", action: "Release pointer / open menu" },
    ],
    requirements: [
      {
        title: "Custom Player Skin Required",
        body:
          "This Eaglercraft 1.21.11 WASM build ships without a default player skin. Before clicking Launch, you MUST download a 64×64 PNG Minecraft skin and import it through the in-game skin picker on the title screen. Without an imported skin, the player model will fail to render and the game may refuse to start. A free example skin (gamer-slime) is provided below — right-click → Save Link As, then import it in the game.",
        downloadUrl: "/games/eaglercraft-1-21-11-wasm/example-skin.png",
        downloadLabel: "example-skin.png",
        severity: "critical",
      },
    ],
    trending: true,
    accent: "purple",
    openInNewTab: true,
  },
];

/** Convenience lookup used by the dynamic player page. */
export function getGameBySlug(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

/** All categories that appear in the sidebar (computed, so new tags just work). */
export const sidebarCategories = [
  { id: "all", label: "All Games", filter: () => games },
  { id: "2d", label: "2D Games", filter: () => games.filter((g) => g.category === "2D") },
  { id: "3d", label: "3D Games", filter: () => games.filter((g) => g.category === "3D") },
  { id: "trending", label: "Trending", filter: () => games.filter((g) => g.trending) },
] as const;

export type SidebarCategoryId = (typeof sidebarCategories)[number]["id"];
