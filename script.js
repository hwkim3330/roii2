// ROii2 - Automotive TSN Network Designer 3D
// LAN9692 x 3 Zone Controllers Configuration
// JavaScript Application Logic

// Three.js 초기화
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
scene.fog = new THREE.Fog(0xf0f0f0, 80, 250);

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
controls.maxDistance = 120;
controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};

// 조명 (밝게 최적화)
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
mainLight.position.set(30, 50, 30);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 200;
mainLight.shadow.camera.left = -60;
mainLight.shadow.camera.right = 60;
mainLight.shadow.camera.top = 60;
mainLight.shadow.camera.bottom = -60;
scene.add(mainLight);

// 추가 Fill Light (위에서 아래로 - 모델 밝게)
const fillLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
fillLight.position.set(0, 50, 0);
scene.add(fillLight);

// Blue accent lights (밝게)
const blueLight1 = new THREE.PointLight(0x3B82F6, 2, 100);
blueLight1.position.set(20, 15, 20);
scene.add(blueLight1);

const blueLight2 = new THREE.PointLight(0x06B6D4, 1.5, 80);
blueLight2.position.set(-20, 15, -20);
scene.add(blueLight2);

// 그리드 (밝은 배경에 맞게)
const gridHelper = new THREE.GridHelper(100, 50, 0x3B82F6, 0xCCCCCC);
gridHelper.material.opacity = 0.4;
gridHelper.material.transparent = true;
gridHelper.position.y = -0.5;
scene.add(gridHelper);

// 바닥
const planeGeo = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.ShadowMaterial({ opacity: 0.3 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;
plane.receiveShadow = true;
scene.add(plane);

// 차량 모델 생성
let vehicleModel = null;
let vehicleMeshes = [];  // 투명도 조절을 위한 메시 배열
let vehicleWireframes = [];  // 와이어프레임 배열
let vehicleOpacity = 0.3;  // 기본 투명도 30%

function createVehicleModel() {
    const group = new THREE.Group();
    group.userData.isVehicle = true;
    group.userData.label = 'Vehicle';

    // GLTFLoader로 roii.glb 로드 시도
    const loader = new THREE.GLTFLoader();
    loader.load(
        './roii.glb',
        function (gltf) {
            console.log('✅ GLB file loaded successfully');
            const model = gltf.scene;

            // 바운딩 박스 계산
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            console.log('📦 Model dimensions:', {
                width: size.x.toFixed(2),
                height: size.y.toFixed(2),
                length: size.z.toFixed(2),
                center: {
                    x: center.x.toFixed(2),
                    y: center.y.toFixed(2),
                    z: center.z.toFixed(2)
                }
            });

            // 목표 크기 (기존 박스 모델과 비슷하게)
            const targetSize = 40; // Z축 길이를 40 유닛으로
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = targetSize / maxDim;

            console.log('📐 Auto-scale factor:', scale.toFixed(3));
            model.scale.set(scale, scale, scale);

            // 모델을 원점으로 이동 + Y축 조정 (올려서 배치)
            // 그라운드 평면이 y = -0.5이므로, 모델 하단을 평면 위로
            const scaledHeight = size.y * scale;
            model.position.x = -center.x;
            model.position.y = -center.y + (scaledHeight * 0.5) + 0.5; // 하단을 평면 위로 올림
            model.position.z = -center.z;

            console.log('🔧 Model lifted to Y:', model.position.y.toFixed(2));

            // 모든 메시에 대해 텍스처만 보이게 + 투명도 설정
            console.log('🔍 Model Structure Analysis:');
            let meshIndex = 0;
            model.traverse((child) => {
                if (child.isMesh) {
                    // 메시 정보 로깅
                    const bbox = new THREE.Box3().setFromObject(child);
                    const meshSize = bbox.getSize(new THREE.Vector3());
                    const meshCenter = child.getWorldPosition(new THREE.Vector3());

                    console.log(`  Mesh ${meshIndex}: ${child.name || 'unnamed'}`);
                    console.log(`    Position: (${meshCenter.x.toFixed(2)}, ${meshCenter.y.toFixed(2)}, ${meshCenter.z.toFixed(2)})`);
                    console.log(`    Size: (${meshSize.x.toFixed(2)}, ${meshSize.y.toFixed(2)}, ${meshSize.z.toFixed(2)})`);
                    console.log(`    Material:`, child.material.name || 'unnamed');
                    meshIndex++;

                    // 텍스처만 보이게 + 밝게 (기존 재질 유지, wireframe 제거)
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.transparent = true;
                                mat.opacity = vehicleOpacity;
                                mat.side = THREE.DoubleSide;
                                mat.depthWrite = true;
                                // 모델 밝게
                                if (mat.color) {
                                    mat.color.multiplyScalar(1.5);
                                }
                                mat.emissive = mat.color ? mat.color.clone().multiplyScalar(0.3) : new THREE.Color(0xFFFFFF);
                                mat.emissiveIntensity = 0.4;
                            });
                        } else {
                            child.material.transparent = true;
                            child.material.opacity = vehicleOpacity;
                            child.material.side = THREE.DoubleSide;
                            child.material.depthWrite = true;
                            // 모델 밝게
                            if (child.material.color) {
                                child.material.color.multiplyScalar(1.5);
                            }
                            child.material.emissive = child.material.color ? child.material.color.clone().multiplyScalar(0.3) : new THREE.Color(0xFFFFFF);
                            child.material.emissiveIntensity = 0.4;
                        }
                    }
                    child.castShadow = true;
                    child.receiveShadow = true;
                    vehicleMeshes.push(child);
                }
            });
            console.log(`📊 Total meshes: ${meshIndex}`);

            group.add(model);
            scene.add(group);
            vehicleModel = group;

            showToast('✅ 3D vehicle model loaded (auto-scaled)');
            console.log('🚗 Vehicle model ready');
        },
        function (xhr) {
            if (xhr.total > 0) {
                console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% loaded');
            }
        },
        function (error) {
            console.error('❌ GLB loading failed:', error);
            showToast('⚠️ Vehicle model not found. Please add roii.glb to repository.');
        }
    );

    return group;
}

