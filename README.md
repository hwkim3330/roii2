# ROii2 - Automotive TSN Network Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-r128-black?logo=three.js" alt="Three.js">
  <img src="https://img.shields.io/badge/TSN-802.1Qbv%2FQav-blue" alt="TSN">
  <img src="https://img.shields.io/badge/Versions-25-green" alt="25 Versions">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT">
</p>

Interactive 3D visualization of Time-Sensitive Networking (TSN) for autonomous vehicles. Features 25 unique visualization styles from technical blueprints to arcade games.

## [Launch App](https://hwkim3330.github.io/roii2/home.html)

---

## Live Demo

### Core Views (9)
| Version | Description |
|---------|-------------|
| [**Index**](https://hwkim3330.github.io/roii2/) | Network topology with device properties |
| [**Drive**](https://hwkim3330.github.io/roii2/drive.html) | WASD driving simulator |
| [**Network**](https://hwkim3330.github.io/roii2/mobile.html) | Mobile-friendly touch controls |
| [**Dashboard**](https://hwkim3330.github.io/roii2/dashboard.html) | Real-time monitoring |
| [**Editor**](https://hwkim3330.github.io/roii2/editor.html) | Topology editor |
| [**Demo**](https://hwkim3330.github.io/roii2/demo.html) | Auto-cycling presentation (6 scenes) |
| [**Scenario**](https://hwkim3330.github.io/roii2/scenario.html) | Autonomous driving scenarios |
| [**Traffic**](https://hwkim3330.github.io/roii2/traffic.html) | Network packet flow visualization |
| [**Presentation**](https://hwkim3330.github.io/roii2/presentation.html) | Auto-demo mode |

### Visual Themes (6)
| Version | Description |
|---------|-------------|
| [**Blueprint**](https://hwkim3330.github.io/roii2/blueprint.html) | Technical drawing style |
| [**Wireframe**](https://hwkim3330.github.io/roii2/wireframe.html) | TRON neon style |
| [**Dataflow**](https://hwkim3330.github.io/roii2/dataflow.html) | Animated data packets |
| [**Hologram**](https://hwkim3330.github.io/roii2/hologram.html) | Sci-fi holographic display |
| [**Nightvision**](https://hwkim3330.github.io/roii2/nightvision.html) | Military NV style |
| [**Heatmap**](https://hwkim3330.github.io/roii2/heatmap.html) | Sensor coverage cones |

### Games (6)
| Version | Description |
|---------|-------------|
| [**Runner**](https://hwkim3330.github.io/roii2/runner.html) | Endless runner - collect sensor data |
| [**Defender**](https://hwkim3330.github.io/roii2/defender.html) | Tower defense vs cyber threats |
| [**Snake**](https://hwkim3330.github.io/roii2/snake.html) | Build network topology |
| [**Shooter**](https://hwkim3330.github.io/roii2/shooter.html) | Space invaders with sensor weapons |
| [**Arcade**](https://hwkim3330.github.io/roii2/arcade.html) | Classic arcade racing |
| [**Circuit**](https://hwkim3330.github.io/roii2/circuit.html) | Oval track racing with AI |

### Special (4)
| Version | Description |
|---------|-------------|
| [**Dark**](https://hwkim3330.github.io/roii2/dark.html) | Cyberpunk neon theme |
| [**Simple**](https://hwkim3330.github.io/roii2/simple.html) | Minimal clean view |
| [**Retro**](https://hwkim3330.github.io/roii2/retro.html) | 8-bit pixel arcade |
| [**Minimal**](https://hwkim3330.github.io/roii2/minimal.html) | Clean white theme |

---

## Architecture

### Network Topology

```
                         ┌─────────────┐
                         │   ACU_IT    │
                         │    (HPC)    │
                         └──────┬──────┘
                ┌───────────────┼───────────────┐
                │               │               │
         ┌──────┴──────┐   10G Backbone  ┌──────┴──────┐
         │ Front-L-9692 ├────────────────┤ Front-R-9692 │
         └──────┬──────┘                 └──────┬──────┘
                │                               │
         [5 Sensors]                     [6 Sensors]

                         ┌──────┴──────┐
                         │  Rear-9692  │
                         └──────┬──────┘
                                │
                         [6 Sensors]
```

### Zone Controllers (3x LAN9692)

| Zone | Position | Connected Sensors |
|------|----------|-------------------|
| Front-L | Left front | LiDAR-FL, LiDAR-FC, Cam-FL, Cam-SL1, Radar-FL |
| Front-R | Right front | LiDAR-FR, Cam-FC, Cam-FR, Cam-SR1, Radar-FC, Radar-FR |
| Rear | Center rear | LiDAR-RC, Cam-RC, Cam-SL2, Cam-SR2, Radar-RL, Radar-RR |

### Sensors (17 Total)

| Type | Count | Positions |
|------|-------|-----------|
| LiDAR | 4 | Front-Left, Front-Right, Front-Center, Rear-Center |
| Camera | 8 | Front (3), Side (4), Rear (1) |
| Radar | 5 | Front (3), Rear (2) |

### LAN9692 Specifications

- **7x MateNET T1** - 100/1000BASE-T1 automotive Ethernet
- **4x SFP+** - 1G/10G fiber optic
- **TSN Features:** IEEE 802.1Qbv/Qav/Qbu, PTP (IEEE 1588)

---

## Controls

### Driving (drive.html)
| Key | Action |
|-----|--------|
| W/S | Accelerate/Reverse |
| A/D | Steer left/right |
| Space | Brake |
| V | Change camera |

### Games
| Game | Controls |
|------|----------|
| **Runner** | ← → A D: Lanes, Space: Jump |
| **Defender** | Click: Target, 1/2/3: Weapons |
| **Snake** | Arrows/WASD: Move |
| **Shooter** | ← → A D: Move, Space: Fire |
| **Circuit** | ← → A D: Steer, ↑: Gas, ↓: Brake |

---

## Technology

- **Three.js** r128 - 3D rendering
- **GLTFLoader** - Vehicle model (roii.glb)
- **OrbitControls** - Camera interaction
- **Font Awesome** 6.5 - Icons

---

## Quick Start

```bash
git clone https://github.com/hwkim3330/roii2.git
cd roii2
# Open home.html in browser
```

---

## File Structure

```
roii2/
├── home.html          # Version launcher
├── index.html         # Network topology
├── drive.html         # Driving simulator
├── mobile.html        # Touch controls
├── dashboard.html     # Monitoring
├── editor.html        # Topology editor
├── demo.html          # Auto presentation
├── scenario.html      # Driving scenarios
├── traffic.html       # Packet flow
├── presentation.html  # Demo mode
├── blueprint.html     # Blueprint theme
├── wireframe.html     # TRON theme
├── dataflow.html      # Data packets
├── hologram.html      # Holographic
├── nightvision.html   # Night vision
├── heatmap.html       # Coverage map
├── runner.html        # Runner game
├── defender.html      # Defense game
├── snake.html         # Snake game
├── shooter.html       # Shooter game
├── arcade.html        # Arcade racing
├── circuit.html       # Track racing
├── dark.html          # Cyberpunk
├── simple.html        # Minimal
├── retro.html         # 8-bit pixel
├── minimal.html       # Clean white
├── script.js          # Core logic
├── roii.glb           # 3D model
└── libs/              # Three.js libs
```

---

## KETI

Korea Electronics Technology Institute - TSN Research Project

---

*Built with Three.js*
