# 🕹️ PAC-MAN DELUXE ARCADE (Java Edition)

<div align="center">

![Java](https://img.shields.io/badge/Java-21%20%7C%2026-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-0078D6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Complete-00C853?style=for-the-badge)
![Graphics](https://img.shields.io/badge/Graphics-Java%202D%20Swing%20%2860%20FPS%29-FF3D00?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Procedural%20Java%20Sound-7C4DFF?style=for-the-badge)

</div>

---

## 📸 In-Game Screenshots

### System Ready Screen
<div align="center">
  <img src="../docs/screenshots/java_edition_ready.png" alt="Java Edition System Ready" width="600" />
</div>

<br/>

### Active Mission Gameplay
<div align="center">
  <img src="../docs/screenshots/java_edition_gameplay.png" alt="Java Edition Active Gameplay" width="600" />
</div>

---

## ⚡ Features & Upgrades

1. **Pre-Turn Corner Buffering**:
   - Zero wall sticking! Pac-Man executes turns smoothly at intersections.
2. **Power Energizers & Scared Ghosts**:
   - 4 pulsating energizers in the corners turn ghosts vulnerable blue.
   - Flashing white/blue warning in the final seconds of frightened mode.
3. **Escalating Ghost Multiplier**:
   - Eat scared ghosts for `200 → 400 → 800 → 1600` points with floating popups.
   - Eaten ghosts return home to the ghost house as eyes to respawn.
4. **Warp Tunnels**:
   - Seamless teleportation across the left and right tunnel gates.
5. **Bonus Fruit (Cherry)**:
   - Spawns at 30 and 80 dots for +100 bonus points.
6. **Procedural Java Audio Engine (`SoundEngine.java`)**:
   - Pure 8-bit sound generated via `javax.sound.sampled` (zero external audio files needed).
7. **Developer Branding**:
   - Window title bar, bottom HUD, and dialogs certified by **Srijan Prasad**.

---

## 🚀 How to Run

### Option 1: Standalone Runnable JAR
```bash
java -jar PacManDeluxe.jar
```

### Option 2: Compile & Run from Source
```bash
# Compile
javac App.java PacMan.java SoundEngine.java

# Run
java App
```

---

## 🎮 Controls

- **`▲` `▼` `◀` `▶`** or **`W` `A` `S` `D`**: Steer Pac-Man
- **`Space`**: Pause / Resume Mission
- **`M`**: Toggle Sound Mute
- **`R`**: Restart Mission

---

## 👨‍💻 Credits

- **Designed & Developed by:** **Srijan Prasad**
- **Repository:** [https://github.com/Srijanprasad/pacman](https://github.com/Srijanprasad/pacman)
- **Copyright:** © 2026 Srijan Prasad. All Rights Reserved.