// 차량 투명도 업데이트 함수
function updateVehicleOpacity(opacity) {
    vehicleOpacity = opacity;
    vehicleMeshes.forEach(mesh => {
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                    mat.opacity = opacity;
                });
            } else {
                mesh.material.opacity = opacity;
            }
        }
    });
}

// 장치 템플릿
const templates = {
    // 네트워크 스위치/게이트웨이 - LAN9692만 사용
    lan9692: {
        label: 'LAN9692',
        color: 0x10B981,
        ports: 12,
        mateNetPorts: 7,
        sfpPlusPorts: 4,
        mgmtRj45: 1,
        size: [4, 2, 4]
    },
    // 센서
    camera: {
        label: 'Camera',
        color: 0xd66b00,
        ports: 1,
        size: [0.5, 0.5, 0.5]
    },
    lidar: {
        label: 'LiDAR',
        color: 0x10B981,
        ports: 1,
        size: [1, 1, 1]
    },
    radar: {
        label: 'Radar',
        color: 0x952aff,
        ports: 1,
        size: [1, 1, 1]
    },
    // ECU
    ecu: {
        label: 'ECU',
        color: 0x8B5CF6,
        ports: 1,
        size: [4, 2, 4]
    }
};

const state = {
    devices: new Map(),
    connections: [],
    selected: null,
    mode: 'select',
    connectingFrom: null,
    deviceCounter: 1,
    draggedDevice: null,
    autoRotate: false,
    longPressTimer: null,
    touchStartTime: 0,
    isTouchDragging: false,
    wasDragging: false
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

const LONG_PRESS_DURATION = 500;

// === 장치 메시 생성 헬퍼 함수들 ===

// 장치 재질 생성
function createDeviceMaterial(color, emissiveIntensity = 0.4) {
    return new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity,
        specular: 0x888888,
        shininess: 30,
        flatShading: false
    });
}

// 장치 타입별 지오메트리 생성
function createDeviceGeometry(type, label, size) {
    const [w, h, d] = size;

    switch (type) {
        case 'lidar':
            // Center 라벨: 박스형, 나머지: 원기둥형
            return label.includes('Center')
                ? new THREE.BoxGeometry(w, h, d)
                : new THREE.CylinderGeometry(w * 0.6, w * 0.6, h * 0.8, 16);

        case 'camera':
        case 'radar':
        case 'lan9692':
        case 'ecu':
        default:
            return new THREE.BoxGeometry(...size);
    }
}

