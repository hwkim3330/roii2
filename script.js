// ROii2 - Automotive TSN Network Designer
// LAN9692 x 3 Zone Controllers + ACU_IT HPC Configuration
// Network Topology Viewer (No Drive Mode - see drive.html for game)

// === THREE.JS SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f4f8);
scene.fog = new THREE.Fog(0xf0f4f8, 150, 500);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(50, 35, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.getElementById('canvas3d');
function updateSize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
updateSize();
container.appendChild(renderer.domElement);
window.addEventListener('resize', updateSize);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 200;
controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};

// === LIGHTING - Maximum brightness ===
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
mainLight.position.set(50, 100, 50);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 4096;
mainLight.shadow.mapSize.height = 4096;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 300;
mainLight.shadow.camera.left = -100;
mainLight.shadow.camera.right = 100;
mainLight.shadow.camera.top = 100;
mainLight.shadow.camera.bottom = -100;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
fillLight.position.set(-30, 30, -30);
scene.add(fillLight);

// Top fill light for bright vehicle
const topLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
topLight.position.set(0, 80, 0);
scene.add(topLight);

// === ENVIRONMENT ===
// Clean grid for network visualization (no road)
const gridHelper = new THREE.GridHelper(200, 40, 0x3B82F6, 0xd4e4f8);
gridHelper.material.opacity = 0.5;
gridHelper.material.transparent = true;
gridHelper.position.y = -0.2;
scene.add(gridHelper);

// Subtle ground plane for shadows
const groundGeo = new THREE.PlaneGeometry(500, 500);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.9
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.3;
ground.receiveShadow = true;
scene.add(ground);

// === STATE MANAGEMENT ===
const state = {
    devices: new Map(),
    connections: [],
    selected: null,
    mode: 'select',
    connectingFrom: null,
    deviceCounter: 1,
    autoRotate: false,
    vehicleGroup: new THREE.Group(),
    activeFaults: new Set()
};
scene.add(state.vehicleGroup);

// === VEHICLE MODEL ===
let vehicleModel = null;
let vehicleMeshes = [];
let vehicleOpacity = 0.75;

function createVehicleModel() {
    const group = new THREE.Group();
    group.userData.isVehicle = true;

    // Try loading GLB first
    const loader = new THREE.GLTFLoader();
    loader.load('./roii.glb',
        (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const targetSize = 40;
            const scale = targetSize / Math.max(size.x, size.y, size.z);
            model.scale.set(scale, scale, scale);

            const scaledHeight = size.y * scale;
            model.position.set(-center.x, -center.y + scaledHeight * 0.5 + 0.5, -center.z);

            model.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = vehicleOpacity;
                        child.material.side = THREE.DoubleSide;
                        // Balanced brightness like drive.html
                        if (child.material.color) {
                            child.material.color.multiplyScalar(1.5);
                        }
                        child.material.emissive = new THREE.Color(0x333333);
                        child.material.emissiveIntensity = 0.2;
                    }
                    child.castShadow = true;
                    child.receiveShadow = true;
                    vehicleMeshes.push(child);
                }
            });

            group.add(model);
            showToast('3D Vehicle Model Loaded');
        },
        null,
        () => {
            // Fallback: Create procedural shuttle
            createProceduralVehicle(group);
        }
    );

    state.vehicleGroup.add(group);
    vehicleModel = group;
    return group;
}

