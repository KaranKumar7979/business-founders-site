// ============================================
// BUSINESS FOUNDERS — 3D Background Scene
// Gold wireframe geometry + particle field
// ============================================
import * as THREE from "three";

const canvas = document.getElementById("scene-canvas");
const mode = canvas?.dataset.scene || "ambient"; // "hero" | "ambient"
// Lighter scene on phones: less overdraw, longer battery life
const isSmall = window.innerWidth < 680;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060607, 0.055);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const GOLD = 0xd4af37;
const group = new THREE.Group();
scene.add(group);

// ---------- Central wireframe geometry (hero only) ----------
let centerpiece = null;
let innerCore = null;
if (mode === "hero") {
  centerpiece = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.6, 1),
    new THREE.MeshBasicMaterial({
      color: GOLD,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    })
  );
  group.add(centerpiece);

  innerCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.15, 0),
    new THREE.MeshBasicMaterial({
      color: GOLD,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })
  );
  group.add(innerCore);

  // Orbiting ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.012, 8, 120),
    new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.32,
    })
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);
}

// ---------- Floating accent shapes ----------
const floaters = [];
const floaterGeos = [
  new THREE.TetrahedronGeometry(0.32),
  new THREE.OctahedronGeometry(0.28),
  new THREE.IcosahedronGeometry(0.26, 0),
];
const floaterCount = (mode === "hero" ? 14 : 9) - (isSmall ? 5 : 0);
for (let i = 0; i < floaterCount; i++) {
  const mesh = new THREE.Mesh(
    floaterGeos[i % floaterGeos.length],
    new THREE.MeshBasicMaterial({
      color: GOLD,
      wireframe: true,
      transparent: true,
      opacity: 0.16 + Math.random() * 0.14,
    })
  );
  const radius = 4.5 + Math.random() * 6;
  const angle = Math.random() * Math.PI * 2;
  mesh.position.set(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 8,
    -2 - Math.random() * 8
  );
  mesh.userData = {
    rotSpeed: 0.002 + Math.random() * 0.004,
    floatSpeed: 0.2 + Math.random() * 0.5,
    floatAmp: 0.3 + Math.random() * 0.5,
    baseY: mesh.position.y,
    phase: Math.random() * Math.PI * 2,
  };
  floaters.push(mesh);
  group.add(mesh);
}

// ---------- Particle field ----------
const particleCount = (mode === "hero" ? 900 : 550) * (isSmall ? 0.5 : 1);
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 40;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 26 - 4;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// Soft round sprite so particles don't render as squares
const spriteCanvas = document.createElement("canvas");
spriteCanvas.width = spriteCanvas.height = 64;
const ctx = spriteCanvas.getContext("2d");
const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
grad.addColorStop(0, "rgba(232, 214, 150, 1)");
grad.addColorStop(0.4, "rgba(212, 175, 55, 0.5)");
grad.addColorStop(1, "rgba(212, 175, 55, 0)");
ctx.fillStyle = grad;
ctx.fillRect(0, 0, 64, 64);
const sprite = new THREE.CanvasTexture(spriteCanvas);

const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({
    size: 0.09,
    map: sprite,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
);
scene.add(particles);

// ---------- Mouse parallax ----------
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ---------- Scroll drift ----------
let scrollY = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

// ---------- Resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Animate ----------
const clock = new THREE.Clock();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (!reducedMotion) {
    if (centerpiece) {
      centerpiece.rotation.y = t * 0.12;
      centerpiece.rotation.x = Math.sin(t * 0.18) * 0.25;
    }
    if (innerCore) {
      innerCore.rotation.y = -t * 0.25;
      innerCore.rotation.z = t * 0.15;
    }
    floaters.forEach((f) => {
      f.rotation.x += f.userData.rotSpeed;
      f.rotation.y += f.userData.rotSpeed * 1.4;
      f.position.y =
        f.userData.baseY +
        Math.sin(t * f.userData.floatSpeed + f.userData.phase) * f.userData.floatAmp;
    });
    particles.rotation.y = t * 0.012;
  }

  // Camera parallax follows mouse + gentle scroll pushback
  camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.03;
  camera.position.y += (-mouse.y * 0.6 - scrollY * 0.0012 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}
animate();
