# ROii2 - Automotive TSN Network Designer

3D visualization and simulation of Time-Sensitive Networking (TSN) architecture for autonomous vehicles.

## Live Demo

### Core Views
| Version | URL | Description |
|---------|-----|-------------|
| **Network** | [index.html](https://hwkim3330.github.io/roii2/) | Network topology visualization |
| **Drive** | [drive.html](https://hwkim3330.github.io/roii2/drive.html) | Driving simulator (WASD) |
| **Mobile** | [mobile.html](https://hwkim3330.github.io/roii2/mobile.html) | Touch/mouse controls |
| **Dashboard** | [dashboard.html](https://hwkim3330.github.io/roii2/dashboard.html) | Real-time monitoring dashboard |
| **Presentation** | [presentation.html](https://hwkim3330.github.io/roii2/presentation.html) | Auto-demo presentation mode |
| **Editor** | [editor.html](https://hwkim3330.github.io/roii2/editor.html) | Network topology editor |

### Visual Themes
| Version | URL | Description |
|---------|-----|-------------|
| **Blueprint** | [blueprint.html](https://hwkim3330.github.io/roii2/blueprint.html) | Technical drawing style |
| **Heatmap** | [heatmap.html](https://hwkim3330.github.io/roii2/heatmap.html) | Sensor coverage visualization |
| **Wireframe** | [wireframe.html](https://hwkim3330.github.io/roii2/wireframe.html) | TRON/retro neon style |
| **Data Flow** | [dataflow.html](https://hwkim3330.github.io/roii2/dataflow.html) | Animated data packets |
| **Hologram** | [hologram.html](https://hwkim3330.github.io/roii2/hologram.html) | Sci-fi holographic display |
| **Night Vision** | [nightvision.html](https://hwkim3330.github.io/roii2/nightvision.html) | Military green NV style |
| **Dark** | [dark.html](https://hwkim3330.github.io/roii2/dark.html) | Cyberpunk neon theme |
| **Simple** | [simple.html](https://hwkim3330.github.io/roii2/simple.html) | Minimal clean view |
| **Initial D** | [initiald.html](https://hwkim3330.github.io/roii2/initiald.html) | Racing drift mode |

### Games
| Version | URL | Description |
|---------|-----|-------------|
| **Runner** | [runner.html](https://hwkim3330.github.io/roii2/runner.html) | TSN Data Packet Runner - Collect sensor data, avoid faults |
| **Defender** | [defender.html](https://hwkim3330.github.io/roii2/defender.html) | TSN Network Defense - Protect vehicle from cyber threats |
| **Snake** | [snake.html](https://hwkim3330.github.io/roii2/snake.html) | Network Snake - Build your network topology |
| **Shooter** | [shooter.html](https://hwkim3330.github.io/roii2/shooter.html) | TSN Space Defense - Space invaders with sensor weapons |

## Architecture

### Central HPC
- **ACU_IT** - Autonomous Computing Unit (Infotainment)

### Zone Controllers (3x LAN9692)

| Zone | Controller | Position | Connected Sensors |
|------|------------|----------|-------------------|
| Front-L | Front-L-9692 | Left front | LiDAR-FL, LiDAR-Front-Center, Cam-Front-L, Cam-Side-L1, Radar-Front-L |
| Front-R | Front-R-9692 | Right front | LiDAR-FR, Cam-Front-Center, Cam-Front-R, Cam-Side-R1, Radar-Front-Center, Radar-Front-R |
| Rear | Rear-9692 | Center rear | LiDAR-Rear-Center, Cam-Rear-Center, Cam-Side-L2, Cam-Side-R2, Radar-Rear-L, Radar-Rear-R |

### Network Topology

```
                         ┌─────────────┐
                         │   ACU_IT    │
                         │    (HPC)    │
                         └──────┬──────┘
                ┌───────────────┼───────────────┐
                │               │               │
         ┌──────┴──────┐        │        ┌──────┴──────┐
         │ Front-L-9692 ├───────┼────────┤ Front-R-9692 │
         └──────┬──────┘   10G Backbone  └──────┬──────┘
                │                               │
        [5 Sensors]                      [6 Sensors]

                         ┌──────┴──────┐
                         │  Rear-9692  │
                         └──────┬──────┘
                                │
                         [6 Sensors]
```

### LAN9692 Specifications

- **7x MateNET T1** - 100/1000BASE-T1 automotive Ethernet
- **4x SFP+** - 1G/10G fiber optic
- **1x RJ45** - Management port
- **Total: 12 Ports**
- **TSN Features:** IEEE 802.1Qbv/Qav/Qbu, PTP (IEEE 1588)

### Sensors (17 Total)

| Type | Count | Positions |
|------|-------|-----------|
| LiDAR | 4 | Front-Left, Front-Right, Front-Center, Rear-Center |
| Camera | 8 | Front (3), Side (4), Rear (1) |
| Radar | 5 | Front (3), Rear (2) |

## Version Details

### Network View (index.html)
- 3D visualization with Three.js
- Click devices to view properties (port usage, connections, bandwidth)
- Fault injection simulation
- JSON configuration export
- Auto-rotate view
- Bandwidth-based connection styling (10G thick, 1G thin)

### Drive Mode (drive.html)
- WASD keyboard controls
- Multiple camera views (V key)
- Speedometer
- Sky gradient background
- Fault simulation while driving

### Mobile (mobile.html)
- Touch joystick for steering
- Gas/brake pedals
- Mouse support for desktop
- Keyboard (WASD/arrows) support
- Full 17-sensor network with properties panel

### Dashboard (dashboard.html)
- Real-time network monitoring
- Traffic visualization with animated charts
- Device list with status indicators
- Connection bandwidth usage
- Alert system

### Presentation (presentation.html)
- Auto-rotating demo mode
- Fullscreen optimized (F key)
- Animated fault demonstration
- Recovery simulation
- Pause/Resume (Space key)

### Editor (editor.html)
- Add devices by clicking
- Create connections between devices
- Delete devices and connections
- Import/Export JSON topology
- Load vehicle template

### Dark Mode (dark.html)
- Cyberpunk neon aesthetic
- Wireframe vehicle model
- Glowing connections
- Scanline overlay effect

### Simple View (simple.html)
- Minimal clean design
- White background
- Essential controls only
- Auto-rotate by default

### Initial D Mode (initiald.html)
- Night mountain racing aesthetic
- Drift mechanics (Space key)
- Speed lines effect
- Digital speedometer & tachometer
- Eurobeat-style UI
- Orange neon color scheme

### Blueprint View (blueprint.html)
- Technical drawing style with blue lines
- Dashed connection lines
- Title block with drawing info
- Specifications panel
- Auto-rotate with grid

### Heatmap View (heatmap.html)
- Sensor coverage cone visualization
- Toggle layers (LiDAR/Camera/Radar)
- Coverage analysis percentages
- Signal strength legend
- Interactive layer controls

### Wireframe / TRON (wireframe.html)
- Retro TRON movie aesthetic
- Neon cyan wireframe vehicle
- Glowing edges and particles
- Scanline overlay effect
- Pulsing device lights

### Data Flow (dataflow.html)
- Animated data packets flowing through network
- Real-time traffic statistics
- Speed control slider
- Per-sensor bandwidth display
- Packet count visualization

### Hologram (hologram.html)
- Sci-fi holographic display
- Rotating platform rings
- Vertical scan effect
- Hexagonal stat displays
- Translucent wireframe vehicle

### Night Vision (nightvision.html)
- Military night vision green style
- Scanline and noise effects
- Crosshair overlay
- Tactical information display
- Blinking sensor indicators
- Real-time clock

### TSN Data Runner (runner.html)
- Endless runner with ROii2 vehicle model
- Collect LiDAR, Camera, Radar data packets
- Avoid network faults and packet loss events
- Zone bonuses (Front-L, ACU_IT, Front-R)
- Network health meter and real-time graph
- Level progression based on throughput

### TSN Network Defender (defender.html)
- Tower defense style gameplay
- ROii2 vehicle at center with sensor turrets
- LiDAR (AOE), Camera (multi-target), Radar (homing)
- Wave-based cyber threat attacks
- Zone controller status indicators
- Power-up system

### Network Snake (snake.html)
- Classic snake with network topology theme
- ACU_IT head collects sensor nodes
- Grow your TSN network connections
- Mini-map showing topology
- Bandwidth meter tracking
- Various sensor types with different values

### TSN Space Defense (shooter.html)
- Space invaders with ROii2 vehicle
- Three weapon types: LiDAR, Camera, Radar
- Enemy types: Malware, DDoS, Ransomware, APT
- Combo system for score multipliers
- Power-ups: Rapid Fire, Triple Shot, Shield Boost
- Wave-based progression

## Fault Simulation

Simulate network failures to test redundancy:

| Fault | Description | Recovery |
|-------|-------------|----------|
| Front 10G Backbone | Front-L ↔ Front-R link failure | Reroute via HPC |
| Front-L → HPC | Front-L zone controller link down | Reroute via Front-R backbone |
| Rear → HPC | Rear zone controller link down | - |
| LiDAR-FL Sensor | Front-left LiDAR malfunction | Sensor fusion fallback |

## Controls

### Desktop (drive.html)
| Key | Action |
|-----|--------|
| W | Accelerate |
| S | Reverse |
| A | Steer left |
| D | Steer right |
| Space | Brake |
| V | Change camera |

### Presentation Mode
| Key | Action |
|-----|--------|
| F | Fullscreen |
| Space | Pause/Resume |
| R | Reset |

### Mobile (mobile.html)
- **Left joystick**: Steering
- **GAS button**: Accelerate
- **BRAKE button**: Decelerate/reverse
- **Camera icon**: Change view
- **Reset icon**: Reset position

### Games
| Game | Controls |
|------|----------|
| **Runner** | ← → / A D: Switch lanes, ↑ / SPACE: Jump, Swipe on mobile |
| **Defender** | Click threats to target, 1/Q: LiDAR, 2/W: Camera, 3/E: Radar |
| **Snake** | Arrow keys / WASD: Move, SPACE: Speed boost |
| **Shooter** | ← → / A D: Move, SPACE / Click: Fire, 1/2/3: Switch weapons |

## Technology Stack

- **Three.js** r128 - 3D rendering
- **Font Awesome** 6.5 - Icons
- **GLTFLoader** - 3D model loading
- **OrbitControls** - Camera controls

## File Structure

```
roii2/
├── index.html        # Network topology viewer
├── drive.html        # Driving simulator
├── mobile.html       # Touch-optimized version
├── dashboard.html    # Monitoring dashboard
├── presentation.html # Auto-demo mode
├── editor.html       # Topology editor
├── blueprint.html    # Technical drawing style
├── heatmap.html      # Sensor coverage visualization
├── wireframe.html    # TRON/retro style
├── dataflow.html     # Animated data packets
├── hologram.html     # Sci-fi holographic
├── nightvision.html  # Military NV style
├── dark.html         # Cyberpunk neon theme
├── simple.html       # Minimal view
├── initiald.html     # Racing drift mode
├── runner.html       # TSN Data Runner game
├── defender.html     # Network defense game
├── snake.html        # Network snake game
├── shooter.html      # Space invaders game
├── script.js         # Main application logic
├── roii.glb          # 3D vehicle model
├── keti.png          # KETI logo
├── libs/
│   ├── three.min.js
│   ├── OrbitControls.js
│   └── GLTFLoader.js
└── README.md
```

## Development

All JavaScript libraries are hosted locally (no CDN dependency for core functionality).

```bash
# Clone repository
git clone https://github.com/hwkim3330/roii2.git
cd roii2

# Open in browser
open index.html
```

## KETI

Korea Electronics Technology Institute - TSN Research Project

---

*Built with Three.js and Font Awesome*