// 텍스트 라벨 스프라이트 생성
function createLabelSprite(text, size) {
    const [w, h, d] = size;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 75);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));

    const labelScale = Math.max(w, d) * 1.2;
    sprite.scale.set(labelScale, labelScale * 0.25, 1);
    sprite.position.y = h + 1;

    return sprite;
}

// 장치 메시 생성 (메인 함수)
function createDeviceMesh(device, template, customSize = null, tilt = null) {
    const group = new THREE.Group();
    group.userData.device = device;
    group.userData.isDevice = true;

    const size = customSize || template.size;

    // 지오메트리 & 메시 생성
    const geometry = createDeviceGeometry(device.type, device.label, size);
    const material = createDeviceMaterial(template.color, 0.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // 와이어프레임 테두리 (선명하게)
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 5,
            opacity: 1,
            transparent: false
        })
    );
    group.add(wireframe);

    // 라벨
    const sprite = createLabelSprite(device.label, size);
    group.add(sprite);

    // 위치 & 회전
    group.position.copy(device.position);
    if (tilt) {
        if (tilt.x !== undefined) group.rotation.x = tilt.x;
        if (tilt.y !== undefined) group.rotation.y = tilt.y;
        if (tilt.z !== undefined) group.rotation.z = tilt.z;
    }

    device.mesh = group;
    scene.add(group);
}

// 장치 추가
function addDevice(type, position = null, customLabel = null, customSize = null, tilt = null) {
    const template = templates[type];
    if (!template) {
        console.error(`Unknown device type: ${type}`);
        return null;
    }

    const id = `device-${state.deviceCounter++}`;
    const device = {
        id,
        type,
        label: customLabel || `${template.label}-${state.deviceCounter - 1}`,
        position: position || new THREE.Vector3(
            (Math.random() - 0.5) * 40,
            0,
            (Math.random() - 0.5) * 40
        ),
        ports: template.ports,
        mesh: null
    };

    createDeviceMesh(device, template, customSize, tilt);
    state.devices.set(id, device);
    updateStats();
    return device;
}

// 심플 라인 생성 (기본 상태) - Tube로 더 선명하게
function createSimpleLine(from, to, color = 0x3B82F6) {
    const curve = new THREE.LineCurve3(from.clone(), to.clone());
    const tubeGeometry = new THREE.TubeGeometry(curve, 2, 0.05, 8, false);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
    });
    const tube = new THREE.Mesh(tubeGeometry, material);
    return tube;
}

// 빛나는 Tube 연결 생성 (선택 시) - 더 두껍고 선명하게
function createGlowingTube(from, to, color = 0x3B82F6) {
    const curve = new THREE.CatmullRomCurve3([
        from.clone(),
        to.clone()
    ]);

    // Inner glowing tube (더 두껍고 밝게)
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.95
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.castShadow = false;

    // Outer glow halo (더 크고 선명하게)
    const glowGeo = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
    const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.35
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);

    return { tube, glow, curve };
}

// 흐르는 파티클 생성 (선택 시) - 더 크고 밝게
function createFlowParticles(curve, color = 0x00BCD4, count = 3) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const particleGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const particleMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        particle.userData.progress = i / count;
        particle.userData.curve = curve;
        particle.userData.speed = 0.008 + Math.random() * 0.004;
        particle.visible = false; // 기본은 숨김
        particles.push(particle);
        scene.add(particle);
    }
    return particles;
}

// 연결 생성 (기본은 심플 라인)
function createConnection(from, to) {
    // 중복 체크
    const exists = state.connections.some(conn =>
        (conn.from.id === from.id && conn.to.id === to.id) ||
        (conn.from.id === to.id && conn.to.id === from.id)
    );
    if (exists) {
        showToast('Connection already exists');
        return;
    }

    // Priority에 따른 색상 설정 - LAN9692는 금색
    const color = from.type === 'lidar' || to.type === 'lidar' ? 0x10B981 :
                 from.type === 'lan9692' || to.type === 'lan9692' ? 0xFFD700 : 0x3B82F6;

    // 기본: 심플 라인
    const simpleLine = createSimpleLine(from.position, to.position, color);
    scene.add(simpleLine);

    // 선택 시용: Glowing tube + particles (초기 숨김)
    const curve = new THREE.CatmullRomCurve3([from.position.clone(), to.position.clone()]);
    const { tube, glow } = createGlowingTube(from.position, to.position, color);
    const particles = createFlowParticles(curve, color === 0xFFD700 ? 0xFFF4CC : 0x00BCD4, 3);

    tube.visible = false;
    glow.visible = false;
    scene.add(tube);
    scene.add(glow);

    const conn = {
        from,
        to,
        simpleLine,
        tube,
        glow,
        curve,
        particles,
        color,
        highlighted: false
    };
    state.connections.push(conn);
    updateStats();
}