function createProceduralVehicle(group) {
    // Main chassis
    const chassisGeo = new THREE.BoxGeometry(16, 10, 36);
    const chassisMat = new THREE.MeshPhysicalMaterial({
        color: 0xf0f4f8,
        transparent: true,
        opacity: vehicleOpacity,
        metalness: 0.1,
        roughness: 0.2,
        clearcoat: 0.5
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 6;
    chassis.castShadow = true;
    group.add(chassis);
    vehicleMeshes.push(chassis);

    // Roof
    const roofGeo = new THREE.BoxGeometry(14, 4, 30);
    const roof = new THREE.Mesh(roofGeo, chassisMat.clone());
    roof.position.y = 13;
    roof.castShadow = true;
    group.add(roof);
    vehicleMeshes.push(roof);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.5, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    wheelGeo.rotateZ(Math.PI / 2);

    [[-8, 2.5, 12], [8, 2.5, 12], [-8, 2.5, -12], [8, 2.5, -12]].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(...pos);
        wheel.castShadow = true;
        group.add(wheel);
    });

    // Front indicator (blue stripe)
    const frontGeo = new THREE.BoxGeometry(14, 2, 0.5);
    const frontMat = new THREE.MeshBasicMaterial({ color: 0x3B82F6 });
    const front = new THREE.Mesh(frontGeo, frontMat);
    front.position.set(0, 6, 18.1);
    group.add(front);

    // Rear indicator (red stripe)
    const rearMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
    const rear = new THREE.Mesh(frontGeo, rearMat);
    rear.position.set(0, 6, -18.1);
    group.add(rear);
}

function updateVehicleOpacity(opacity) {
    vehicleOpacity = opacity;
    vehicleMeshes.forEach(mesh => {
        if (mesh.material) {
            mesh.material.opacity = opacity;
        }
    });
}

// === DEVICE TEMPLATES WITH DETAILED SPECS ===
const templates = {
    lan9692: {
        label: 'LAN9692',
        color: 0x10B981,
        ports: 12,
        size: [4, 2, 4],
        specs: {
            type: 'TSN Automotive Ethernet Switch',
            manufacturer: 'Microchip',
            portConfig: {
                matenet: { count: 7, speed: '100/1000BASE-T1' },
                sfp: { count: 4, speed: '1G/10G SFP+' },
                rj45: { count: 1, speed: '10/100/1000BASE-T' }
            },
            tsn: ['IEEE 802.1Qbv (TAS)', 'IEEE 802.1Qav (CBS)', 'IEEE 802.1Qbu (Preemption)', 'IEEE 802.1CB (FRER)', 'IEEE 1588 (PTP)'],
            features: ['Cut-through switching', 'Store-and-forward', 'Multicast filtering', 'VLAN support'],
            bandwidth: '10G aggregate',
            latency: '<2μs port-to-port'
        }
    },
    hpc: {
        label: 'HPC',
        color: 0xE11D48,
        ports: 4,
        size: [5, 2.5, 5],
        specs: {
            type: 'High Performance Computing Unit',
            function: 'Central Domain Controller',
            role: 'ACU_IT (Autonomous Computing Unit - Infotainment)',
            connectivity: '4x 10G Ethernet',
            processing: 'Multi-core ARM/x86 SoC',
            features: ['Sensor fusion', 'Path planning', 'V2X communication', 'OTA updates']
        }
    },
    camera: {
        label: 'Camera',
        color: 0xd66b00,
        ports: 1,
        size: [0.8, 0.8, 0.8],
        specs: {
            type: 'Automotive Camera',
            resolution: '8MP (3840×2160)',
            frameRate: '30fps / 60fps',
            interface: '1000BASE-T1 (GMSL2)',
            fov: '120° (surround) / 60° (forward)',
            features: ['HDR', 'LED flicker mitigation', 'ISP'],
            bandwidth: '~400 Mbps (compressed)'
        }
    },
    lidar: {
        label: 'LiDAR',
        color: 0x10B981,
        ports: 1,
        size: [1.2, 1.2, 1.2],
        specs: {
            type: '3D LiDAR Sensor',
            technology: 'Solid-state / Rotating',
            range: '200m (10% reflectivity)',
            resolution: '0.1° angular',
            pointRate: '1.2M points/sec',
            interface: '1000BASE-T1',
            bandwidth: '~100 Mbps',
            features: ['Rain/fog filtering', 'Multi-return', 'Time-stamped']
        }
    },
    radar: {
        label: 'Radar',
        color: 0x952aff,
        ports: 1,
        size: [1.2, 1.2, 1.2],
        specs: {
            type: '4D Imaging Radar',
            frequency: '77GHz (76-81GHz)',
            range: '300m (long) / 80m (short)',
            fov: '120° azimuth × 30° elevation',
            interface: '100BASE-T1',
            bandwidth: '~20 Mbps',
            features: ['Velocity detection', 'Object classification', 'All-weather']
        }
    },
    ecu: {
        label: 'ECU',
        color: 0x8B5CF6,
        ports: 1,
        size: [4, 2, 4],
        specs: {
            type: 'Electronic Control Unit',
            function: 'Vehicle subsystem controller'
        }
    }
};

