# ROii2 - Automotive TSN Network Designer

3D visualization and simulation of Time-Sensitive Networking (TSN) architecture for autonomous vehicles.

## Live Demo

| Version | URL | Description |
|---------|-----|-------------|
| **Network** | [index.html](https://hwkim3330.github.io/roii2/) | Network topology visualization |
| **Drive** | [drive.html](https://hwkim3330.github.io/roii2/drive.html) | Driving simulator (WASD) |
| **Mobile** | [mobile.html](https://hwkim3330.github.io/roii2/mobile.html) | Touch/mouse controls |

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

## Features

### Network View (index.html)
- 3D visualization with Three.js
- Click devices to view properties
- Fault injection simulation
- JSON configuration export
- Auto-rotate view

### Drive Mode (drive.html)
- WASD keyboard controls
- Multiple camera views (V key)
- Speedometer
- Fault simulation while driving

### Mobile (mobile.html)
- Touch joystick for steering
- Gas/brake pedals
- Mouse support for desktop
- Keyboard (WASD/arrows) support
- Full 17-sensor network

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
├── index.html      # Network topology viewer
├── drive.html      # Driving simulator
├── mobile.html     # Touch-optimized version
├── script.js       # Main application logic
├── styles.css      # Stylesheet
├── roii.glb        # 3D vehicle model
├── keti.png        # KETI logo
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