// 연결 업데이트 (드래그 시)
function updateConnections() {
    state.connections.forEach(conn => {
        // Simple line 업데이트 (재생성)
        scene.remove(conn.simpleLine);
        conn.simpleLine = createSimpleLine(conn.from.position, conn.to.position, conn.color);
        conn.simpleLine.visible = !conn.highlighted;
        scene.add(conn.simpleLine);

        // Glowing tube & particles 업데이트
        if (conn.tube) {
            scene.remove(conn.tube);
            scene.remove(conn.glow);
            conn.particles.forEach(p => scene.remove(p));
        }

        const curve = new THREE.CatmullRomCurve3([conn.from.position.clone(), conn.to.position.clone()]);
        const { tube, glow } = createGlowingTube(conn.from.position, conn.to.position, conn.color);
        const particles = createFlowParticles(curve, conn.color === 0xFFD700 ? 0xFFF4CC : 0x00BCD4, 3);

        tube.visible = conn.highlighted;
        glow.visible = conn.highlighted;
        particles.forEach(p => p.visible = conn.highlighted);

        scene.add(tube);
        scene.add(glow);

        conn.tube = tube;
        conn.glow = glow;
        conn.curve = curve;
        conn.particles = particles;
    });
}

// 차량 시나리오 로드 - ROii2: LAN9692 x 3 Zone Controllers Configuration
function loadVehicleScenario() {
    // 기존 장치 및 연결 모두 제거
    state.connections.forEach(conn => {
        if (conn.simpleLine) scene.remove(conn.simpleLine);
        if (conn.tube) scene.remove(conn.tube);
        if (conn.glow) scene.remove(conn.glow);
        if (conn.particles) conn.particles.forEach(p => scene.remove(p));
    });
    state.connections = [];

    state.devices.forEach(device => {
        if (device.mesh) scene.remove(device.mesh);
    });
    state.devices.clear();
    state.deviceCounter = 1;

    // 차량 모델 생성 (없으면)
    if (!vehicleModel) {
        createVehicleModel();
    }

    // === 3x LAN9692 ZONE CONTROLLERS ===
    // Central Gateway (LAN9692) - 중앙
    const centralGW = addDevice('lan9692', new THREE.Vector3(0, 2, 0), 'Central-GW-9692');

    // Front Zone Controller (LAN9692) - 전방
    const frontZC = addDevice('lan9692', new THREE.Vector3(0, 2, 10), 'Front-ZC-9692');

    // Rear Zone Controller (LAN9692) - 후방
    const rearZC = addDevice('lan9692', new THREE.Vector3(0, 2, -10), 'Rear-ZC-9692');

    // === LiDAR 4개 (앞쪽 사이드 원통형 2개 + 앞뒤 박스형 2개) ===
    // 원통형 2개: 앞쪽 좌우 사이드
    const lidarFL = addDevice('lidar', new THREE.Vector3(-8.5, 10, 16.2), 'LiDAR-Front-Left');
    const lidarFR = addDevice('lidar', new THREE.Vector3(8.5, 10, 16.2), 'LiDAR-Front-Right');
    // 박스형 2개: 앞뒤 중앙 (작고 낮게)
    const lidarFrontCenter = addDevice('lidar', new THREE.Vector3(0, 5.5, 18.5), 'LiDAR-Front-Center');
    const lidarRearCenter = addDevice('lidar', new THREE.Vector3(0, 5.5, -18.5), 'LiDAR-Rear-Center');

    // === CAMERA 8개 (전방 3 + 측면 4 + 후방 1) ===
    // Front Cameras (3)
    const camFrontCenter = addDevice('camera', new THREE.Vector3(0, 10.5, 18.5), 'Cam-Front-Center');
    const camFrontL = addDevice('camera', new THREE.Vector3(0.6, 10.5, 18.5), 'Cam-Front-L');
    const camFrontR = addDevice('camera', new THREE.Vector3(-0.6, 10.5, 18.5), 'Cam-Front-R');

    // Side Cameras (2)
    const camSideL1 = addDevice('camera', new THREE.Vector3(-8.5, 11, 16.5), 'Cam-Side-L1', null);
    const camSideR1 = addDevice('camera', new THREE.Vector3(8.5, 11, 16.5), 'Cam-Side-R1', null);
    const camSideL2 = addDevice('camera', new THREE.Vector3(-8.5, 11, 15.9), 'Cam-Side-L2');
    const camSideR2 = addDevice('camera', new THREE.Vector3(8.5, 11, 15.9), 'Cam-Side-R2');

    // Rear Camera (1)
    const camRearCenter = addDevice('camera', new THREE.Vector3(0, 9, -18.5), 'Cam-Rear-Center');

    // === RADAR 5개 (전방 3 + 후방 2) ===
    // Front Radars (3)
    const radarFrontCenter = addDevice('radar', new THREE.Vector3(0, 7, 18.5), 'Radar-Front-Center');
    const radarFrontL = addDevice('radar', new THREE.Vector3(-7, 6.5, 17.5), 'Radar-Front-L', null, { x: 0, y: -Math.PI / 6, z: 0 });
    const radarFrontR = addDevice('radar', new THREE.Vector3(7, 6.5, 17.5), 'Radar-Front-R', null, { x: 0, y: Math.PI / 6, z: 0 });

    // Rear Radars (2)
    const radarRearL = addDevice('radar', new THREE.Vector3(-7, 6.5, -18), 'Radar-Rear-L',null, { x: 0, y: Math.PI / 6, z: 0 });
    const radarRearR = addDevice('radar', new THREE.Vector3(7, 6.5, -18), 'Radar-Rear-R',null, { x: 0, y: -Math.PI / 6, z: 0 });

    // === ADAS ECU ===
    const adasECU = addDevice('ecu', new THREE.Vector3(-3, 2, 3), 'ADAS-ECU');

    // === CONNECTIONS: Front Zone (9692) → Front Sensors ===
    createConnection(frontZC, lidarFL);
    createConnection(frontZC, lidarFR);
    createConnection(frontZC, lidarFrontCenter);
    createConnection(frontZC, camFrontCenter);
    createConnection(frontZC, camSideL1);
    createConnection(frontZC, camSideR1);
    createConnection(frontZC, camFrontL);
    createConnection(frontZC, camFrontR);
    createConnection(frontZC, radarFrontCenter);
    createConnection(frontZC, radarFrontL);
    createConnection(frontZC, radarFrontR);

    // === CONNECTIONS: Rear Zone (9692) → Rear Sensors ===
    createConnection(rearZC, lidarRearCenter);
    createConnection(rearZC, camRearCenter);
    createConnection(rearZC, camSideL2);
    createConnection(rearZC, camSideR2);
    createConnection(rearZC, radarRearL);
    createConnection(rearZC, radarRearR);

    // === CONNECTIONS: Zone Controllers → Central Gateway ===
    createConnection(frontZC, centralGW);
    createConnection(rearZC, centralGW);

    // === CONNECTIONS: ADAS ECU → Central Gateway ===
    createConnection(adasECU, centralGW);

    // 카메라 위치 조정
    camera.position.set(50, 35, 70);
    controls.target.set(0, 0, 0);
    controls.update();

    updateStats();
    showToast('🚗 ROii2: 3x LAN9692 Zone Controllers · 4 LiDAR · 5 Radar · 8 Camera');
}

