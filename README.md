# ROii2 - Automotive TSN Network Designer

3D visualization and simulation of Time-Sensitive Networking (TSN) architecture for autonomous vehicles.

## Live Demo

| Version | URL | Description |
|---------|-----|-------------|
| **Network** | [index.html](https://hwkim3330.github.io/roii2/) | Network topology visualization |
| **Drive** | [drive.html](https://hwkim3330.github.io/roii2/drive.html) | Driving simulator (WASD) |
| **Mobile** | [mobile.html](https://hwkim3330.github.io/roii2/mobile.html) | Touch/mouse controls |
| **Dashboard** | [dashboard.html](https://hwkim3330.github.io/roii2/dashboard.html) | Real-time monitoring dashboard |
| **Presentation** | [presentation.html](https://hwkim3330.github.io/roii2/presentation.html) | Auto-demo presentation mode |
| **Editor** | [editor.html](https://hwkim3330.github.io/roii2/editor.html) | Network topology editor |
| **Dark** | [dark.html](https://hwkim3330.github.io/roii2/dark.html) | Cyberpunk neon theme |
| **Simple** | [simple.html](https://hwkim3330.github.io/roii2/simple.html) | Minimal clean view |
| **Initial D** | [initiald.html](https://hwkim3330.github.io/roii2/initiald.html) | Racing drift mode |

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
├── dark.html         # Dark/neon theme
├── simple.html       # Minimal view
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
