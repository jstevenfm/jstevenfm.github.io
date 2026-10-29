// @ts-nocheck -- ported as-is from the approved prototype; three.js objects are mutated freely here.
// Interactive 3D avatar: follows the pointer, blinks and breathes. The PNG under the canvas is the fallback.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const stages = [...document.querySelectorAll('[data-avatar]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Shared pointer: mouse, pen or finger. After 2.5 s without input the avatar moves on its own.
const pointer = { x: 0, y: 0, last: -Infinity };
function track(x, y) { pointer.x = x; pointer.y = y; pointer.last = performance.now(); }
window.addEventListener('pointermove', (e) => track(e.clientX, e.clientY), { passive: true });
window.addEventListener('pointerdown', (e) => track(e.clientX, e.clientY), { passive: true });
window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) track(t.clientX, t.clientY); }, { passive: true });

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
const norm = (name) => name.replace(/[.\s]/g, '');

// The beard comes from its own GLB that keeps the .blend `density` mask in COLOR_0.
// Alpha follows the .blend shader: clamp((density * 1.15 - noise) * 5 + 0.5).
function beardMaterial() {
  const beard = new THREE.MeshStandardMaterial({ roughness: 0.85, transparent: true, depthWrite: false, vertexColors: true });
  beard.color.setRGB(0.07, 0.042, 0.028);
  beard.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBeardPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBeardPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBeardPos;\nfloat beardHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }\nfloat beardNoise(vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);\n  return mix(mix(mix(beardHash(i), beardHash(i + vec3(1, 0, 0)), f.x), mix(beardHash(i + vec3(0, 1, 0)), beardHash(i + vec3(1, 1, 0)), f.x), f.y),\n             mix(mix(beardHash(i + vec3(0, 0, 1)), beardHash(i + vec3(1, 0, 1)), f.x), mix(beardHash(i + vec3(0, 1, 1)), beardHash(i + vec3(1, 1, 1)), f.x), f.y), f.z); }')
      .replace('#include <color_fragment>', '#include <color_fragment>\nfloat beardDensity = vColor.r;\ndiffuseColor.rgb = diffuse;\nfloat beardN = 0.5 + (beardNoise(vBeardPos * 45.0) - 0.5) * 0.06 + (beardNoise(vBeardPos * 18.0) - 0.5) * 0.04;\ndiffuseColor.a = clamp((beardDensity * 1.15 - beardN) * 5.0 + 0.5, 0.0, 1.0);');
  };
  return beard;
}

function prepareMaterials(scene) {
  const hair = new THREE.MeshStandardMaterial({ roughness: 0.5, envMapIntensity: 0.35 });
  hair.color.setRGB(0.007, 0.006, 0.008);
  const hairBase = new THREE.MeshStandardMaterial({ roughness: 0.8, envMapIntensity: 0.2 });
  hairBase.color.setRGB(0.003, 0.003, 0.003);
  const lens = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.1, depthWrite: false });
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const name = o.material && o.material.name;
    // Skin color ramp from avatar.blend, darkened to compensate for the brighter web lighting.
    if (name === 'Skin') { o.material.color.setRGB(0.56, 0.27, 0.16); o.material.roughness = 0.48; }
    if (name === 'Lens') o.material = lens;
    // The GLB carries the Blender sheen and full reflections, which turn the black hair grey on the web.
    if (name === 'Hair' || name === 'HairBase') o.material = name === 'Hair' ? hair : hairBase;
  });
}