// 마우스 & 터치 이벤트
renderer.domElement.addEventListener('mousedown', onMouseDown, true);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
renderer.domElement.addEventListener('click', onClick, true);
renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false });

function getDeviceFromIntersection(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            if (obj.userData.device) {
                return obj.userData.device;
            }
            let current = obj.parent;
            while (current) {
                if (current.userData && current.userData.isDevice) {
                    return current.userData.device;
                }
                current = current.parent;
            }
        }
    }
    return null;
}

// 연결 하이라이트/언하이라이트
function highlightConnections(device) {
    state.connections.forEach(conn => {
        const isConnected = conn.from.id === device.id || conn.to.id === device.id;

        if (isConnected) {
            // 선택된 디바이스의 연결: 빛나게
            conn.simpleLine.visible = false;
            conn.tube.visible = true;
            conn.glow.visible = true;
            conn.particles.forEach(p => p.visible = true);
            conn.highlighted = true;
        } else {
            // 다른 연결: 심플 라인만
            conn.simpleLine.visible = true;
            conn.tube.visible = false;
            conn.glow.visible = false;
            conn.particles.forEach(p => p.visible = false);
            conn.highlighted = false;
        }
    });
}

function unhighlightAllConnections() {
    state.connections.forEach(conn => {
        conn.simpleLine.visible = true;
        conn.tube.visible = false;
        conn.glow.visible = false;
        conn.particles.forEach(p => p.visible = false);
        conn.highlighted = false;
    });
}

