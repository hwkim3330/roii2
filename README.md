# ROii2 - Automotive TSN Network Designer

Automotive TSN (Time-Sensitive Networking) 3D Network Designer

## Live Demo
https://hwkim3330.github.io/roii2

## Architecture

### Central HPC
- **ACU_IT**: Infotainment Computing Unit
- **ACU_NO**: Non-Safety Computing Unit

### Zone Controllers (3x LAN9692)
| Zone | Controller | Connected Sensors |
|------|------------|-------------------|
| Front-L | Front-L-9692 | LiDAR-FL, Cam-Side-L1, Radar-Front-L, Cam-Front-L, LiDAR-Front-Center |
| Front-R | Front-R-9692 | LiDAR-FR, Cam-Side-R1, Radar-Front-R, Cam-Front-R, Cam-Front-Center, Radar-Front-Center |
| Rear | Rear-9692 | LiDAR-Rear-Center, Cam-Rear-Center, Cam-Side-L2, Cam-Side-R2, Radar-Rear-L, Radar-Rear-R |

### LAN9692 Specifications
- 7× MateNET T1 (100/1000BASE-T1)
- 4× SFP+ (Fiber, 1G/10G)
- 1× RJ45 (Management)
- **Total: 12 Ports**
- IEEE 802.1Qbv/Qav/Qbu · PTP

### Sensors
- 4× LiDAR (Front/Rear Center + Front Left/Right)
- 8× Camera (Front 3 + Side 4 + Rear 1)
- 5× Radar (Front 3 + Rear 2)

## Features
- 3D visualization with Three.js
- Interactive device placement
- Network connection management
- JSON export configuration
- Vehicle model overlay

## Usage
1. Click devices to select
2. Use Connect Mode to link devices
3. Drag to reposition
4. Export configuration as JSON

## KETI
한국전자기술연구원 TSN Research Project