function buildRig(model, skinMaterial) {
  const find = (n) => model.getObjectByName(norm(n)) || model.getObjectByName(n);
  const head = new THREE.Group();
  head.position.set(0, -1.1, 0);
  model.add(head);
  const body = new Set(['Torso', 'Collar', 'Neck']);
  [...model.children].forEach((o) => { if (o !== head && !body.has(o.name)) head.attach(o); });
  // Everything sits on a body pivot near the chest so the torso can turn and breathe with the head.
  const torso = new THREE.Group();
  torso.position.set(0, -3.2, 0);
  model.add(torso);
  [...model.children].forEach((o) => { if (o !== torso) torso.attach(o); });

  const eyes = [];
  for (const side of ['1', '-1']) {
    const eye = find('Eye.' + side);
    const iris = find('Iris.' + side);
    const pupil = find('Pupil.' + side);
    if (!eye || !iris || !pupil) continue;
    const pivot = new THREE.Group();
    pivot.position.copy(eye.position);
    head.add(pivot);
    pivot.attach(iris);
    pivot.attach(pupil);
    const lid = new THREE.Mesh(new THREE.BufferGeometry(), skinMaterial);
    lid.position.copy(eye.position);
    head.add(lid);
    const lash = find('LidUp.' + side);
    const brow = find('Brow.' + side);
    eyes.push({ pivot, lid, lash, lashY: lash ? lash.position.y : 0, brow, browY: brow ? brow.position.y : 0, radius: eye.scale.x * 1.05, theta: -1 });
  }
  return { head, eyes, headY: head.position.y, torso, torsoY: torso.position.y };
}

function setLid(eye, closed) {
  // The lid is a skin-colored cap over the eyeball; its lower edge drops as it closes.
  const theta = THREE.MathUtils.lerp(1.17, 2.1, closed);
  if (Math.abs(theta - eye.theta) < 0.002) return;
  eye.theta = theta;
  eye.lid.geometry.dispose();
  eye.lid.geometry = new THREE.SphereGeometry(eye.radius, 40, 14, 0, Math.PI * 2, 0, theta);
  if (eye.lash) eye.lash.position.y = eye.lashY - closed * 0.12;
}

class Avatar {
  constructor(stage, template, skinMaterial) {
    this.stage = stage;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    stage.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 5, 7);
    const mint = new THREE.DirectionalLight(0x73fbd3, 2.4); mint.position.set(-7, 2, -4);
    const lav = new THREE.DirectionalLight(0x8478f8, 3.0); lav.position.set(7, 0, -4);
    const fill = new THREE.HemisphereLight(0xffffff, 0x27336e, 0.6);
    this.scene.add(key, mint, lav, fill);

    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    // Same crop as avatar.png: hair to just above mid-torso.
    this.camera.position.set(0, -0.6, 11);
    this.camera.lookAt(0, -0.6, 0);

    this.model = template.clone(true);
    this.scene.add(this.model);
    this.rig = buildRig(this.model, skinMaterial);