function selectDevice(device) {
    // 이전 선택 해제
    if (state.selected && state.selected.mesh) {
        state.selected.mesh.traverse(child => {
            if (child.material && child.material.emissive) {
                child.material.emissive.setHex(0x000000);
                child.material.emissiveIntensity = 0;
            }
        });
        unhighlightAllConnections();
    }

    state.selected = device;

    // 새 선택
    if (device && device.mesh) {
        device.mesh.traverse(child => {
            if (child.material && child.material.emissive) {
                child.material.emissive.setHex(0x3B82F6);
                child.material.emissiveIntensity = 0.8;
            }
        });
        highlightConnections(device);
        showProperties(device);
    }
}

function onClick(e) {
    if (e.button !== 0) return;
    if (state.wasDragging) {
        state.wasDragging = false;
        return;
    }

    const device = getDeviceFromIntersection(e.clientX, e.clientY);

    if (device) {
        e.stopPropagation();
        e.preventDefault();

        if (state.mode === 'connect') {
            if (!state.connectingFrom) {
                state.connectingFrom = device;
                selectDevice(device);
                showToast('Click target device to connect');
            } else if (state.connectingFrom.id !== device.id) {
                createConnection(state.connectingFrom, device);
                selectDevice(null);
                state.connectingFrom = null;
                showToast('Connected! Click another device or exit connect mode');
            }
        } else {
            selectDevice(device);
            showToast(`Selected: ${device.label}`);
        }
    } else {
        selectDevice(null);
        document.getElementById('properties').classList.remove('visible');
    }
}

function onMouseDown(e) {
    if (e.button !== 0) return;
    const device = getDeviceFromIntersection(e.clientX, e.clientY);
    if (device && state.mode === 'select') {
        e.stopPropagation();
        e.preventDefault();
        state.draggedDevice = device;
        state.wasDragging = false;
        controls.enabled = false;
    }
}

function onMouseMove(e) {
    if (state.draggedDevice && state.mode === 'select') {
        state.wasDragging = true;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);

        if (intersection) {
            state.draggedDevice.position.copy(intersection);
            state.draggedDevice.mesh.position.copy(intersection);
            updateConnections();
        }
    }
}

function onMouseUp() {
    if (state.draggedDevice) {
        setTimeout(() => {
            state.draggedDevice = null;
        }, 10);
        controls.enabled = true;
    }
}

function onTouchStart(e) {
    if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        state.touchStartTime = Date.now();
        state.isTouchDragging = false;

        const device = getDeviceFromIntersection(touch.clientX, touch.clientY);

        if (device) {
            state.longPressTimer = setTimeout(() => {
                if (!state.isTouchDragging) {
                    if (state.mode === 'select') {
                        state.connectingFrom = device;
                        selectDevice(device);
                        showToast('Touch target device to connect');
                    }
                }
            }, LONG_PRESS_DURATION);

            if (state.mode === 'connect') {
                if (!state.connectingFrom) {
                    state.connectingFrom = device;
                    selectDevice(device);
                    showToast('Touch target device to connect');
                } else if (state.connectingFrom.id !== device.id) {
                    createConnection(state.connectingFrom, device);
                    selectDevice(null);
                    state.connectingFrom = null;
                    showToast('Connected!');
                }
                clearTimeout(state.longPressTimer);
            } else {
                selectDevice(device);
                state.draggedDevice = device;
            }
        } else {
            selectDevice(null);
            document.getElementById('properties').classList.remove('visible');
        }
    }
}