// === DEVICE CREATION ===
function createDeviceMaterial(color, emissiveIntensity = 0.4) {
    return new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity,
        specular: 0x888888,
        shininess: 30
    });
}

function createDeviceMesh(device, template, customSize = null, tilt = null) {
    const group = new THREE.Group();
    group.userData.device = device;
    group.userData.isDevice = true;

    const size = customSize || template.size;

    let geometry;
    if (device.type === 'lidar' && !device.label.includes('Center')) {
        geometry = new THREE.CylinderGeometry(size[0] * 0.5, size[0] * 0.5, size[1], 16);
    } else {
        geometry = new THREE.BoxGeometry(...size);
    }

    const material = createDeviceMaterial(template.color, 0.5);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Wireframe
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(edges,
        new THREE.LineBasicMaterial({ color: 0xFFFFFF, opacity: 0.8, transparent: true }));
    group.add(wireframe);

    group.position.copy(device.position);
    if (tilt) {
        if (tilt.x !== undefined) group.rotation.x = tilt.x;
        if (tilt.y !== undefined) group.rotation.y = tilt.y;
        if (tilt.z !== undefined) group.rotation.z = tilt.z;
    }

    device.mesh = group;
    state.vehicleGroup.add(group);
}

function addDevice(type, position, customLabel = null, customSize = null, tilt = null) {
    const template = templates[type];
    if (!template) return null;

    const id = `device-${state.deviceCounter++}`;
    const device = {
        id, type,
        label: customLabel || `${template.label}-${state.deviceCounter - 1}`,
        position: position.clone(),
        ports: template.ports,
        mesh: null,
        status: 'normal' // normal, fault, recovery
    };

    createDeviceMesh(device, template, customSize, tilt);
    state.devices.set(id, device);
    updateStats();
    return device;
}