    this.gaze = { x: 0, y: 0 };
    this.look = { x: 0, y: 0 };
    this.blink = { next: 1.5 + Math.random() * 2, t: -1, double: false };
    this.brow = { next: 3 + Math.random() * 4, t: -1, value: 0 };
    this.visible = true;
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { rootMargin: '120px' }).observe(stage);
    new ResizeObserver(() => this.resize()).observe(stage);
    this.resize();
    stage.classList.add('is-live');
  }

  resize() {
    const w = this.stage.clientWidth, h = this.stage.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  target(t) {
    const idle = performance.now() - pointer.last > 2500;
    if (idle) {
      return {
        x: Math.sin(t * 0.37) * 0.55 + Math.sin(t * 0.11 + 1.3) * 0.3,
        y: Math.sin(t * 0.29 + 0.6) * 0.3
      };
    }
    const r = this.stage.getBoundingClientRect();
    return {
      x: clamp((pointer.x - (r.left + r.width / 2)) / (window.innerWidth * 0.5), -1, 1),
      y: clamp((pointer.y - (r.top + r.height * 0.38)) / (window.innerHeight * 0.5), -1, 1)
    };
  }

  update(dt, t) {
    const { head, eyes, headY, torso, torsoY } = this.rig;
    const goal = this.target(t);
    this.gaze.x = damp(this.gaze.x, goal.x, 10, dt);
    this.gaze.y = damp(this.gaze.y, goal.y, 10, dt);
    this.look.x = damp(this.look.x, goal.x, 3, dt);
    this.look.y = damp(this.look.y, goal.y, 3, dt);

    if (!reduceMotion.matches) {
      torso.rotation.y = this.look.x * 0.12;
      torso.rotation.x = this.look.y * 0.03;
      torso.rotation.z = Math.sin(t * 0.5) * 0.01 - this.look.x * 0.015;
      torso.position.y = torsoY + Math.sin(t * 1.3) * 0.02;
      head.rotation.y = this.look.x * 0.26;
      head.rotation.x = this.look.y * 0.14;
      head.rotation.z = Math.sin(t * 0.6) * 0.02 - this.look.x * 0.02;
      head.position.y = headY + Math.sin(t * 1.3 - 0.4) * 0.008;
    } else {
      torso.rotation.set(0, 0, 0);
      head.rotation.set(0, 0, 0);
    }

    // Blink every few seconds, sometimes twice.
    const b = this.blink;
    b.next -= dt;
    if (b.next <= 0 && b.t < 0) { b.t = 0; b.double = Math.random() < 0.2; }
    let closed = 0;
    if (b.t >= 0) {
      b.t += dt;
      const d = 0.16;
      closed = Math.sin(Math.min(b.t / d, 1) * Math.PI);
      if (b.t >= d) {
        if (b.double) { b.t = 0; b.double = false; }
        else { b.t = -1; b.next = 2.5 + Math.random() * 3.5; }
      }
    }

    // Brows lift when looking up and in short random raises.
    const br = this.brow;
    br.next -= dt;
    if (br.next <= 0 && br.t < 0) br.t = 0;
    let raise = 0;
    if (br.t >= 0) {
      br.t += dt;
      raise = Math.sin(Math.min(br.t / 0.9, 1) * Math.PI);
      if (br.t >= 0.9) { br.t = -1; br.next = 4 + Math.random() * 5; }
    }
    br.value = damp(br.value, Math.max(raise, clamp(-this.gaze.y, 0, 1) * 0.6), 12, dt);

    for (const e of eyes) {
      e.pivot.rotation.y = this.gaze.x * 0.42;
      e.pivot.rotation.x = this.gaze.y * 0.3;
      setLid(e, closed);
      if (e.brow) e.brow.position.y = e.browY + br.value * 0.045;
    }
  }

  render() { this.renderer.render(this.scene, this.camera); }
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

// Both models are meshopt-compressed GLBs.
function loadModel(path) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(path);
}

function replaceBeard(scene, beardScene) {
  let old = null;
  scene.traverse((o) => { if (!old && o.isMesh && o.material && o.material.name === 'BeardFade') old = o; });
  let mesh = null;
  beardScene.traverse((o) => { if (!mesh && o.isMesh) mesh = o; });
  if (!mesh) return;
  if (old) old.removeFromParent();
  scene.updateMatrixWorld(true);
  beardScene.updateMatrixWorld(true);
  scene.attach(mesh);
  mesh.name = 'Beard';
  mesh.material = beardMaterial();
}

export async function start() {
  if (!stages.length || !hasWebGL()) return;
  const [gltf, beardGltf] = await Promise.all([loadModel('/models/avatar.glb'), loadModel('/models/beard.glb')]);
  const template = gltf.scene;
  replaceBeard(template, beardGltf.scene);
  prepareMaterials(template);
  let skinMaterial = null;
  template.traverse((o) => { if (!skinMaterial && o.isMesh && o.material.name === 'Skin') skinMaterial = o.material; });
  const avatars = stages.map((s) => new Avatar(s, template, skinMaterial));

  const t0 = performance.now();
  let last = t0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    const t = (now - t0) / 1000;
    last = now;
    if (!document.hidden) {
      for (const a of avatars) { if (a.visible) { a.update(dt, t); a.render(); } }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
