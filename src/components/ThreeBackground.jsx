import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ isNight = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(
      isNight ? 0x9370db : 0xffe4e1,
      isNight ? 1.2 : 1.8
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      isNight ? 0xffd700 : 0xffa07a,
      isNight ? 1.5 : 2.0
    );
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // 2. 3D Star Geometries (Diamonds / Gems)
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 18 : 42; // cut count on mobile
    const stars = [];
    const starGeo = new THREE.OctahedronGeometry(isMobile ? 0.35 : 0.42, 0); // 3D diamond star
    const starColors = isNight
      ? [0xffd166, 0xff99c8, 0xa9def9, 0xfcf6bd, 0xffffff]
      : [0xffb703, 0xfb8500, 0xf72585, 0x4cc9f0, 0xffeedd];

    for (let i = 0; i < starCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: starColors[i % starColors.length],
        roughness: 0.3,
        metalness: 0.6,
        emissive: starColors[i % starColors.length],
        emissiveIntensity: isNight ? 0.35 : 0.2,
      });

      const starMesh = new THREE.Mesh(starGeo, mat);
      // Keep stars along the perimeter and away from center text column
      const radius = isMobile ? 18 + Math.random() * 12 : 16 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.85;

      starMesh.position.set(
        radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        -10 - Math.random() * 15 // keep strictly in background depth
      );

      const s = 0.5 + Math.random() * 0.9;
      starMesh.scale.set(s, s, s);

      starMesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeed: 0.001 + Math.random() * 0.0015,
        initialY: starMesh.position.y,
        floatOffset: Math.random() * Math.PI * 2,
      };

      mainGroup.add(starMesh);
      stars.push(starMesh);
    }

    // 3. Floating 3D Cloud Clusters
    const clouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0x2d2350 : 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: isNight ? 0.35 : 0.55,
    });

    const createCloudCluster = (x, y, z, scale) => {
      const cluster = new THREE.Group();
      const numPuffs = 5;
      for (let j = 0; j < numPuffs; j++) {
        const puffGeo = new THREE.DodecahedronGeometry(1.4, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (j - numPuffs / 2) * 1.1,
          Math.sin(j) * 0.5,
          (Math.random() - 0.5) * 0.6
        );
        cluster.add(puff);
      }
      cluster.position.set(x, y, z);
      cluster.scale.set(scale, scale * 0.7, scale);
      cluster.userData = {
        driftSpeed: 0.004 + Math.random() * 0.006,
        baseY: y,
      };
      mainGroup.add(cluster);
      clouds.push(cluster);
    };

    createCloudCluster(-16, 7, -10, 1.8);
    createCloudCluster(14, 9, -12, 2.2);
    createCloudCluster(-12, -8, -6, 1.5);
    createCloudCluster(16, -6, -8, 2.0);

    // 4. Mouse parallax interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Resize handler
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation loop
    let animId;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth camera lerp for gentle 3D depth
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 2.5;
      camera.position.y = -targetY * 2;
      camera.lookAt(0, 0, 0);

      // Rotate stars and float
      stars.forEach((star) => {
        star.rotation.x += star.userData.rotSpeedX;
        star.rotation.y += star.userData.rotSpeedY;
        star.position.y =
          star.userData.initialY +
          Math.sin(elapsedTime * 1.5 + star.userData.floatOffset) * 0.6;
      });

      // Drift clouds
      clouds.forEach((cloud) => {
        cloud.position.x += cloud.userData.driftSpeed;
        if (cloud.position.x > 26) {
          cloud.position.x = -26;
        }
        cloud.position.y =
          cloud.userData.baseY + Math.sin(elapsedTime * 0.8 + cloud.position.x) * 0.3;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isNight]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