// === CONNECTIONS ===
function createConnection(from, to, bandwidth = null) {
    const exists = state.connections.some(conn =>
        (conn.from.id === from.id && conn.to.id === to.id) ||
        (conn.from.id === to.id && conn.to.id === from.id)
    );
    if (exists) return;

    // Determine bandwidth and color based on connection type
    let bw, color, tubeRadius;
    if (from.type === 'lan9692' && to.type === 'lan9692') {
        bw = '10G';
        color = 0x3B82F6; // Blue for 10G backbone
        tubeRadius = 0.15;
    } else if (from.type === 'hpc' || to.type === 'hpc') {
        bw = '10G';
        color = 0xFFD700; // Gold for HPC links
        tubeRadius = 0.12;
    } else {
        bw = '1G';
        color = 0x10B981; // Green for sensor links
        tubeRadius = 0.06;
    }
    if (bandwidth) bw = bandwidth;

    const curve = new THREE.CatmullRomCurve3([from.position.clone(), to.position.clone()]);

    const tubeGeo = new THREE.TubeGeometry(curve, 16, tubeRadius, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    state.vehicleGroup.add(tube);

    // Flow particles (bigger for higher bandwidth)
    const particles = [];
    const particleCount = bw === '10G' ? 4 : 2;
    const particleSize = bw === '10G' ? 0.2 : 0.12;
    for (let i = 0; i < particleCount; i++) {
        const pGeo = new THREE.SphereGeometry(particleSize, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const p = new THREE.Mesh(pGeo, pMat);
        p.userData = { t: i / particleCount, curve };
        state.vehicleGroup.add(p);
        particles.push(p);
    }

    const conn = {
        from, to, tube, curve, particles, color, bandwidth: bw,
        status: 'normal',
        originalColor: color
    };
    state.connections.push(conn);
    updateStats();
    return conn;
}

function updateConnectionVisual(conn, status) {
    conn.status = status;
    if (status === 'fault') {
        conn.tube.material.color.setHex(0xEF4444);
        conn.tube.material.opacity = 0.3;
        conn.particles.forEach(p => p.visible = false);
    } else {
        conn.tube.material.color.setHex(conn.originalColor);
        conn.tube.material.opacity = 0.7;
        conn.particles.forEach(p => p.visible = true);
    }
}

// === VEHICLE SCENARIO ===
function loadVehicleScenario() {
    // Clear existing
    state.devices.forEach(d => state.vehicleGroup.remove(d.mesh));
    state.connections.forEach(c => {
        state.vehicleGroup.remove(c.tube);
        c.particles.forEach(p => state.vehicleGroup.remove(p));
    });
    state.devices.clear();
    state.connections = [];
    state.deviceCounter = 1;
    state.activeFaults.clear();

    if (!vehicleModel) createVehicleModel();

    // === CENTRAL HPC (ACU_IT only) ===
    const acuIT = addDevice('hpc', new THREE.Vector3(0, 4, 0), 'ACU_IT');

    // === ZONE CONTROLLERS (3x LAN9692) ===
    const frontL = addDevice('lan9692', new THREE.Vector3(-3.5, 4, 10), 'Front-L-9692');
    const frontR = addDevice('lan9692', new THREE.Vector3(3.5, 4, 10), 'Front-R-9692');
    const rear = addDevice('lan9692', new THREE.Vector3(0, 4, -10), 'Rear-9692');

    // === SENSORS (positions matched with drive.html) ===
    // LiDAR (4) - Roof mounted corners + front/rear center
    const lidarFL = addDevice('lidar', new THREE.Vector3(-8.5, 10, 16.2), 'LiDAR-FL');
    const lidarFR = addDevice('lidar', new THREE.Vector3(8.5, 10, 16.2), 'LiDAR-FR');
    const lidarFC = addDevice('lidar', new THREE.Vector3(0, 5.5, 18.5), 'LiDAR-Front-Center');
    const lidarRC = addDevice('lidar', new THREE.Vector3(0, 5.5, -18.5), 'LiDAR-Rear-Center');

    // Camera (8) - Front cluster + side mirrors + rear
    const camFC = addDevice('camera', new THREE.Vector3(0, 10.5, 18.5), 'Cam-Front-Center');
    const camFL = addDevice('camera', new THREE.Vector3(0.6, 10.5, 18.5), 'Cam-Front-L');
    const camFR = addDevice('camera', new THREE.Vector3(-0.6, 10.5, 18.5), 'Cam-Front-R');
    const camSL1 = addDevice('camera', new THREE.Vector3(-8.5, 11, 16.5), 'Cam-Side-L1');
    const camSR1 = addDevice('camera', new THREE.Vector3(8.5, 11, 16.5), 'Cam-Side-R1');
    const camSL2 = addDevice('camera', new THREE.Vector3(-8.5, 11, 15.9), 'Cam-Side-L2');
    const camSR2 = addDevice('camera', new THREE.Vector3(8.5, 11, 15.9), 'Cam-Side-R2');
    const camRC = addDevice('camera', new THREE.Vector3(0, 9, -18.5), 'Cam-Rear-Center');

    // Radar (5) - Bumper integrated
    const radarFC = addDevice('radar', new THREE.Vector3(0, 7, 18.5), 'Radar-Front-Center');
    const radarFL = addDevice('radar', new THREE.Vector3(-7, 6.5, 17.5), 'Radar-Front-L');
    const radarFR = addDevice('radar', new THREE.Vector3(7, 6.5, 17.5), 'Radar-Front-R');
    const radarRL = addDevice('radar', new THREE.Vector3(-7, 6.5, -18), 'Radar-Rear-L');
    const radarRR = addDevice('radar', new THREE.Vector3(7, 6.5, -18), 'Radar-Rear-R');

    // === CONNECTIONS ===
    // All Zone Controllers → ACU_IT
    createConnection(frontL, acuIT);
    createConnection(frontR, acuIT);
    createConnection(rear, acuIT);

    // Front-L ↔ Front-R (10G Backbone)
    createConnection(frontL, frontR);

    // Front-L Zone → Sensors
    createConnection(frontL, lidarFL);
    createConnection(frontL, lidarFC);
    createConnection(frontL, camFL);
    createConnection(frontL, camSL1);
    createConnection(frontL, radarFL);

    // Front-R Zone → Sensors
    createConnection(frontR, lidarFR);
    createConnection(frontR, camFC);
    createConnection(frontR, camFR);
    createConnection(frontR, camSR1);
    createConnection(frontR, radarFC);
    createConnection(frontR, radarFR);

    // Front-L Zone → Side Camera 2
    createConnection(frontL, camSL2);

    // Front-R Zone → Side Camera 2
    createConnection(frontR, camSR2);

    // Rear Zone → Sensors
    createConnection(rear, lidarRC);
    createConnection(rear, camRC);
    createConnection(rear, radarRL);
    createConnection(rear, radarRR);

    // Reset vehicle position
    state.vehicleGroup.position.set(0, 0, 0);
    state.vehicleGroup.rotation.set(0, 0, 0);

    camera.position.set(50, 35, 70);
    controls.target.set(0, 0, 0);
    controls.update();

    updateStats();
    showToast('ROii2: ACU_IT + 3x LAN9692 + 17 Sensors');
}

// === FAULT SIMULATION ===
function injectFault(faultType) {
    if (state.activeFaults.has(faultType)) {
        // Clear fault
        state.activeFaults.delete(faultType);
        clearFault(faultType);
        return;
    }

    state.activeFaults.add(faultType);

    switch(faultType) {
        case 'front-backbone':
            // Front-L ↔ Front-R 10G backbone failure
            state.connections.forEach(conn => {
                if ((conn.from.label === 'Front-L-9692' && conn.to.label === 'Front-R-9692') ||
                    (conn.from.label === 'Front-R-9692' && conn.to.label === 'Front-L-9692')) {
                    updateConnectionVisual(conn, 'fault');
                }
            });
            showToast('⚠️ FAULT: Front 10G Backbone Link Down');
            break;

        case 'front-l-link':
            state.connections.forEach(conn => {
                if ((conn.from.label === 'Front-L-9692' && conn.to.label === 'ACU_IT') ||
                    (conn.from.label === 'ACU_IT' && conn.to.label === 'Front-L-9692')) {
                    updateConnectionVisual(conn, 'fault');
                }
            });
            showToast('⚠️ FAULT: Front-L-9692 ↔ ACU_IT Link Down');
            // Show recovery path via Front-R backbone
            setTimeout(() => {
                document.getElementById('recoveryStatus').classList.add('visible');
            }, 1000);
            break;

        case 'rear-link':
            state.connections.forEach(conn => {
                if ((conn.from.label === 'Rear-9692' && conn.to.label === 'ACU_IT') ||
                    (conn.from.label === 'ACU_IT' && conn.to.label === 'Rear-9692')) {
                    updateConnectionVisual(conn, 'fault');
                }
            });
            showToast('⚠️ FAULT: Rear-9692 ↔ ACU_IT Link Down');
            break;

        case 'sensor':
            state.devices.forEach(device => {
                if (device.label === 'LiDAR-FL') {
                    device.status = 'fault';
                    device.mesh.children[0].material.color.setHex(0xEF4444);
                    device.mesh.children[0].material.emissive.setHex(0xEF4444);
                }
            });
            showToast('⚠️ FAULT: LiDAR-FL Sensor Error');
            break;
    }

    // Update UI
    const faultEl = document.querySelector(`[data-fault="${faultType}"]`);
    if (faultEl) faultEl.classList.add('active');
}

function clearFault(faultType) {
    switch(faultType) {
        case 'front-backbone':
        case 'front-l-link':
        case 'rear-link':
            state.connections.forEach(conn => {
                updateConnectionVisual(conn, 'normal');
            });
            document.getElementById('recoveryStatus').classList.remove('visible');
            break;

        case 'sensor':
            state.devices.forEach(device => {
                if (device.label === 'LiDAR-FL') {
                    device.status = 'normal';
                    const template = templates[device.type];
                    device.mesh.children[0].material.color.setHex(template.color);
                    device.mesh.children[0].material.emissive.setHex(template.color);
                }
            });
            break;
    }

    const faultEl = document.querySelector(`[data-fault="${faultType}"]`);
    if (faultEl) faultEl.classList.remove('active');
    showToast('✅ Fault Cleared');
}


// === MOUSE INTERACTION ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(state.vehicleGroup.children, true);

    let device = null;
    for (let hit of intersects) {
        let obj = hit.object;
        while (obj) {
            if (obj.userData && obj.userData.isDevice) {
                device = obj.userData.device;
                break;
            }
            obj = obj.parent;
        }
        if (device) break;
    }

    if (device) {
        state.selected = device;
        showProperties(device);
        showToast(`Selected: ${device.label}`);
    } else {
        state.selected = null;
        document.getElementById('properties').classList.remove('visible');
    }
});

