# 🕹️ PAC-MAN DELUXE ARCADE 2.0 (Cyber Retro Edition)

[![Vercel Ready](https://img.shields.io/badge/Vercel-Ready%20for%20Deployment-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![60 FPS Canvas](https://img.shields.io/badge/Engine-HTML5%20Canvas%2060FPS-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Procedural Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-FF007B?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

An upgraded, state-of-the-art Pac-Man arcade experience built for modern browsers and optimized for zero-config one-click deployment on **Vercel**.

Upgraded from a basic desktop Java tutorial into an arcade web application with smart ghost AI personalities, procedural 8-bit chip synthesis, CRT scanline shader overlays, multiple selectable mazes, particle systems, floating score popups, touch controls, and high-score leaderboards.

---

## ⚡ Key Upgrades & Features

### 1. 🧠 Authentic Ghost AI Personalities (Scatter & Chase Cycles)
Unlike basic versions where ghosts merely bounce randomly on wall collisions:
- **Blinky (Red / "Shadow")**: Relentless chaser targeting Pac-Man's exact coordinates. Speeds up when remaining pellets run low (*Cruise Elroy*).
- **Pinky (Pink / "Speedy")**: Anticipates Pac-Man's trajectory, targeting 4 tiles ahead to cut off your escape.
- **Inky (Cyan / "Bashful")**: Tactical flanker that calculates a vector between Blinky and Pac-Man to coordinate pincer maneuvers.
- **Clyde (Orange / "Pokey")**: Pursues Pac-Man when far (> 8 tiles away), but panics and retreats to his home corner when within 8 tiles.
- **Scatter vs. Chase Timer Modes**: Alternates between 7-second scatter cycles and 20-second chase cycles like the original 1980 arcade machine!

### 2. ⚡ Power Energizers & Ghost Combos
- 4 pulsating Energizer Pellets turn ghosts into vulnerable blue ghosts with waving skirts.
- Ghosts flash blue/white when the scared duration is expiring.
- **Multiplier combo**: Eating ghosts yields `200 → 400 → 800 → 1600` points!
- Eaten ghosts turn into floating eyes that autonomously pathfind back to the ghost house to respawn.

### 3. 🌀 Seamless Warp Tunnels
- Left and right portal gates let you warp smoothly across opposite edges of the labyrinth.

### 4. 🍒 Dynamic Bonus Fruits
- Spawns Cherries (+100), Strawberries (+300), Oranges (+500), Apples (+700), Melons (+1000), and Keys (+5000) at pellet milestones.

### 5. 🔊 Procedural 8-Bit Web Audio Synthesizer
- **Zero external audio files**: 100% synthesized through native browser `Web Audio API` oscillators and gain envelopes.
- Authentic arcade sounds:
  - Alternating dual-frequency *waka-waka* chomp
  - Background pitch-shifting siren loop
  - Power energizer buzz
  - Ghost crunch & victory chirp
  - Fruit bonus melody
  - Chromatic falling-pitch death sound
  - Level-clear fanfare & arcade intro jingle

### 6. 🎨 Cyberpunk Visuals & Retro CRT FX
- **3 Visual Themes**: Cyber Neon (default), Classic 1980 Arcade, and Sunset Vaporwave.
- **CRT Scanlines**: Toggleable CRT scanline grid and vignette overlay for an authentic retro monitor feel.
- **Particle System**: Pellet eating sparkles, ghost shrapnel bursts, death ring fireworks, and floating point indicators.

### 7. 📱 Mobile & Cross-Platform Controls
- Responsive canvas scaling for phones, tablets, laptops, and ultra-wide displays.
- Virtual arcade D-pad on mobile screens + swipe gesture controls.
- Keyboard support: `▲ ▼ ◀ ▶` or `W A S D`, `Space` / `P` to pause, `M` to mute, `R` to restart.

### 8. 🏆 LocalStorage Hall of Fame
- Persistent top-5 leaderboard with rank medals (🥇 🥈 🥉) and retro 3-letter initial entry (`AAA`).

---

## 🚀 How to Run Locally

Make sure you have [Node.js](https://nodejs.org/) installed:

```bash
# 1. Clone repository & navigate to directory
cd pacman

# 2. Install dependencies (Vite)
npm install

# 3. Start local development server
npm run dev
```

Open **`http://localhost:3000`** in your browser to play!

---

## 🌐 Deploy to Vercel in 2 Minutes

This project is pre-configured with `vercel.json` and a clean `package.json` build pipeline.

### Method 1: Deploy with Vercel CLI (Recommended)
```bash
# Run inside the project directory
npx vercel
```
Follow the prompts (accept default settings: framework is auto-detected, output directory is `dist/`).

For production deployment:
```bash
npx vercel --prod
```

### Method 2: Deploy via GitHub / GitLab
1. Push this project to your GitHub repository:
   ```bash
   git add .
   git commit -m "Pac-Man Deluxe 2.0 Vercel Ready"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Vercel will automatically detect:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**! Your game will be live globally in under 30 seconds.

---

## 📁 Project Architecture

```
pacman/
├── dist/                   # Production-ready build artifacts
├── public/                 # Static assets and original sprites
│   └── assets/             # PNG sprites (ghosts, pacman, fruits, walls)
├── src/
│   ├── audio.js            # Procedural 8-bit Web Audio synthesizer
│   ├── game.js             # Core game engine, state machine, collision loops
│   ├── ghost.js            # Authentic AI personalities (Blinky, Pinky, Inky, Clyde)
│   ├── maps.js             # Labyrinths (Original 21x19, Classic 28x31, Cyber)
│   ├── pacman.js           # Player controller with pre-turn buffering & tunnel wrap
│   ├── particles.js        # Sparkles, explosions, and floating score popups
│   ├── style.css           # Cyberpunk neon design system, CRT overlay, arcade bezel
│   └── main.js             # HUD syncing, leaderboard, audio/theme controls, gestures
├── index.html              # HTML5 semantic structure & Google Fonts
├── package.json            # Vite scripts and configuration
├── vercel.json             # Vercel routing & asset caching headers
├── vite.config.js          # Vite server & build configurations
└── pacman-java/            # Original Java Swing tutorial project (preserved)
```

---

## 🎮 Controls Quick Reference

| Key / Action | Function |
| :--- | :--- |
| **`▲ ▼ ◀ ▶`** or **`W A S D`** | Move Pac-Man (supports corner pre-turns) |
| **`Space`** or **`P`** | Pause / Resume Game |
| **`M`** | Toggle Audio Mute / Unmute |
| **`R`** | Quick Restart |
| **`🎨 Theme` Button** | Cycle themes (Neon, Classic, Sunset) |
| **`📺 CRT` Button** | Toggle CRT Scanline Shader Effect |
| **`🏆 Scores` Button** | View Local High Score Hall of Fame |
| **`❓ Intel` Button** | View Ghost Target AI Intel & Scoring Guide |
| **Mobile / Touch** | Virtual D-Pad buttons or Swipe on Screen |