function onTouchMove(e) {
    if (e.touches.length === 1 && state.draggedDevice && state.mode === 'select') {
        e.preventDefault();
        state.isTouchDragging = true;
        clearTimeout(state.longPressTimer);

        const touch = e.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);

        if (intersection) {
            state.draggedDevice.position.copy(intersection);
            state.draggedDevice.mesh.position.copy(intersection);
            updateConnections();
        }
    }
}

function onTouchEnd(e) {
    clearTimeout(state.longPressTimer);
    state.draggedDevice = null;
    state.isTouchDragging = false;
}

// 통계 업데이트
function updateStats() {
    document.getElementById('deviceCount').textContent = state.devices.size;
    document.getElementById('linkCount').textContent = state.connections.length;
    let total = 0;
    state.connections.forEach(() => total += 1);
    document.getElementById('bandwidth').textContent = total;
}

// 토스트
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
}

// 프로퍼티 표시
function showProperties(device) {
    const template = templates[device.type];

    if (!device.portsData) {
        device.portsData = [];
        for (let i = 0; i < template.ports; i++) {
            device.portsData.push({
                num: i,
                enabled: true,
                speed: 1000,
                vlan: 1,
                priority: 0,
                bandwidth: 0
            });
        }
    }

    let portsHTML = '';
    device.portsData.forEach((port, i) => {
        portsHTML += `
            <div class="port-detail-card">
                <div class="port-detail-header">
                    <div class="port-detail-name">Port ${i}</div>
                </div>
                <div class="port-detail-info">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                        <div>
                            <label class="form-label">Speed (Mbps)</label>
                            <input type="number" class="form-input" style="padding: 6px; font-size: 12px;"
                                   value="${port.speed}">
                        </div>
                        <div>
                            <label class="form-label">Priority (0-7)</label>
                            <input type="number" class="form-input" style="padding: 6px; font-size: 12px;"
                                   min="0" max="7" value="${port.priority}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('propertiesContent').innerHTML = `
        <div class="prop-section">
            <div class="prop-title">Device Info</div>
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" value="${device.label}">
            </div>
            <div class="form-group">
                <label class="form-label">Type</label>
                <input type="text" class="form-input" value="${template.label}" readonly>
            </div>
            <div>
                <span class="badge badge-success">Active</span>
                <span class="badge badge-info">${template.ports} Ports</span>
            </div>
        </div>

        <div class="prop-section">
            <div class="prop-title">Port Configuration</div>
            ${portsHTML}
        </div>
    `;
    document.getElementById('properties').classList.add('visible');
}

// 버튼 이벤트 리스너들
function initializeEventListeners() {
    // 장치 카드 클릭 이벤트
    document.querySelectorAll('.device-card[data-type]').forEach(card => {
        card.addEventListener('click', () => {
            addDevice(card.dataset.type);
            showToast(`${card.dataset.type} added`);
        });
    });

    // 선택 모드 버튼
    document.getElementById('selectBtn').addEventListener('click', function() {
        state.mode = 'select';
        state.connectingFrom = null;
        selectDevice(null);
        this.classList.add('active');
        document.getElementById('connectBtn').classList.remove('active');
        showToast('Select Mode: Click to select, drag to move');
    });

    // 연결 모드 버튼
    document.getElementById('connectBtn').addEventListener('click', function() {
        state.mode = 'connect';
        state.connectingFrom = null;
        selectDevice(null);
        this.classList.add('active');
        document.getElementById('selectBtn').classList.remove('active');
        showToast('Connect Mode: Click devices to connect');
    });

    // 자동 회전 버튼
    document.getElementById('rotateBtn').addEventListener('click', function() {
        state.autoRotate = !state.autoRotate;
        controls.autoRotate = state.autoRotate;
        this.classList.toggle('active');
        showToast(state.autoRotate ? 'Auto rotate ON' : 'Auto rotate OFF');
    });

    // 리셋 버튼
    document.getElementById('resetBtn').addEventListener('click', () => {
        camera.position.set(50, 35, 70);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    // 삭제 버튼
    document.getElementById('deleteBtn').addEventListener('click', () => {
        if (state.selected) {
            state.connections = state.connections.filter(conn => {
                if (conn.from.id === state.selected.id || conn.to.id === state.selected.id) {
                    // Remove all connection components
                    if (conn.simpleLine) scene.remove(conn.simpleLine);
                    if (conn.tube) scene.remove(conn.tube);
                    if (conn.glow) scene.remove(conn.glow);
                    if (conn.particles) {
                        conn.particles.forEach(p => scene.remove(p));
                    }
                    return false;
                }
                return true;
            });
            scene.remove(state.selected.mesh);
            state.devices.delete(state.selected.id);
            state.selected = null;
            document.getElementById('properties').classList.remove('visible');
            updateStats();
            showToast('Device deleted');
        }
    });

    // 프로퍼티 패널 닫기 버튼
    document.getElementById('closeBtn').addEventListener('click', () => {
        document.getElementById('properties').classList.remove('visible');
    });

    // 차량 시나리오 로드 버튼
    document.getElementById('vehicleBtn').addEventListener('click', loadVehicleScenario);

    // 자동 레이아웃 버튼
    document.getElementById('layoutBtn').addEventListener('click', () => {
        const devices = Array.from(state.devices.values());
        const switches = devices.filter(d => d.type === 'lan9692');
        const sensors = devices.filter(d => d.type === 'camera' || d.type === 'lidar' || d.type === 'radar');
        const ecus = devices.filter(d => d.type === 'ecu');

        switches.forEach((device, i) => {
            const offset = (i - (switches.length - 1) / 2) * 12;
            device.position.set(offset, 0, 0);
            device.mesh.position.copy(device.position);
        });

        sensors.forEach((device, i) => {
            const angle = Math.PI * 0.75 - (i / Math.max(1, sensors.length - 1)) * Math.PI * 0.5;
            const radius = 25;
            device.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius + 5);
            device.mesh.position.copy(device.position);
        });

        ecus.forEach((device, i) => {
            const offset = (i - (ecus.length - 1) / 2) * 10;
            device.position.set(offset, 0, -20);
            device.mesh.position.copy(device.position);
        });

        updateConnections();
        showToast('Auto layout applied');
    });

    // 내보내기 버튼
    document.getElementById('exportBtn').addEventListener('click', () => {
        const config = {
            timestamp: new Date().toISOString(),
            devices: Array.from(state.devices.values()).map(d => ({
                id: d.id,
                type: d.type,
                label: d.label,
                position: { x: d.position.x, y: d.position.y, z: d.position.z }
            })),
            connections: state.connections.map(c => ({
                from: c.from.id,
                to: c.to.id
            }))
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `roii2-vehicle-tsn-${Date.now()}.json`;
        a.click();
        showToast('Configuration exported');
    });

    // 투명도 슬라이더 이벤트
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');

    opacitySlider.addEventListener('input', function() {
        const opacity = this.value / 100;
        updateVehicleOpacity(opacity);
        opacityValue.textContent = this.value + '%';
    });
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // 파티클 애니메이션 (선택된 연결만)
    state.connections.forEach(conn => {
        if (conn.highlighted && conn.particles && conn.particles.length > 0) {
            conn.particles.forEach(particle => {
                if (particle.visible) {
                    particle.userData.progress += particle.userData.speed;
                    if (particle.userData.progress > 1) {
                        particle.userData.progress = 0;
                    }

                    // 곡선을 따라 파티클 위치 업데이트
                    const point = particle.userData.curve.getPoint(particle.userData.progress);
                    particle.position.copy(point);

                    // Fade in/out effect
                    particle.material.opacity = Math.sin(particle.userData.progress * Math.PI) * 0.9 + 0.1;
                    particle.scale.setScalar(1 + Math.sin(particle.userData.progress * Math.PI * 2) * 0.3);
                }
            });

            // Tube glow pulse (선택된 연결만)
            if (conn.tube && conn.tube.visible && conn.tube.material) {
                conn.tube.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.2;
                conn.glow.material.opacity = 0.15 + Math.sin(Date.now() * 0.003) * 0.1;
            }
        }
    });

    renderer.render(scene, camera);
}

// 초기화 함수
function initialize() {
    // 이벤트 리스너 초기화
    initializeEventListeners();

    // 초기 모드 설정
    document.getElementById('selectBtn').classList.add('active');

    // 차량 시나리오 로드 (약간의 지연 후)
    setTimeout(() => {
        loadVehicleScenario();
    }, 500);

    // 애니메이션 시작
    animate();
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', initialize);