// === UI FUNCTIONS ===
function updateStats() {
    document.getElementById('deviceCount').textContent = state.devices.size;
    document.getElementById('linkCount').textContent = state.connections.length;
    // Calculate total bandwidth (10G links + 1G links)
    let totalBW = 0;
    state.connections.forEach(c => {
        totalBW += c.bandwidth === '10G' ? 10 : 1;
    });
    document.getElementById('bandwidth').textContent = totalBW;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
}

function showProperties(device) {
    const template = templates[device.type];
    const content = document.getElementById('propertiesContent');
    const specs = template.specs || {};

    // Get connections for this device
    const deviceConns = state.connections.filter(c =>
        c.from.id === device.id || c.to.id === device.id
    );
    const usedPorts = deviceConns.length;
    const totalPorts = device.ports;

    // Build connections list
    let connList = deviceConns.map(c => {
        const other = c.from.id === device.id ? c.to : c.from;
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#475569;">${other.label}</span>
            <span class="badge ${c.bandwidth === '10G' ? 'badge-info' : 'badge-success'}">${c.bandwidth}</span>
        </div>`;
    }).join('');

    // Build specifications HTML based on device type
    let specsHtml = '';
    if (device.type === 'lan9692' && specs.portConfig) {
        specsHtml = `
            <div class="prop-section">
                <div class="prop-title">🔌 Port Configuration</div>
                <div style="font-size:12px;color:#334155;">
                    <div style="padding:4px 0;border-bottom:1px solid #e2e8f0;">
                        <strong>MateNET T1:</strong> ${specs.portConfig.matenet.count}× ${specs.portConfig.matenet.speed}
                    </div>
                    <div style="padding:4px 0;border-bottom:1px solid #e2e8f0;">
                        <strong>SFP+:</strong> ${specs.portConfig.sfp.count}× ${specs.portConfig.sfp.speed}
                    </div>
                    <div style="padding:4px 0;">
                        <strong>RJ45:</strong> ${specs.portConfig.rj45.count}× ${specs.portConfig.rj45.speed}
                    </div>
                </div>
            </div>
            <div class="prop-section">
                <div class="prop-title">⏱️ TSN Features</div>
                <div style="font-size:11px;color:#475569;">
                    ${specs.tsn.map(f => `<div style="padding:2px 0;">• ${f}</div>`).join('')}
                </div>
            </div>
            <div class="prop-section">
                <div class="prop-title">📊 Performance</div>
                <div style="font-size:12px;color:#334155;">
                    <div style="padding:4px 0;"><strong>Bandwidth:</strong> ${specs.bandwidth}</div>
                    <div style="padding:4px 0;"><strong>Latency:</strong> ${specs.latency}</div>
                </div>
            </div>`;
    } else if (device.type === 'hpc') {
        specsHtml = `
            <div class="prop-section">
                <div class="prop-title">🖥️ HPC Specifications</div>
                <div style="font-size:12px;color:#334155;">
                    <div style="padding:4px 0;"><strong>Role:</strong> ${specs.role}</div>
                    <div style="padding:4px 0;"><strong>Connectivity:</strong> ${specs.connectivity}</div>
                    <div style="padding:4px 0;"><strong>Processing:</strong> ${specs.processing}</div>
                </div>
            </div>
            <div class="prop-section">
                <div class="prop-title">🧠 Functions</div>
                <div style="font-size:11px;color:#475569;">
                    ${specs.features.map(f => `<div style="padding:2px 0;">• ${f}</div>`).join('')}
                </div>
            </div>`;
    } else if (device.type === 'lidar') {
        specsHtml = `
            <div class="prop-section">
                <div class="prop-title">🔵 LiDAR Specifications</div>
                <div style="font-size:12px;color:#334155;">
                    <div style="padding:4px 0;"><strong>Technology:</strong> ${specs.technology}</div>
                    <div style="padding:4px 0;"><strong>Range:</strong> ${specs.range}</div>
                    <div style="padding:4px 0;"><strong>Resolution:</strong> ${specs.resolution}</div>
                    <div style="padding:4px 0;"><strong>Point Rate:</strong> ${specs.pointRate}</div>
                    <div style="padding:4px 0;"><strong>Interface:</strong> ${specs.interface}</div>
                    <div style="padding:4px 0;"><strong>Bandwidth:</strong> ${specs.bandwidth}</div>
                </div>
            </div>
            <div class="prop-section">
                <div class="prop-title">✨ Features</div>
                <div style="font-size:11px;color:#475569;">
                    ${specs.features.map(f => `<div style="padding:2px 0;">• ${f}</div>`).join('')}
                </div>
            </div>`;
    } else if (device.type === 'camera') {
        specsHtml = `
            <div class="prop-section">
                <div class="prop-title">📷 Camera Specifications</div>
                <div style="font-size:12px;color:#334155;">
                    <div style="padding:4px 0;"><strong>Resolution:</strong> ${specs.resolution}</div>
                    <div style="padding:4px 0;"><strong>Frame Rate:</strong> ${specs.frameRate}</div>
                    <div style="padding:4px 0;"><strong>FoV:</strong> ${specs.fov}</div>
                    <div style="padding:4px 0;"><strong>Interface:</strong> ${specs.interface}</div>
                    <div style="padding:4px 0;"><strong>Bandwidth:</strong> ${specs.bandwidth}</div>
                </div>
            </div>
            <div class="prop-section">
                <div class="prop-title">✨ Features</div>
                <div style="font-size:11px;color:#475569;">
                    ${specs.features.map(f => `<div style="padding:2px 0;">• ${f}</div>`).join('')}
                </div>
            </div>`;
    } else if (device.type === 'radar') {
        specsHtml = `
            <div class="prop-section">
                <div class="prop-title">📡 Radar Specifications</div>
                <div style="font-size:12px;color:#334155;">
                    <div style="padding:4px 0;"><strong>Frequency:</strong> ${specs.frequency}</div>
                    <div style="padding:4px 0;"><strong>Range:</strong> ${specs.range}</div>
                    <div style="padding:4px 0;"><strong>FoV:</strong> ${specs.fov}</div>
                    <div style="padding:4px 0;"><strong>Interface:</strong> ${specs.interface}</div>
                    <div style="padding:4px 0;"><strong>Bandwidth:</strong> ${specs.bandwidth}</div>
                </div>
            </div>
            <div class="prop-section">
                <div class="prop-title">✨ Features</div>
                <div style="font-size:11px;color:#475569;">
                    ${specs.features.map(f => `<div style="padding:2px 0;">• ${f}</div>`).join('')}
                </div>
            </div>`;
    }

    content.innerHTML = `
        <div class="prop-section">
            <div class="prop-title">Device Info</div>
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" value="${device.label}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Type</label>
                <input type="text" class="form-input" value="${specs.type || template.label}" readonly>
            </div>
            <div style="margin-top:12px;">
                <span class="badge ${device.status === 'fault' ? 'badge-danger' : 'badge-success'}">
                    ${device.status === 'fault' ? 'FAULT' : 'Active'}
                </span>
            </div>
        </div>
        ${specsHtml}
        <div class="prop-section">
            <div class="prop-title">Port Usage</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="flex:1;background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;">
                    <div style="width:${(usedPorts/totalPorts)*100}%;height:100%;background:#3b82f6;"></div>
                </div>
                <span style="font-size:13px;font-weight:600;color:#1e293b;">${usedPorts}/${totalPorts}</span>
            </div>
            <div style="font-size:11px;color:#64748b;">
                ${totalPorts - usedPorts} ports available
            </div>
        </div>
        <div class="prop-section">
            <div class="prop-title">Connections (${deviceConns.length})</div>
            <div style="font-size:12px;">
                ${connList || '<span style="color:#94a3b8;">No connections</span>'}
            </div>
        </div>
    `;
    document.getElementById('properties').classList.add('visible');
}

// === EVENT LISTENERS ===
document.getElementById('vehicleBtn').addEventListener('click', loadVehicleScenario);

document.getElementById('faultBtn').addEventListener('click', () => {
    document.getElementById('faultPanel').classList.toggle('visible');
});

document.querySelectorAll('.fault-item').forEach(item => {
    item.addEventListener('click', () => {
        injectFault(item.dataset.fault);
    });
});

document.getElementById('rotateBtn').addEventListener('click', function() {
    state.autoRotate = !state.autoRotate;
    controls.autoRotate = state.autoRotate;
    this.classList.toggle('active');
});

document.getElementById('resetBtn').addEventListener('click', () => {
    state.vehicleGroup.position.set(0, 0, 0);
    state.vehicleGroup.rotation.set(0, 0, 0);
    camera.position.set(50, 35, 70);
    controls.target.set(0, 0, 0);
    controls.update();
});

document.getElementById('closeBtn').addEventListener('click', () => {
    document.getElementById('properties').classList.remove('visible');
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const config = {
        timestamp: new Date().toISOString(),
        architecture: 'ROii2 - 3x LAN9692 + HPC',
        devices: Array.from(state.devices.values()).map(d => ({
            id: d.id, type: d.type, label: d.label,
            position: { x: d.position.x, y: d.position.y, z: d.position.z }
        })),
        connections: state.connections.map(c => ({ from: c.from.label, to: c.to.label }))
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `roii2-config-${Date.now()}.json`;
    a.click();
    showToast('Configuration exported');
});

document.getElementById('opacitySlider').addEventListener('input', function() {
    updateVehicleOpacity(this.value / 100);
    document.getElementById('opacityValue').textContent = this.value + '%';
});

// === ANIMATION LOOP ===
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Animate connection particles
    state.connections.forEach(conn => {
        if (conn.status === 'normal') {
            conn.particles.forEach(p => {
                p.userData.t += 0.008;
                if (p.userData.t > 1) p.userData.t = 0;
                const point = p.userData.curve.getPoint(p.userData.t);
                p.position.copy(point);
            });
        }
    });

    renderer.render(scene, camera);
}

// === INITIALIZATION ===
createVehicleModel();
loadVehicleScenario();
animate();
