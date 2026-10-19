import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../audio/soundEffects';
import { RotateCw, Sparkles, ZoomIn, ZoomOut, RefreshCw, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ThreePipCharacter({
  isNight = true,
  onPipTickle,
  className = '',
}) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isTickling, setIsTickling] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(6.2);
  const [renderNight, setRenderNight] = useState(isNight);

  // References for animation state & Three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const pipGroupRef = useRef(null);
  const headGroupRef = useRef(null);
  const leftEyePupilRef = useRef(null);
  const rightEyePupilRef = useRef(null);
  const bowMeshRef = useRef(null);
  const cloudGroupRef = useRef(null);
  const starParticlesRef = useRef([]);
  const burstParticlesRef = useRef([]);

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0.005 });
  const targetRotationRef = useRef({ x: 0.1, y: -0.2 });
  const currentRotationRef = useRef({ x: 0.1, y: -0.2 });
  const isVisibleRef = useRef(true);

  // Tickle/jump animation state
  const jumpAnimRef = useRef({
    active: false,
    startTime: 0,
    duration: 1000,
  });

  // Sync lighting with theme
  useEffect(() => {
    setRenderNight(isNight);
  }, [isNight]);

  // Handle Tickle Pip
  const triggerTickle = useCallback(() => {
    sound.playBabyGiggle();
    setIsTickling(true);
    setTimeout(() => setIsTickling(false), 900);

    jumpAnimRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 900,
    };

    // Burst 3D star particles inside Three.js
    if (sceneRef.current && pipGroupRef.current) {
      spawn3DStarBurst();
    }

    // HTML confetti as bonus accent
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#ffd166', '#ff99c8', '#a34063'],
      });
    } catch (e) {}

    if (onPipTickle) onPipTickle();
  }, [onPipTickle]);

  // Burst 3D Star particles inside the Three.js scene
  const spawn3DStarBurst = () => {
    if (!sceneRef.current) return;
    const burstGroup = new THREE.Group();
    const starGeo = new THREE.OctahedronGeometry(0.18, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffaa00,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });

    const particles = [];
    for (let i = 0; i < 24; i++) {
      const mesh = new THREE.Mesh(starGeo, starMat);
      mesh.position.set(0, 0.8, 0);
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.04 + Math.random() * 0.08;
      const vy = 0.06 + Math.random() * 0.09;
      particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy,
        vz: Math.sin(angle) * speed,
        life: 1.0,
      });
      burstGroup.add(mesh);
    }

    sceneRef.current.add(burstGroup);
    burstParticlesRef.current.push({ burstGroup, particles, born: performance.now() });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 460;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, zoomLevel);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      renderNight ? 0x9c88ff : 0xffeedd,
      renderNight ? 1.4 : 1.8
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(renderNight ? 0xff99c8 : 0x70d6ff, 1.6);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const warmUnderGlow = new THREE.PointLight(0xffb703, 1.2, 10);
    warmUnderGlow.position.set(0, -1.8, 1.5);
    scene.add(warmUnderGlow);

    // 3. Pip Character Group
    const pipGroup = new THREE.Group();
    scene.add(pipGroup);
    pipGroupRef.current = pipGroup;

    // --- PIP'S HEAD ---
    const headGroup = new THREE.Group();
    pipGroup.add(headGroup);
    headGroupRef.current = headGroup;

    // Cranium Geometry (Baby skull shape: smooth porcelain, wide temple, soft chin)
    const skullMat = new THREE.MeshStandardMaterial({
      color: 0xfbf8f3,
      roughness: 0.38,
      metalness: 0.04,
    });

    const craniumGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const cranium = new THREE.Mesh(craniumGeo, skullMat);
    cranium.scale.set(1.05, 1.08, 0.98);
    cranium.castShadow = true;
    cranium.receiveShadow = true;
    headGroup.add(cranium);

    // Cute chubby cheeks
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xffb5cc,
      roughness: 0.6,
      transparent: true,
      opacity: 0.45,
    });
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), cheekMat);
    leftCheek.position.set(-0.75, -0.32, 0.88);
    leftCheek.scale.set(1.2, 0.8, 0.4);
    headGroup.add(leftCheek);

    const rightCheek = leftCheek.clone();
    rightCheek.position.set(0.75, -0.32, 0.88);
    headGroup.add(rightCheek);

    // Recessed Eye Sockets (Dark soft cavities)
    const socketMat = new THREE.MeshStandardMaterial({
      color: 0x1f1733,
      roughness: 0.9,
    });
    const socketGeo = new THREE.SphereGeometry(0.38, 24, 24);

    const leftSocket = new THREE.Mesh(socketGeo, socketMat);
    leftSocket.position.set(-0.46, 0.05, 0.96);
    leftSocket.scale.set(1.0, 1.15, 0.5);
    headGroup.add(leftSocket);

    const rightSocket = new THREE.Mesh(socketGeo, socketMat);
    rightSocket.position.set(0.46, 0.05, 0.96);
    rightSocket.scale.set(1.0, 1.15, 0.5);
    headGroup.add(rightSocket);

    // Glowing Amber Eye Pinpricks (Tracking Pupils with PointLights!)
    const amberPupilMat = new THREE.MeshStandardMaterial({
      color: 0xffc400,
      emissive: 0xffaa00,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    const pupilGeo = new THREE.SphereGeometry(0.12, 16, 16);

    const leftPupil = new THREE.Mesh(pupilGeo, amberPupilMat);
    leftPupil.position.set(-0.46, 0.05, 1.12);
    headGroup.add(leftPupil);
    leftEyePupilRef.current = leftPupil;

    const leftEyeLight = new THREE.PointLight(0xffb703, 1.5, 3);
    leftEyeLight.position.set(0, 0, 0.1);
    leftPupil.add(leftEyeLight);

    const rightPupil = new THREE.Mesh(pupilGeo, amberPupilMat);
    rightPupil.position.set(0.46, 0.05, 1.12);
    headGroup.add(rightPupil);
    rightEyePupilRef.current = rightPupil;

    const rightEyeLight = new THREE.PointLight(0xffb703, 1.5, 3);
    rightEyeLight.position.set(0, 0, 0.1);
    rightPupil.add(rightEyeLight);

    // Inverted Heart Nose Cavity
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x221a35, roughness: 0.9 });
    const noseGeo = new THREE.ConeGeometry(0.12, 0.18, 16);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.z = Math.PI;
    nose.position.set(0, -0.22, 1.15);
    nose.scale.set(1, 1, 0.3);
    headGroup.add(nose);

    // Gentle Crooked Smile (Torus Arc)
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x251c3a, roughness: 0.8 });
    const mouthGeo = new THREE.TorusGeometry(0.28, 0.035, 12, 24, Math.PI * 0.7);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.z = Math.PI * 1.12; // gentle crooked slant!
    mouth.position.set(0.04, -0.56, 1.08);
    headGroup.add(mouth);

    // --- PIP'S STARRY NIGHTCAP ---
    const nightcapGroup = new THREE.Group();
    headGroup.add(nightcapGroup);

    // Nightcap Brim / Pink Ribbon
    const brimMat = new THREE.MeshStandardMaterial({
      color: 0xff99c8,
      roughness: 0.5,
    });
    const brimGeo = new THREE.TorusGeometry(1.15, 0.14, 16, 40);
    const brim = new THREE.Mesh(brimGeo, brimMat);
    brim.rotation.x = Math.PI * 0.45;
    brim.position.set(0, 0.78, 0.05);
    nightcapGroup.add(brim);

    // Draped Nightcap Cone (Slouchy pointed nightcap)
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x2f2154,
      roughness: 0.65,
    });

    // Segment 1 (Base dome)
    const capBaseGeo = new THREE.CylinderGeometry(0.9, 1.15, 0.8, 32);
    const capBase = new THREE.Mesh(capBaseGeo, capMat);
    capBase.position.set(0.08, 1.25, 0.05);
    capBase.rotation.z = -0.12;
    nightcapGroup.add(capBase);

    // Segment 2 (Mid slouch curve)
    const capMidGeo = new THREE.CylinderGeometry(0.6, 0.9, 0.8, 32);
    const capMid = new THREE.Mesh(capMidGeo, capMat);
    capMid.position.set(0.28, 1.88, -0.05);
    capMid.rotation.z = -0.38;
    nightcapGroup.add(capMid);

    // Segment 3 (Draping tip)
    const capTipGeo = new THREE.ConeGeometry(0.6, 1.1, 32);
    const capTip = new THREE.Mesh(capTipGeo, capMat);
    capTip.position.set(0.72, 2.35, -0.18);
    capTip.rotation.z = -1.25;
    nightcapGroup.add(capTip);

    // Fluffy Star Pompom on Tip
    const starPompomMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffb703,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const pompomGeo = new THREE.OctahedronGeometry(0.26, 0);
    const pompom = new THREE.Mesh(pompomGeo, starPompomMat);
    pompom.position.set(1.22, 2.45, -0.22);
    nightcapGroup.add(pompom);

    // Stud golden decorative stars on the cap fabric
    const capStarMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffd166,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const capStarGeo = new THREE.OctahedronGeometry(0.07, 0);
    const starOffsets = [
      [-0.4, 1.1, 0.85],
      [0.2, 1.2, 0.88],
      [-0.1, 1.5, 0.75],
      [0.4, 1.6, 0.6],
      [-0.5, 1.3, -0.4],
      [0.55, 1.9, 0.25],
    ];
    starOffsets.forEach(([x, y, z]) => {
      const starMesh = new THREE.Mesh(capStarGeo, capStarMat);
      starMesh.position.set(x, y, z);
      nightcapGroup.add(starMesh);
    });

    // Pink Ribbon Bow on the side of the nightcap
    const bowGroup = new THREE.Group();
    const bowMat = new THREE.MeshStandardMaterial({
      color: 0xff70a6,
      roughness: 0.4,
    });
    const bowLoopGeo = new THREE.TorusGeometry(0.18, 0.07, 12, 24);
    const leftLoop = new THREE.Mesh(bowLoopGeo, bowMat);
    leftLoop.rotation.y = Math.PI * 0.3;
    leftLoop.position.set(-0.16, 0, 0);
    bowGroup.add(leftLoop);

    const rightLoop = leftLoop.clone();
    rightLoop.rotation.y = -Math.PI * 0.3;
    rightLoop.position.set(0.16, 0, 0);
    bowGroup.add(rightLoop);

    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), bowMat);
    bowGroup.add(bowKnot);

    bowGroup.position.set(-0.95, 0.95, 0.55);
    bowGroup.scale.set(1.2, 1.2, 1.2);
    nightcapGroup.add(bowGroup);
    bowMeshRef.current = bowGroup;

    // --- SWADDLED CLOUD CRADLE UNDERNEATH ---
    const cloudGroup = new THREE.Group();
    pipGroup.add(cloudGroup);
    cloudGroupRef.current = cloudGroup;

    const cloudPuffMat = new THREE.MeshStandardMaterial({
      color: renderNight ? 0xe9e4f7 : 0xffffff,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92,
    });

    const puffPositions = [
      [0, -1.2, 0, 0.95],
      [-0.8, -1.3, 0.3, 0.7],
      [0.8, -1.3, 0.3, 0.7],
      [-0.5, -1.25, -0.6, 0.65],
      [0.5, -1.25, -0.6, 0.65],
      [0, -1.4, 0.65, 0.6],
    ];

    puffPositions.forEach(([px, py, pz, pscale]) => {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(pscale, 2), cloudPuffMat);
      puff.position.set(px, py, pz);
      cloudGroup.add(puff);
    });

    // --- ORBITING 3D STARDUST RINGS ---
    const starParticles = [];
    const orbitStarGeo = new THREE.OctahedronGeometry(0.12, 0);
    const orbitStarMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    for (let i = 0; i < 18; i++) {
      const star = new THREE.Mesh(orbitStarGeo, orbitStarMat);
      const angle = (i / 18) * Math.PI * 2;
      const radius = 2.1 + (i % 3) * 0.3;
      const height = (Math.sin(i * 1.5) * 0.6) - 0.2;
      star.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      star.userData = {
        baseAngle: angle,
        radius,
        height,
        speed: 0.008 + (i % 2) * 0.004,
      };
      pipGroup.add(star);
      starParticles.push(star);
    }
    starParticlesRef.current = starParticles;

    // --- 4. INTERACTION LISTENERS (Click & Drag in 3D) ---
    const dom = renderer.domElement;

    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      // Mouse eye tracking
      const rect = dom.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (leftEyePupilRef.current && rightEyePupilRef.current) {
        const pupilShiftX = Math.max(Math.min(nx * 0.08, 0.08), -0.08);
        const pupilShiftY = Math.max(Math.min(ny * 0.08, 0.08), -0.08);
        leftEyePupilRef.current.position.x = -0.46 + pupilShiftX;
        leftEyePupilRef.current.position.y = 0.05 + pupilShiftY;
        rightEyePupilRef.current.position.x = 0.46 + pupilShiftX;
        rightEyePupilRef.current.position.y = 0.05 + pupilShiftY;
      }

      if (!isDraggingRef.current) return;

      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      targetRotationRef.current.y += dx * 0.008;
      targetRotationRef.current.x += dy * 0.006;
      // Clamp vertical tilt
      targetRotationRef.current.x = Math.max(
        Math.min(targetRotationRef.current.x, 0.8),
        -0.8
      );
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const newZoom = Math.max(Math.min(camera.position.z + e.deltaY * 0.005, 9.5), 3.8);
      camera.position.z = newZoom;
      setZoomLevel(newZoom);
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Click Raycaster for direct object tickle
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = dom.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(pipGroup.children, true);

      if (intersects.length > 0) {
        triggerTickle();
      }
    };

    dom.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // IntersectionObserver to pause rendering when scrolled out of view (90+ Lighthouse!)
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    });
    observer.observe(container);

    // --- 5. RENDER LOOP ---
    let animId;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Handle jump/tickle physics animation
      if (jumpAnimRef.current.active) {
        const progress = (now - jumpAnimRef.current.startTime) / jumpAnimRef.current.duration;
        if (progress >= 1) {
          jumpAnimRef.current.active = false;
          pipGroup.position.y = 0;
          pipGroup.rotation.z = 0;
        } else {
          // Bouncy backflip/wobble curve
          pipGroup.position.y = Math.sin(progress * Math.PI) * 0.7;
          pipGroup.rotation.z = Math.sin(progress * Math.PI * 2) * 0.25;
          headGroup.rotation.y = Math.sin(progress * Math.PI * 4) * 0.15;
        }
      } else {
        // Idle gentle breathing bob
        pipGroup.position.y = Math.sin(elapsed * 2.0) * 0.08;
      }

      // Auto-rotate if user is not actively dragging
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.006;
      }

      // Smooth inertia damping rotation
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      pipGroup.rotation.x = currentRotationRef.current.x;
      pipGroup.rotation.y = currentRotationRef.current.y;

      // Gentle cloud pulse
      if (cloudGroupRef.current) {
        const cloudScale = 1 + Math.sin(elapsed * 1.5) * 0.02;
        cloudGroupRef.current.scale.set(cloudScale, cloudScale, cloudScale);
      }

      // Bow wiggle
      if (bowMeshRef.current) {
        bowMeshRef.current.rotation.z = Math.sin(elapsed * 3) * 0.08;
      }

      // Orbit stardust particles
      starParticlesRef.current.forEach((star) => {
        star.userData.baseAngle += star.userData.speed;
        star.position.x = Math.cos(star.userData.baseAngle) * star.userData.radius;
        star.position.z = Math.sin(star.userData.baseAngle) * star.userData.radius;
        star.position.y =
          star.userData.height + Math.sin(elapsed * 2 + star.userData.baseAngle) * 0.15;
        star.rotation.x += 0.02;
        star.rotation.y += 0.02;
      });

      // Update 3D Burst Particles
      for (let b = burstParticlesRef.current.length - 1; b >= 0; b--) {
        const burst = burstParticlesRef.current[b];
        const age = (now - burst.born) * 0.001;
        if (age > 1.2) {
          scene.remove(burst.burstGroup);
          burstParticlesRef.current.splice(b, 1);
        } else {
          burst.particles.forEach((p) => {
            p.mesh.position.x += p.vx;
            p.mesh.position.y += p.vy;
            p.mesh.position.z += p.vz;
            p.vy -= 0.002; // gravity
            p.life = Math.max(0, 1 - age / 1.2);
            p.mesh.scale.set(p.life, p.life, p.life);
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [renderNight, autoRotate]);

  // Handle zoom button controls
  const handleZoomChange = (delta) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(Math.min(cameraRef.current.position.z + delta, 9.0), 4.0);
    cameraRef.current.position.z = newZoom;
    setZoomLevel(newZoom);
    sound.playPop();
  };

  const handleResetView = () => {
    sound.playPop();
    targetRotationRef.current = { x: 0.1, y: -0.2 };
    if (cameraRef.current) {
      cameraRef.current.position.z = 6.2;
      setZoomLevel(6.2);
    }
  };

  return (
    <div className={`three-pip-container ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="three-pip-viewport"
        title="Interactive 3D Pip! Drag to rotate 360°, scroll to zoom, click to tickle."
        role="region"
        aria-label="Interactive 3D WebGL Model of Pip the Skull Baby"
      />

      {/* Floating 3D Interaction Control HUD */}
      <div className="three-pip-hud">
        <div className="hud-status-badge">
          <span className="live-pulse-dot" />
          <span>3D WebGL · Rotate 360°</span>
        </div>

        <div className="hud-buttons-row">
          <button
            type="button"
            className={`hud-btn ${autoRotate ? 'hud-btn-active' : ''}`}
            onClick={() => {
              sound.playPop();
              setAutoRotate(!autoRotate);
            }}
            title={autoRotate ? 'Pause 3D auto-spin' : 'Start 3D auto-spin'}
            aria-label="Toggle 3D auto-rotation"
          >
            <RotateCw size={14} className={autoRotate ? 'spin-slow' : ''} />
            <span>{autoRotate ? 'Spinning' : 'Spin'}</span>
          </button>

          <button
            type="button"
            className={`hud-btn hud-btn-tickle ${isTickling ? 'tickle-active' : ''}`}
            onClick={triggerTickle}
            title="Tickle Pip for giggles and 3D star bursts!"
            aria-label="Tickle Pip in 3D"
          >
            <Sparkles size={14} />
            <span>Tickle Pip</span>
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={() => handleZoomChange(-0.8)}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={() => handleZoomChange(0.8)}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={handleResetView}
            title="Reset 3D camera angle"
            aria-label="Reset 3D view"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Helpful Quick Tip Pill */}
      <div className="three-pip-tip">
        <span>🖱️ Drag to rotate 360° · Scroll to zoom · Click Pip to giggle!</span>
      </div>
    </div>
  );
}
