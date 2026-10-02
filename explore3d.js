// ================= DINO EXPLORER — 3D TRAIL + TIME TUNNEL =================
import * as THREE from 'three';
import { GLTFLoader } from './vendor/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from './vendor/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from './vendor/jsm/utils/BufferGeometryUtils.js';

const APP = () => window.DinoApp;
const KID_H = 1.2; // the explorer is 1.2 m tall, like a 7-year-old
const WK = 2;              // world size: the valleys and the park are twice as wide as the first version
const EDGE = 112 * WK;     // how far from the middle she can walk

// 3D models for each creature. h = rough real standing height (m); fit = how the model is scaled.
// Swap `f` for a realistic model later without touching anything else.
const MODEL_DEFS = {
  // realistic models (Sketchfab) for the favourites
  trex: { f: 'real/trex.glb', kit: 'real', fit: 'len', bright: 1.35 },
  triceratops: { f: 'real/triceratops.glb', kit: 'real', fit: 'len', ride: true, legs: [['Bone001_L_', 0], ['Bone001_R_', Math.PI], ['Bone_L_', Math.PI], ['Bone_R_', 0]] },
  brachiosaurus: { f: 'real/brachiosaurus.glb', kit: 'real', fit: 'h', h: 13, ride: true, seat: 0.45, bright: 2.3, legs: [['FrontUpLegL', 0], ['BackUpLegR', 0], ['FrontUpLegR', Math.PI], ['BackUpLegL', Math.PI], ['FrontLowLegL', 0, 'knee'], ['BackLowLegR', 0, 'knee'], ['FrontLowLegR', Math.PI, 'knee'], ['BackLowLegL', Math.PI, 'knee']] },
  stegosaurus: { f: 'real/stegosaurus.glb', kit: 'real', fit: 'len', ride: true },
  velociraptor: { f: 'real/velociraptor.glb', kit: 'real', fit: 'len' },
  spinosaurus: { seatShift: 0.13, f: 'real/spinosaurus.glb', kit: 'real', fit: 'len', auto: true },
  ankylosaurus: { f: 'real/ankylosaurus.glb', kit: 'real', fit: 'len', ride: true, legs: [['FrontUpLegL', 0], ['BackUpLegR', 0], ['FrontUpLegR', Math.PI], ['BackUpLegL', Math.PI], ['FrontLowLegL', 0, 'knee'], ['BackLowLegR', 0, 'knee'], ['FrontLowLegR', Math.PI, 'knee'], ['BackLowLegL', Math.PI, 'knee']] },
  parasaurolophus: { f: 'real/parasaurolophus.glb', kit: 'real', fit: 'len', ride: true, legs: [['FrontUpLegL', 0], ['BackUpLegR', 0], ['FrontUpLegR', Math.PI], ['BackUpLegL', Math.PI], ['FrontLowLegL', 0, 'knee'], ['BackLowLegR', 0, 'knee'], ['FrontLowLegR', Math.PI, 'knee'], ['BackLowLegL', Math.PI, 'knee']] },
  pteranodon: { f: 'real/pteranodon.glb', kit: 'real', fly: true, span: 6 },
  mosasaurus: { f: 'real/mosasaurus.glb', kit: 'real', swim: true, fit: 'len' },
  allosaurus: { f: 'real/allosaurus.glb', kit: 'real', fit: 'len', legs: [['l_hip', 0], ['r_hip', Math.PI], ['l_knee', 0, 'knee'], ['r_knee', Math.PI, 'knee']] },
  pachycephalosaurus: { seatShift: -0.1, f: 'real/pachycephalosaurus.glb', kit: 'real', fit: 'len' },
  carnotaurus: { f: 'real/carnotaurus.glb', kit: 'real', fit: 'len', auto: true },
  herrerasaurus: { f: 'quaternius/velociraptor.glb', kit: 'q', fit: 'len', tint: [0x7a8c3a, 0x4f5e22] },
  eoraptor: { f: 'real/eoraptor.glb', kit: 'real', fit: 'len' },
  eudimorphodon: { f: 'real/eudimorphodon.glb', kit: 'real', fly: true, span: 1.4 },
  coelophysis: { f: 'quaternius/velociraptor.glb', kit: 'q', fit: 'len', tint: [0xc9a33a, 0x8b6a1f] },
  nothosaurus: { f: 'gobkit/Plesiosaurus.glb', kit: 'gob', swim: true, fit: 'len' },
  // added 27 Sep: the rest of the collection (auto = the game finds and walks the legs itself)
  plateosaurus: { auto: true, f: 'real/plateosaurus.glb', kit: 'real', fit: 'len', ride: true },
  postosuchus: { f: 'real/postosuchus.glb', kit: 'real', fit: 'len', auto: true },
  shonisaurus: { f: 'real/shonisaurus.glb', kit: 'real', swim: true, fit: 'len' },
  diplodocus: { auto: true, f: 'real/diplodocus.glb', kit: 'real', fit: 'len', ride: true },
  brontosaurus: { f: 'real/brontosaurus.glb', kit: 'real', fit: 'len', ride: true, auto: true },
  dilophosaurus: { f: 'real/dilophosaurus.glb', kit: 'real', fit: 'len', auto: true },
  archaeopteryx: { f: 'real/archaeopteryx.glb', kit: 'real', fit: 'len', auto: true },
  compsognathus: { f: 'real/compsognathus.glb', kit: 'real', fit: 'len', auto: true },
  kentrosaurus: { f: 'real/kentrosaurus.glb', kit: 'real', fit: 'len', ride: true, auto: true },
  mamenchisaurus: { f: 'real/mamenchisaurus.glb', kit: 'real', fit: 'len', ride: true, auto: true },
  cryolophosaurus: { f: 'real/cryolophosaurus.glb', kit: 'real', fit: 'len', auto: true },
  megalosaurus: { f: 'real/megalosaurus.glb', kit: 'real', fit: 'len' },
  ichthyosaurus: { f: 'real/ichthyosaurus.glb', kit: 'real', swim: true, fit: 'len' },
  iguanodon: { f: 'real/iguanodon.glb', kit: 'real', fit: 'len', ride: true },
  quetzalcoatlus: { f: 'real/quetzalcoatlus.glb', kit: 'real', fly: true, span: 10 },
  argentinosaurus: { f: 'real/argentinosaurus.glb', kit: 'real', fit: 'len', ride: true, auto: true },
  therizinosaurus: { f: 'real/therizinosaurus.glb', kit: 'real', fit: 'len', ride: true },
  gallimimus: { auto: true, f: 'real/gallimimus.glb', kit: 'real', fit: 'len' },
  // its feet are separate "foot control" bones, so they are stepped by moving them, not by turning the thigh
  giganotosaurus: { f: 'real/giganotosaurus.glb', kit: 'real', fit: 'len', legs: [['Bone_L_', Math.PI], ['Bone_R_', 0], ['footR_', 0, 'foot'], ['FootL_', Math.PI, 'foot']] },
  protoceratops: { f: 'real/protoceratops.glb', kit: 'real', fit: 'len', ride: true, auto: true },
  maiasaura: { auto: true, f: 'real/edmontosaurus.glb', kit: 'real', fit: 'len', ride: true, colour: 0xe8c4a0 },
  styracosaurus: { f: 'real/styracosaurus.glb', kit: 'real', fit: 'len', ride: true },
  microraptor: { f: 'real/microraptor.glb', kit: 'real', fly: true, span: 1.2 },
  edmontosaurus: { auto: true, f: 'real/edmontosaurus.glb', kit: 'real', fit: 'len', ride: true },
  // cute Gobkit models for the rest
  oviraptor: { auto: true, f: 'gobkit/Oviraptor.glb', kit: 'gob', h: 1.5, fit: 'h' },
  rhamphorhynchus: { f: 'gobkit/Pterodactylus.glb', kit: 'gob', fly: true, span: 1.8 },
  plesiosaurus: { f: 'gobkit/Plesiosaurus.glb', kit: 'gob', swim: true, fit: 'len' },
  elasmosaurus: { f: 'gobkit/Plesiosaurus.glb', kit: 'gob', swim: true, fit: 'len' }
};
// any walking creature big enough to carry her can be ridden (sea reptiles and flyers can't)
const RIDE_OK = D => { const d = D.def; if (d.ride === false) return false;
  if (d.fly) return (d.span || 0) * (D.grow || 1) >= 5;          // Pteranodon, Quetzalcoatlus
  if (d.swim) return D.c.len * (D.grow || 1) >= 3.5;              // the bigger sea reptiles
  return Math.max(D.size.x, D.size.z) >= 4.5 && D.size.y >= 1.5; };
const ERA_LOOK = {
  jurassic: { sky: [0x7cc8ff, 0xe6f6ff], fog: 0xcfe9f7, grass: [0x6fae52, 0x4f8f3e], path: 0xc9a86c, trees: ['conifer', 'conifer', 'cycad', 'cycad', 'tallconifer'], ground: ['fern', 'fern', 'fern', 'horsetail'], volcano: false },
  cretaceous: { sky: [0x8fc6f2, 0xfff0dc], fog: 0xe8e4d8, grass: [0x86b85a, 0x5f9442], path: 0xcfae70, trees: ['broadleaf', 'broadleaf', 'conifer', 'palm', 'magnolia'], ground: ['fern', 'flower', 'flower', 'fern', 'bush'], volcano: true },
  triassic: { sky: [0xffc98a, 0xfff0d6], fog: 0xf2d9b8, grass: [0xc9a15e, 0xa77a42], path: 0xe0c090, trees: ['conifer', 'tallconifer', 'conifer'], ground: ['fern', 'rock', 'horsetail'], volcano: true }
};

export function hasTrail(era) { return CREATURES.some(c => c.era === era && MODEL_DEFS[c.id]); }
export function trailIds(era) { return CREATURES.filter(c => c.era === era && MODEL_DEFS[c.id]).map(c => c.id); }

// ---------------- model cache ----------------
const loader = new GLTFLoader();

// Find a dinosaur's legs from its skeleton, whatever the bones are called.
// Feet = the lowest end bones. For each foot, climb up until reaching a bone that is also an ancestor of a
// foot on the OTHER side of the body (the hips, or the chest for front legs): the bone just below it is the thigh.
function findLegs(obj, wrap, size) {
  wrap.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(wrap.matrixWorld).invert();
  const bones = []; obj.traverse(o => { if (o.isBone) bones.push(o); });
  const P = new Map(bones.map(b => [b, new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).applyMatrix4(inv)]));
  const H = size.y, W = Math.max(size.x, 0.1);
  const skip = /ik|pole|target|ctrl|control|null|end$/i;
  const feet = bones.filter(b => !b.children.some(c => c.isBone) && !skip.test(b.name) && P.get(b).y < H * 0.22 && Math.abs(P.get(b).x) > W * 0.02);
  if (feet.length < 2) return [];
  const ancestors = b => { const a = []; let p = b.parent; while (p && p.isBone) { a.push(p); p = p.parent; } return a; };
  const anc = new Map(feet.map(f => [f, ancestors(f)]));
  const thighs = new Map();
  for (const f of feet) {
    const side = Math.sign(P.get(f).x);
    const path = [f, ...anc.get(f)];
    for (let i = 1; i < path.length; i++) {
      const A = path[i];
      const meets = feet.some(g => Math.sign(P.get(g).x) !== side && anc.get(g).includes(A));
      if (meets) { const thigh = path[i - 1], knee = i >= 3 ? path[i - 2] : null; if (thigh !== f && !thighs.has(thigh) && !/root|pelvis|hips?$|spine|body|center/i.test(thigh.name)) thighs.set(thigh, knee); break; }
    }
  }
  const list = [...thighs.entries()];
  if (list.length < 2) return [];
  const zs = list.map(([t]) => P.get(t).z), zMid = (Math.min(...zs) + Math.max(...zs)) / 2, quad = list.length >= 4 && Math.max(...zs) - Math.min(...zs) > size.z * 0.15;
  const out = [];
  for (const [thigh, knee] of list) {
    const p = P.get(thigh), left = p.x > 0, front = p.z > zMid;
    const phase = quad ? ((left === front) ? 0 : Math.PI) : (left ? 0 : Math.PI);
    out.push({ bone: thigh, pre: thigh.name, phase, knee: false, rest: thigh.quaternion.clone() });
    if (knee) out.push({ bone: knee, pre: knee.name, phase, knee: true, rest: knee.quaternion.clone() });
  }
  return out;
}

// Turn a model round if its head points backwards or sideways (models should face +z).
function faceForward(obj) {
  obj.updateMatrixWorld(true);
  let head = null; obj.traverse(o => { if (!head && o.isBone && /head|skull|jaw/i.test(o.name) && !/ik|ctrl/i.test(o.name)) head = o; });
  if (!head) return;
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3());
  const h = new THREE.Vector3().setFromMatrixPosition(head.matrixWorld).sub(c);
  if (Math.abs(h.z) >= Math.abs(h.x)) { if (h.z < 0) obj.rotation.y += Math.PI; }
  else obj.rotation.y += h.x > 0 ? -Math.PI / 2 : Math.PI / 2;
  obj.updateMatrixWorld(true);
}

// a child-sized riding saddle: blanket, leather seat, handle, straps and stirrups
function buildSaddle() {
  const g = new THREE.Group(), M = c => new THREE.MeshLambertMaterial({ color: c });
  const red = M(0xc8313a), gold = M(0xf2c14e), leather = M(0x7a4a26), dark = M(0x4a2c16), metal = M(0xc9c9c9);
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(1.0, 0.035, 1.15), gold, 0, 0.0, 0);
  add(new THREE.BoxGeometry(0.9, 0.05, 1.05), red, 0, 0.03, 0);
  add(new THREE.BoxGeometry(0.52, 0.12, 0.68), leather, 0, 0.11, 0);
  add(new THREE.BoxGeometry(0.5, 0.2, 0.08), leather, 0, 0.2, -0.3);          // back rest
  add(new THREE.CylinderGeometry(0.04, 0.05, 0.24, 8), dark, 0, 0.26, 0.3);  // handle to hold
  add(new THREE.SphereGeometry(0.06, 8, 6), dark, 0, 0.39, 0.3);
  for (const sx of [-1, 1]) {
    const strap = add(new THREE.BoxGeometry(0.06, 1, 0.04), dark, sx * 0.47, -0.45, 0.05); strap.userData.strap = true;
    const st = add(new THREE.TorusGeometry(0.08, 0.02, 6, 12), metal, sx * 0.47, -0.9, 0.05); st.userData.stirrup = true; st.rotation.y = Math.PI / 2;
  }
  return g;
}

// footprint shapes, drawn 1 unit long with the toes pointing forward (-z), lying flat
const footCache = {};
function footGeometry(kind) {
  if (footCache[kind]) return footCache[kind];
  const parts = [];
  const blob = (x, y, rx, ry, rot = 0) => { const sh = new THREE.Shape(); sh.absellipse(x, y, rx, ry, 0, Math.PI * 2, false, rot); parts.push(new THREE.ShapeGeometry(sh, 10)); };
  const toe = (angle, len, w) => {
    const sh = new THREE.Shape(), c = Math.cos(angle), sn = Math.sin(angle), bx = 0, by = 0.22;
    const tip = [bx - sn * len, by + c * len], l = [bx - c * w, by - sn * w], r = [bx + c * w, by + sn * w];
    sh.moveTo(l[0], l[1]); sh.quadraticCurveTo(tip[0] - c * w * 0.6, tip[1] - sn * w * 0.6, tip[0], tip[1]); sh.quadraticCurveTo(tip[0] + c * w * 0.6, tip[1] + sn * w * 0.6, r[0], r[1]); sh.lineTo(l[0], l[1]);
    parts.push(new THREE.ShapeGeometry(sh, 6));
  };
  if (kind === 'three' || kind === 'bird') { blob(0, 0.1, 0.16, 0.14); toe(0, 0.68, 0.075); toe(0.55, 0.52, 0.065); toe(-0.55, 0.52, 0.065); if (kind === 'bird') toe(Math.PI, 0.25, 0.04); }
  else if (kind === 'round') { blob(0, 0.35, 0.34, 0.3); blob(-0.22, 0.72, 0.07, 0.09); blob(0, 0.78, 0.07, 0.09); blob(0.22, 0.72, 0.07, 0.09); }
  else { blob(0, 0.45, 0.14, 0.42); }
  const g = mergeGeometries(parts);
  g.rotateX(-Math.PI / 2);
  return (footCache[kind] = g);
}
const cache = new Map();
const V = '?v=1790901068';   // build stamp: stops Safari reusing an old copy of a model
// iPad mini and other small-memory devices: dinosaur skins are shrunk to half size when they load, and models
// from a trail she has left are let go. (Test override: localStorage 'dinoExplorer.lowmem' = '1' or '0'.)
const LOWMEM = (() => { try { const o = localStorage.getItem('dinoExplorer.lowmem'); if (o) return o === '1';
  return navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 800; } catch (e) { return false; } })();
function shrinkTextures(gltf, max) {
  const done = new Set();
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) for (const k in m) {
      const t = m[k]; if (!t || !t.isTexture || done.has(t.source)) continue; done.add(t.source);
      const im = t.image, w = im && im.width, h = im && im.height;
      if (!w || !h || Math.max(w, h) <= max) continue;
      const f = max / Math.max(w, h), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * f)); c.height = Math.max(1, Math.round(h * f));
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      if (im.close) im.close();   // free the full-size picture straight away
      t.image = c; t.needsUpdate = true;
    }
  });
  return gltf;
}
function loadModel(file) {
  if (!cache.has(file)) {
    const p = loader.loadAsync('assets/' + file + V).then(g => LOWMEM ? shrinkTextures(g, 512) : g);
    p.catch(() => cache.delete(file));   // let a failed model be tried again next time
    cache.set(file, p);
  }
  return cache.get(file);
}
function clipsFor(gltf, kit) {
  const out = {};
  if (kit === 'gob') {
    const base = gltf.animations[0];
    if (base) {
      const fps = 24;
      out.idle = THREE.AnimationUtils.subclip(base, 'idle', 0, 29, fps);
      out.attack = out.roar = THREE.AnimationUtils.subclip(base, 'attack', 30, 59, fps);
      out.walk = THREE.AnimationUtils.subclip(base, 'walk', 90, 119, fps);
      out.fly = base;
    }
  } else if (kit === 'real') {
    const roles = (gltf.parser.json.extras || {}).roles || {};
    const A = gltf.animations;
    for (const [r, i] of Object.entries(roles)) if (A[i]) out[r] = A[i];
    if (!out.walk && A[0]) out.walk = A[0];
    if (out.walk && (!out.idle || out.idle === out.walk)) { out.idle = out.walk.clone(); out.idle.name = 'idle-slow'; out.idleSlow = true; }
    if (out.run === out.walk) delete out.run;
    if (out.roar === out.walk || out.roar === out.idle) delete out.roar;
    if (out.fly === out.walk && !('fly' in roles)) delete out.fly;
  } else {
    for (const a of gltf.animations) {
      const n = a.name.toLowerCase();
      for (const k of ['idle', 'walk', 'run', 'attack', 'jump']) if (n.includes(k) && !out[k]) out[k] = a;
    }
  }
  return out;
}

// ---------------- small helpers ----------------
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function angleLerp(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; }
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }


// Load one creature, measured, scaled to its real size and ready to animate (not yet placed in a world).
async function makeDino(id, R = Math.random) {
  const def = MODEL_DEFS[id], c = BY_ID[id];
  const gltf = await loadModel(def.f).catch(e => { console.warn('model failed', def.f, e); return null; });
  if (!gltf) return null;
  const obj = SkeletonUtils.clone(gltf.scene);
  obj.traverse(o => { if (o.isLine || o.isPoints) o.visible = false; });   // some models ship with wireframe outlines
  obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; for (const m of [].concat(o.material)) { if ('metalness' in m) { m.metalness = 0; m.roughness = Math.max(m.roughness, 0.75); } } } });
  if (def.bright) obj.traverse(o => { if (o.isMesh) { o.material = [].concat(o.material)[0].clone(); o.material.color.multiplyScalar(def.bright); } });
  if (def.tint) { let k = 0; obj.traverse(o => { if (o.isMesh) { o.material = [].concat(o.material)[0].clone(); o.material.color.set(def.tint[k++ % def.tint.length]); } }); }
  const mixer = new THREE.AnimationMixer(obj);
  const clips = clipsFor(gltf, def.kit), actions = {};
  for (const [k, clip] of Object.entries(clips)) if (clip && clip.isAnimationClip !== false && clip.tracks) actions[k] = mixer.clipAction(clip);
  if (clips.idleSlow && actions.idle) actions.idle.timeScale = 0.25;
  const pose = actions[def.fly ? 'fly' : 'idle'] || actions.walk;
  if (pose) { pose.play(); mixer.update(0.01); }
  if (def.kit === 'real') faceForward(obj);
  obj.updateMatrixWorld(true);
  obj.traverse(o => { if (o.isSkinnedMesh) o.skeleton.update(); });
  // hide stray parts stored at the wrong scale (far bigger than, or far away from, the main body), then measure the body
  const meshes = []; obj.traverse(o => { if (o.isMesh) meshes.push(o); });
  const mbox = m => new THREE.Box3().expandByObject(m, true);
  let box;
  const measure = () => {
  if (meshes.length > 1) {
    const main = meshes.reduce((a, b2) => (b2.geometry.attributes.position.count > a.geometry.attributes.position.count ? b2 : a));
    const mb = mbox(main), ms = mb.getSize(new THREE.Vector3()).length(), mc = mb.getCenter(new THREE.Vector3());
    box = mb.clone();
    for (const m of meshes) {
      if (m === main) continue;
      const b2 = mbox(m), sz = b2.getSize(new THREE.Vector3()).length();
      if (!isFinite(sz) || sz > ms * 4 || b2.getCenter(new THREE.Vector3()).distanceTo(mc) > ms * 3) m.visible = false; else box.union(b2);
    }
  } else box = new THREE.Box3().setFromObject(obj, true);
  };
  measure();
  // a walking animal should be longer nose-to-tail (z) than side-to-side (x); if not, it's lying sideways
  { const sz0 = box.getSize(new THREE.Vector3()); if (!def.fly && sz0.x > sz0.z * 1.25) { obj.rotation.y += Math.PI / 2; obj.updateMatrixWorld(true); meshes.forEach(m => { m.visible = true; }); measure(); } }
  const size = box.getSize(new THREE.Vector3());
  if (pose) pose.stop();
  let s;
  if (def.fly) s = def.span / Math.max(size.x, 0.01);
  else if (def.fit === 'len') s = c.len / size.z;
  else if (def.fit === 'mid') s = Math.sqrt((c.len / size.z) * (def.h / size.y));
  else s = def.h / size.y;
  const wrap = new THREE.Group();
  obj.scale.setScalar(s);
  const ctr = box.getCenter(new THREE.Vector3());
  obj.position.set(-ctr.x * s, -box.min.y * s, -ctr.z * s);
  wrap.add(obj);
  const legBones = [];
  if (def.legs) obj.traverse(o => {
    if (!o.isBone) return;
    const n = o.name.replace(/\./g, '');
    const hit = def.legs.find(([pre]) => n.startsWith(pre) && !/IK/i.test(n));
    if (hit && !legBones.some(l => l.pre === hit[0])) legBones.push({ bone: o, pre: hit[0], phase: hit[1], knee: hit[2] === 'knee', foot: hit[2] === 'foot', rest: o.quaternion.clone(), restPos: o.position.clone() });
  });
  if (def.auto && !legBones.length) legBones.push(...findLegs(obj, wrap, size.clone().multiplyScalar(s)));
  if (def.turn) { obj.rotation.y += def.turn; }
  if (def.colour) obj.traverse(o => { if (o.isMesh) { o.material = [].concat(o.material)[0].clone(); o.material.color.multiply(new THREE.Color(def.colour)); } });
  const D = { id, c, def, wrap, obj, mixer, actions, legBones, gait: 0, moveSpeed: 0, cur: null, size: size.clone().multiplyScalar(s), speed: 0, state: 'idle', timer: rand(1, 4), target: new THREE.Vector3(), yaw: R() * 6.28 };
  D.radius = Math.max(D.size.x, D.size.z) * 0.45;
  // invisible, generous tap target
  const hit = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  hit.scale.set(Math.max(D.size.x, 1.5) * 0.7, Math.max(D.size.y, 1.5) * 0.7, Math.max(D.size.z, 1.5) * 0.6);
  hit.position.y = D.size.y * 0.5; hit.userData.dino = D; wrap.add(hit); D.hit = hit;
  return D;
}
// held upright the screen is narrow, so open the view up to see as much around her as in landscape
// Nature and decoration models (Quaternius and others, see assets/props/credits.txt).
// A prop is loaded once, flattened into simple parts (geometry + a light-weight material), stood on the ground and centred.
const PROP_CACHE = {};
function loadProp(name) {
  if (!PROP_CACHE[name]) PROP_CACHE[name] = loadModel('props/' + name + '.glb').then(g => {
    const root = g.scene; root.updateMatrixWorld(true);
    const parts = [];
    root.traverse(o => {
      if (!o.isMesh || o.isSkinnedMesh) return;
      const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) geo.deleteAttribute(k);
      if (!geo.attributes.normal) geo.computeVertexNormals();
      const m0 = [].concat(o.material)[0];
      const mat = new THREE.MeshLambertMaterial({ color: m0.color ? m0.color.clone() : 0xffffff, map: m0.map || null, vertexColors: !!geo.attributes.color,
        transparent: !!m0.transparent, opacity: m0.opacity ?? 1, alphaTest: m0.alphaTest || (m0.map && m0.transparent ? 0.4 : 0), side: m0.side ?? THREE.FrontSide });
      parts.push({ geo, mat });
    });
    const box = new THREE.Box3(); for (const pt of parts) { pt.geo.computeBoundingBox(); box.union(pt.geo.boundingBox); }
    const c = box.getCenter(new THREE.Vector3());
    for (const pt of parts) { pt.geo.translate(-c.x, -box.min.y, -c.z); pt.geo.computeBoundingSphere(); }
    return { parts, size: box.getSize(new THREE.Vector3()), gltf: g };
  });
  return PROP_CACHE[name];
}
// one prop as an object you can place (sized to a height in metres)
async function propObject(name, height, length) {
  const P = await loadProp(name); const g = new THREE.Group();
  for (const pt of P.parts) { const m = new THREE.Mesh(pt.geo, pt.mat); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  g.scale.setScalar(length ? length / Math.max(P.size.x, P.size.z, 0.01) : height / Math.max(P.size.y, 0.01)); return g;
}
// which models make up each kind of scenery, and how tall they are
const SCENERY = {
  conifer: [['pine1', 9], ['pine3', 9.5]], tallconifer: [['pine2', 13]], cycad: [['cycad', 2.8]], palm: [['palm1', 8], ['palm2', 7.5]],
  broadleaf: [['broad1', 7.5], ['broad2', 8], ['broad3', 6]], magnolia: [['broad3', 6], ['flowerbush', 1.3]],
  fern: [['fern', 0.9]], horsetail: [['horsetail', 1.5]], flower: [['flowers1', 0.8], ['flowers2', 0.9]], bush: [['bush', 1.3], ['flowerbush', 1.1]], rock: [['rock1', 1.1], ['rock2', 0.8]]
};
const FAR = { pine1: 'pine1_far', pine2: 'pine2_far', pine3: 'pine3_far', palm1: 'palm1_far', palm2: 'palm2_far', broad1: 'broad1_far', broad2: 'broad2_far', broad3: 'broad2_far', cycad: 'cycad_far' };
const FAR_OK = () => true;
const QKEY = 'dinoExplorer.graphics';   // per device, not per player
function fovFor(aspect) { return aspect >= 1 ? 55 : clamp(55 + (1 - aspect) * 40, 55, 72); }
function playAnim(D, name) {
  const a = D.actions[name] || D.actions.walk || D.actions.idle || D.actions.fly;
  if (!a || D.cur === a) return;
  a.reset().fadeIn(0.3).play();
  if (D.cur) D.cur.fadeOut(0.3);
  D.cur = a;
}

// =====================================================================
//                              THE TRAIL
// =====================================================================
let active = null;
export function stopTrail() { if (active) { active.dispose(); active = null; if (LOWMEM) cache.clear(); } }

export async function startTrail(host, era, opts = {}) {
  stopTrail(); stopPark();
  const world = new Trail(host, era, opts);
  active = world; window.__trail = world;
  await world.init();
  return world;
}

class Trail {
  constructor(host, era, opts) {
    this.host = host; this.era = era; this.opts = opts;
    this.look = ERA_LOOK[era] || ERA_LOOK.jurassic;
    this.R = mulberry(era.length * 7919 + 17);
    this.dinos = []; this.disposed = false; this.riding = null;
    this.input = { x: 0, y: 0 }; this.keys = {}; this.camYaw = 0; this.camPitch = 0; this.zoom = 1; this.moveTarget = null;
    this.stats = { rode: false };
  }

  // ---------- setup ----------
  async init() {
    const host = this.host;
    this.t0 = performance.now();
    host.innerHTML = `
      <div class="t3-loading"><div class="t3-spin">🦕</div><p>${this.loadingText || 'Getting the trail ready…'}</p></div>
      <canvas class="t3-canvas"></canvas>
      <div class="t3-hud">${this.hudHtml()}</div>`;
    this.canvas = host.querySelector('.t3-canvas');
    this.setupRenderer();
    await this.buildWorld();
    if (this.disposed) return;
    if (this.q) this.applyQuality();   // start at this device's remembered graphics level
    host.querySelector('.t3-loading').remove();
    this.loadSecs = ((performance.now() - this.t0) / 1000).toFixed(1);
    this.meter = APP().getSetting && APP().getSetting('meter') ? host.querySelector('.t3-meter') : null;
    if (this.meter) this.meter.classList.remove('hidden');
    this.fpsN = 0; this.fpsT = performance.now();
    this.bindInput();
    this.afterBuild();
    this.clock = new THREE.Clock();
    this.onResize = () => { const w = host.clientWidth, h = host.clientHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.fov = fovFor(w / h); this.camera.updateProjectionMatrix(); };
    // turning the iPad: Safari can report the new size a moment late, so measure again shortly after
    this.onTurn = () => { this.onResize(); clearTimeout(this.turnT); this.turnT = setTimeout(() => { if (!this.disposed) this.onResize(); }, 350); };
    window.addEventListener('resize', this.onTurn); window.addEventListener('orientationchange', this.onTurn);
    // also watch the game's own area, so it always fills the screen after turning the iPad
    if (window.ResizeObserver) { this.ro = new ResizeObserver(() => this.onResize()); this.ro.observe(host); }
    this.onVis = () => { if (!document.hidden) this.clock.getDelta(); };
    document.addEventListener('visibilitychange', this.onVis);
    this.renderer.setAnimationLoop(() => this.tick());
  }
  hudHtml() {
    return `
        <div class="t3-top"><div class="t3-mission"></div><button class="t3-count"></button></div>
        <div class="t3-size hidden"></div>
        <div class="t3-arrow hidden">⬆️</div>
        <div class="t3-joy"><div class="t3-knob"></div></div>
        <div class="t3-fly hidden"><button class="t3-btn up" aria-label="Fly up">⬆️<small>Up</small></button><button class="t3-btn down" aria-label="Fly down">⬇️<small>Down</small></button></div>
        <div class="t3-btns">
          <button class="t3-btn cam" aria-label="Take a photo">📷<small>Photo</small></button>
          <button class="t3-btn track" aria-label="Show tracks">🐾<small>Tracks</small></button>
          <button class="t3-btn run" aria-label="Run">🏃<small>Run</small></button>
          <button class="t3-btn ride hidden" aria-label="Ride">🦕<small>Ride</small></button>
          <button class="t3-btn off hidden" aria-label="Hop off">⬇️<small>Hop off</small></button>
          <button class="t3-btn dive hidden" aria-label="Dive">🌊<small>Dive</small></button>
        </div>
        <div class="t3-flash"></div>
        <div class="t3-meter hidden"></div>`;
  }
  setupRenderer() {
    const host = this.host, W = host.clientWidth, H = host.clientHeight;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, preserveDrawingBuffer: false });
    this.q = clamp(parseInt((() => { try { return localStorage.getItem(QKEY); } catch (e) { return 0; } })(), 10) || 0, 0, 2);
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, [1.75, 1.3, 1][this.q]));
    r.setSize(W, H, false);
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = this.scene = new THREE.Scene();
    sc.fog = new THREE.Fog(this.look.fog, 80, 330);   // far enough to see across the valley from the air
    this.camera = new THREE.PerspectiveCamera(fovFor(W / H), W / H, 0.1, 1100);
    // lights
    sc.add(new THREE.HemisphereLight(0xffffff, 0x6f8f55, 1.6));
    const sun = this.sun = new THREE.DirectionalLight(0xfff2d8, 2.4);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 });
    sun.shadow.bias = -0.0008;
    sc.add(sun, sun.target);
  }
  async buildWorld() {
    this.buildSky(); this.buildPath(); this.planHomes(); this.buildTerrain(); this.buildWater(); await this.buildScenery(); this.buildPlayer();
    this.footprints = [];
    await this.buildDinos();
  }
  afterBuild() { this.updateCount(); this.updateMission(); }

  buildSky() {
    const g = new THREE.SphereGeometry(950, 24, 12);
    const top = new THREE.Color(this.look.sky[0]), bot = new THREE.Color(this.look.sky[1]);
    const cols = [], p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = clamp(p.getY(i) / 300 + 0.15, 0, 1); const c = bot.clone().lerp(top, t); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
    this.sky = new THREE.Mesh(g, m); this.scene.add(this.sky);
    // clouds
    const cm = new THREE.MeshBasicMaterial({ color: 0xf6f9fc, fog: false });   // evenly white, so undersides never look black from the air
    for (let i = 0; i < 14; i++) {
      const cl = new THREE.Group();
      for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(rand(6, 11), 8, 6), cm); s.position.set(k * 9 - 13, rand(-2, 2), rand(-3, 3)); s.scale.y = 0.55; cl.add(s); }
      const a = this.R() * Math.PI * 2, d = rand(380, 700);
      cl.position.set(Math.cos(a) * d, rand(130, 210), Math.sin(a) * d); cl.scale.setScalar(1.8); cl.lookAt(0, cl.position.y, 0);
      this.scene.add(cl);
    }
  }

  // closed loop trail
  buildPath() {
    const pts = [[0, 82], [36, 62], [58, 26], [42, -8], [62, -46], [26, -72], [-14, -62], [-42, -30], [-72, -6], [-58, 36], [-26, 58]];
    this.curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x * WK, 0, z * WK)), true, 'catmullrom', 0.5);
    this.pathPts = this.curve.getSpacedPoints(700);
    this.lake = { x: 6 * WK, z: 2 * WK, r: 52 };   // about six times the water of the first version
  }
  planHomes() {
    const land = trailIds(this.era).filter(id => !MODEL_DEFS[id].fly && !MODEL_DEFS[id].swim);
    this.homes = {};
    land.forEach((id, i) => {
      const big = BY_ID[id].len > 15;
      const t = (((i + 0.5) / land.length + (this.R() - 0.5) * 0.04) % 1 + 1) % 1;
      const p = this.curve.getPointAt(t), tan = this.curve.getTangentAt(t);
      let side = i % 2 ? 1 : -1; const off = big ? 36 + this.R() * 14 : 16 + this.R() * 14;
      let hx = p.x + tan.z * off * side, hz = p.z - tan.x * off * side;
      if (Math.hypot(hx - this.lake.x, hz - this.lake.z) < this.lake.r + 10 || Math.hypot(hx, hz) > EDGE - 20) { hx = p.x - tan.z * off * side; hz = p.z + tan.x * off * side; }
      this.homes[id] = { x: hx, z: hz, r: big ? 26 : 14 };
    });
  }
  pathDist(x, z) {
    let best = 1e9;
    for (let i = 0; i < this.pathPts.length; i += 2) { const p = this.pathPts[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < best) best = d; }
    return Math.sqrt(best);
  }
  rawHeight(x, z) {
    let h = 1.3 * Math.sin(x * 0.045) * Math.cos(z * 0.04) + 0.7 * Math.sin(x * 0.12 + z * 0.08) + 0.4 * Math.cos(z * 0.17 - x * 0.05);
    const d = Math.hypot(x, z);
    if (d > EDGE - 17) h += (d - (EDGE - 17)) * 0.45;
    const pd = this.pathDist(x, z);
    const f = clamp((pd - 2.5) / 8, 0, 1);
    h = lerp(h * 0.25, h, f);
    const ld = Math.hypot(x - this.lake.x, z - this.lake.z);
    if (ld < this.lake.r + 6) h = lerp(h, -3.2, clamp(1 - (ld - this.lake.r * 0.35) / (this.lake.r * 0.65 + 6), 0, 1));
    return h;
  }
  buildTerrain() {
    const S = 300 * WK, N = 170;
    const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, cols = [];
    const gA = new THREE.Color(this.look.grass[0]), gB = new THREE.Color(this.look.grass[1]), pc = new THREE.Color(this.look.path), sand = new THREE.Color(0xd8c89a), rock = new THREE.Color(0x8a8278);
    this.hgrid = new Float32Array((N + 1) * (N + 1)); this.gS = S; this.gN = N;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = this.rawHeight(x, z);
      p.setY(i, h); this.hgrid[i] = h;
      const pd = this.pathDist(x, z), ld = Math.hypot(x - this.lake.x, z - this.lake.z);
      let c = gA.clone().lerp(gB, (Math.sin(x * 0.3) * Math.cos(z * 0.27) + 1) / 2 * 0.8 + this.R() * 0.2);
      if (h > 10) c.lerp(rock, clamp((h - 10) / 10, 0, 1));
      if (ld < this.lake.r + 3) c.lerp(sand, clamp(1 - (ld - this.lake.r) / 3, 0, 1));
      if (pd < 3.2) c.lerp(pc, clamp((3.2 - pd) / 1.2, 0, 1));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    this.terrain = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
    // far mountains
    const mm = new THREE.MeshLambertMaterial({ color: 0x7d8f86, flatShading: true });
    for (let i = 0; i < 34; i++) {
      const a = i / 34 * Math.PI * 2 + this.R() * 0.2, d = rand(350, 430), hh = rand(55, 130);
      const m = new THREE.Mesh(new THREE.ConeGeometry(rand(45, 85), hh, 7), mm);
      m.position.set(Math.cos(a) * d, hh / 2 - 4, Math.sin(a) * d); this.scene.add(m);
    }
    if (this.look.volcano) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(18, 84, 120, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x6b5a50, flatShading: true }));
      v.position.set(-300, 52, -240); this.scene.add(v);
      const lava = new THREE.Mesh(new THREE.CircleGeometry(18, 12), new THREE.MeshBasicMaterial({ color: 0xff5a1f, fog: false }));
      lava.rotation.x = -Math.PI / 2; lava.position.set(-300, 111.5, -240); this.scene.add(lava);
      this.smoke = [];
      const sm = new THREE.MeshLambertMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.6, fog: false });
      for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(12, 8, 6), sm); s.userData.t = i / 8; this.smoke.push(s); this.scene.add(s); }
    }
  }
  heightAt(x, z) {
    const S = this.gS, N = this.gN, fx = (x + S / 2) / S * N, fz = (z + S / 2) / S * N;
    const ix = clamp(Math.floor(fx), 0, N - 1), iz = clamp(Math.floor(fz), 0, N - 1), tx = clamp(fx - ix, 0, 1), tz = clamp(fz - iz, 0, 1);
    const g = this.hgrid, a = g[iz * (N + 1) + ix], b = g[iz * (N + 1) + ix + 1], c = g[(iz + 1) * (N + 1) + ix], d = g[(iz + 1) * (N + 1) + ix + 1];
    return lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
  }
  buildWater() {
    const w = new THREE.Mesh(new THREE.CircleGeometry(this.lake.r + 2, 40), new THREE.MeshPhongMaterial({ color: 0x3d9fd6, transparent: true, opacity: 0.82, shininess: 90 }));
    w.rotation.x = -Math.PI / 2; w.position.set(this.lake.x, -0.35, this.lake.z); this.water = w; this.scene.add(w);
  }

  // vegetation with instancing
  async buildScenery() {
    const R = this.R, trees = [], ground = [];
    const clear = (x, z, k) => Object.values(this.homes).every(h => Math.hypot(x - h.x, z - h.z) > h.r * k);
    const okSpot = (x, z, pathMin, lakeMin, k = 0) => this.pathDist(x, z) > pathMin && Math.hypot(x - this.lake.x, z - this.lake.z) > this.lake.r + lakeMin && Math.hypot(x, z) < EDGE + 6 && (!k || clear(x, z, k)) && !(this.blocked && this.blocked(x, z, k > 0));
    for (let i = 0; i < 4000 && trees.length < 420; i++) { const x = rand(-EDGE - 8, EDGE + 8), z = rand(-EDGE - 8, EDGE + 8); if (okSpot(x, z, 5, 4, 1.35)) trees.push([x, z, this.look.trees[Math.floor(R() * this.look.trees.length)], rand(0.75, 1.35), R() * 6.28]); }
    for (let i = 0; i < 9000 && ground.length < 1100; i++) { const x = rand(-EDGE - 3, EDGE + 3), z = rand(-EDGE - 3, EDGE + 3); if (okSpot(x, z, 2.4, 1)) ground.push([x, z, this.look.ground[Math.floor(R() * this.look.ground.length)], rand(0.6, 1.3), R() * 6.28]); }
    this.treeSpots = trees;
    const parts = {
      conifer: [[new THREE.CylinderGeometry(0.25, 0.35, 3, 6), 0x6b4a2e, 1.5], [new THREE.ConeGeometry(2.3, 6, 7), 0x2f6b3a, 5.5]],
      tallconifer: [[new THREE.CylinderGeometry(0.3, 0.45, 6, 6), 0x6b4a2e, 3], [new THREE.ConeGeometry(2.6, 10, 7), 0x285c34, 10]],
      cycad: [[new THREE.CylinderGeometry(0.35, 0.45, 2.2, 6), 0x7a6040, 1.1], [new THREE.ConeGeometry(2.4, 1.4, 8, 1, true), 0x4f8a3a, 2.6]],
      palm: [[new THREE.CylinderGeometry(0.22, 0.32, 5.5, 6), 0x8a6a45, 2.75], [new THREE.ConeGeometry(3, 1.4, 7, 1, true), 0x4a9a44, 5.8]],
      broadleaf: [[new THREE.CylinderGeometry(0.3, 0.45, 3.5, 6), 0x6b4a2e, 1.75], [new THREE.IcosahedronGeometry(2.8, 0), 0x4f9a45, 5]],
      magnolia: [[new THREE.CylinderGeometry(0.25, 0.4, 3, 6), 0x6b4a2e, 1.5], [new THREE.IcosahedronGeometry(2.4, 0), 0x5aa14c, 4.2], [new THREE.IcosahedronGeometry(0.45, 0), 0xf6d3e0, 4.9, 'dots']],
      fern: [[new THREE.ConeGeometry(0.9, 0.8, 6, 1, true), 0x3f8f3a, 0.35]],
      horsetail: [[new THREE.CylinderGeometry(0.06, 0.08, 1.4, 4), 0x5f8a3a, 0.7]],
      flower: [[new THREE.ConeGeometry(0.5, 0.5, 5), 0x4f9a45, 0.2], [new THREE.IcosahedronGeometry(0.18, 0), 0xf28cb3, 0.5]],
      bush: [[new THREE.IcosahedronGeometry(0.9, 0), 0x4a8a3c, 0.6]],
      rock: [[new THREE.DodecahedronGeometry(0.8, 0), 0x8a8580, 0.3]]
    };
    const place = (list, isTree) => {
      const byType = {};
      for (const t of list) (byType[t[2]] = byType[t[2]] || []).push(t);
      for (const [type, arr] of Object.entries(byType)) {
        for (const [geo, color, yOff, mode] of parts[type]) {
          const count = mode === 'dots' ? arr.length * 4 : arr.length;
          const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color, flatShading: true }), count);
          mesh.castShadow = isTree; mesh.receiveShadow = !isTree;
          const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
          let k = 0;
          for (const [x, z, , sc, rot] of arr) {
            const y = this.heightAt(x, z);
            const reps = mode === 'dots' ? 4 : 1;
            for (let r = 0; r < reps; r++) {
              const ox = mode === 'dots' ? Math.cos(r * 1.7) * 1.8 * sc : 0, oz = mode === 'dots' ? Math.sin(r * 1.7) * 1.8 * sc : 0;
              q.setFromEuler(new THREE.Euler(0, rot + r, 0)); s.setScalar(sc); pos.set(x + ox, y + yOff * sc, z + oz);
              m.compose(pos, q, s); mesh.setMatrixAt(k++, m);
            }
          }
          this.scene.add(mesh);
        }
      }
    };
    // real nature models, grouped into patches of land so the iPad only draws the patches she can see
    try { await this.placeProps(trees, true); await this.placeProps(ground, false); }
    catch (e) { console.warn('nature models failed, using simple shapes', e); place(trees, true); place(ground, false); }
  }
  async placeProps(list, isTree) {
    const CH = 70, chunks = this.chunks || (this.chunks = []), groups = new Map(), R = this.R;
    for (const t of list) {
      const opts = SCENERY[t[2]] || SCENERY.bush, [name, h] = opts[Math.floor(R() * opts.length)];
      const cx = Math.floor(t[0] / CH), cz = Math.floor(t[1] / CH), key = name + '|' + h + '|' + cx + '|' + cz;
      (groups.get(key) || groups.set(key, { name, h, cx, cz, items: [] }).get(key)).items.push(t);
    }
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pos = new THREE.Vector3();
    for (const gr of groups.values()) {
      const P = await loadProp(gr.name), base = gr.h / Math.max(P.size.y, 0.01);
      const centre = new THREE.Vector3((gr.cx + 0.5) * CH, 0, (gr.cz + 0.5) * CH);
      for (const pt of P.parts) {
        const mesh = new THREE.InstancedMesh(pt.geo, pt.mat, gr.items.length);
        gr.items.forEach(([x, z, , sc, rot], k) => {
          q.setFromEuler(new THREE.Euler(0, rot, 0)); sv.setScalar(base * sc); pos.set(x, this.heightAt(x, z) - 0.05, z);
          m.compose(pos, q, sv); mesh.setMatrixAt(k, m);
        });
        mesh.castShadow = isTree; mesh.receiveShadow = !isTree; mesh.computeBoundingSphere();
        mesh.userData.centre = centre; mesh.userData.lod = isTree ? 'near' : 'ground'; this.scene.add(mesh); chunks.push(mesh);
      }
      // far away, trees swap to a much simpler copy of themselves
      if (isTree && FAR[gr.name]) {
        const F = await loadProp(FAR[gr.name]), fb = gr.h / Math.max(F.size.y, 0.01);
        for (const pt of F.parts) {
          const mesh = new THREE.InstancedMesh(pt.geo, pt.mat, gr.items.length);
          gr.items.forEach(([x, z, , sc, rot], k) => { q.setFromEuler(new THREE.Euler(0, rot, 0)); sv.setScalar(fb * sc); pos.set(x, this.heightAt(x, z) - 0.05, z); m.compose(pos, q, sv); mesh.setMatrixAt(k, m); });
          mesh.castShadow = false; mesh.computeBoundingSphere(); mesh.userData.centre = centre; mesh.userData.lod = 'far'; this.scene.add(mesh); chunks.push(mesh);
        }
      }
    }
  }

  buildPlayer() {
    const g = new THREE.Group();
    const mat = c => new THREE.MeshLambertMaterial({ color: c });
    const skin = mat(0xf1c7a3), khaki = mat(0xf28cb3), shorts = mat(0x5a6fb0), boot = mat(0x7a4a2a), hat = mat(0xe6cf94), pack = mat(0x8a5ad1), hair = mat(0x4a2c1a), skirt = mat(0xf6b3cf);
    const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; return b; };
    this.legL = new THREE.Group(); this.legL.position.set(-0.1, 0.52, 0); this.legL.add(box(0.13, 0.42, 0.14, shorts, 0, -0.2, 0), box(0.14, 0.12, 0.2, boot, 0, -0.46, 0.03));
    this.legR = new THREE.Group(); this.legR.position.set(0.1, 0.52, 0); this.legR.add(box(0.13, 0.42, 0.14, shorts, 0, -0.2, 0), box(0.14, 0.12, 0.2, boot, 0, -0.46, 0.03));
    g.add(this.legL, this.legR, box(0.36, 0.4, 0.22, khaki, 0, 0.72, 0), box(0.3, 0.32, 0.12, pack, 0, 0.74, -0.16));
    this.armL = new THREE.Group(); this.armL.position.set(-0.23, 0.9, 0); this.armL.add(box(0.1, 0.36, 0.1, skin, 0, -0.17, 0));
    this.armR = new THREE.Group(); this.armR.position.set(0.23, 0.9, 0); this.armR.add(box(0.1, 0.36, 0.1, skin, 0, -0.17, 0));
    g.add(this.armL, this.armR);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), skin); head.position.y = 1.04; head.castShadow = true; g.add(head);
    // hair: a cap at the back of the head plus two pigtails with bobbles
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.182, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
    cap.position.set(0, 1.05, -0.02); cap.rotation.x = -0.5; g.add(cap);
    for (const sx of [-1, 1]) {
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.28, 8), hair);
      tail.position.set(sx * 0.19, 0.92, -0.06); tail.rotation.z = sx * 0.35; tail.castShadow = true;
      const bob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat(0xffd84a));
      bob.position.set(sx * 0.175, 1.05, -0.06);
      g.add(tail, bob);
    }
    // skirt over leggings
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.26, 0.2, 12), skirt); sk.position.y = 0.5; sk.castShadow = true; g.add(sk);
    // little smile
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 4, 8, Math.PI), mat(0xb5485a)); smile.position.set(0, 1.0, 0.165); smile.rotation.z = Math.PI; g.add(smile);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16), hat); brim.position.y = 1.15;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.14, 16), hat); crown.position.y = 1.23;
    const eyeM = mat(0x222222);
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeM); e1.position.set(-0.06, 1.06, 0.155);
    const e2 = e1.clone(); e2.position.x = 0.06;
    g.add(brim, crown, e1, e2);
    const start = this.curve.getPointAt(0);
    g.position.set(start.x, this.heightAt(start.x, start.z), start.z);
    const ahead = this.curve.getPointAt(0.01);
    g.rotation.y = Math.atan2(ahead.x - start.x, ahead.z - start.z);
    this.camYaw = g.rotation.y + Math.PI;
    this.player = g; this.walkT = 0;
    this.scene.add(g);
  }

  async buildDinos() {
    const ids = trailIds(this.era), n = ids.length;
    const R = this.R;
    const land = ids.filter(id => !MODEL_DEFS[id].fly && !MODEL_DEFS[id].swim);
    let li = 0;
    const loads = ids.map(async id => {
      const D = await makeDino(id, R); if (!D) return;   // one broken model should not stop the whole trail
      const def = D.def;
      // home
      if (def.swim) { D.home = new THREE.Vector3(this.lake.x, 0, this.lake.z); D.range = this.lake.r - 5; }
      else if (def.fly) { const small = (def.span || 5) < 3;   // little flyers stay lower and closer, so she can see them
        D.home = new THREE.Vector3(this.lake.x + rand(-20, 20), 0, this.lake.z + rand(-20, 20)); D.range = small ? rand(30, 50) : rand(45, 85); D.alt = small ? rand(9, 14) : rand(18, 32); D.ang = R() * 6.28; D.dir = R() < 0.5 ? 1 : -1;
        D.visitT = APP().isFound(id) ? rand(60, 120) : rand(12, 25); }
      else { const h = this.homes[id]; D.home = new THREE.Vector3(h.x, 0, h.z); D.range = h.r * 0.75; }
      D.wrap.position.copy(D.home);
      if (def.fly) D.wrap.position.y = D.alt; else if (def.swim) D.wrap.position.y = -0.9 - D.size.y * 0.35; else D.wrap.position.y = this.heightAt(D.home.x, D.home.z);
      this.play(D, def.fly ? 'fly' : 'idle');
      if (def.fly && D.actions.fly) D.actions.fly.timeScale = 1.4;
      this.scene.add(D.wrap);
      this.dinos.push(D);
    });
    await Promise.all(loads);
  }
  play(D, name) { playAnim(D, name); }


  // ---------- input ----------
  bindInput() {
    const host = this.host, joy = host.querySelector('.t3-joy'), knob = host.querySelector('.t3-knob');
    let jid = null, jc = null;
    const jmove = (x, y) => {
      const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, max = r.width / 2;
      let dx = x - cx, dy = y - cy; const d = Math.hypot(dx, dy); if (d > max) { dx *= max / d; dy *= max / d; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      this.input.x = dx / max; this.input.y = dy / max; this.moveTarget = null;
    };
    joy.addEventListener('pointerdown', e => { jid = e.pointerId; try { joy.setPointerCapture(jid); } catch (err) { /* ignore */ } jmove(e.clientX, e.clientY); e.preventDefault(); });
    joy.addEventListener('pointermove', e => { if (e.pointerId === jid) jmove(e.clientX, e.clientY); });
    const jend = e => { if (e.pointerId !== jid) return; jid = null; knob.style.transform = ''; this.input.x = this.input.y = 0; };
    joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);
    // drag canvas to look around, tap to walk / photograph
    // one finger: drag left/right to turn, up/down to tilt the camera. Two fingers: pinch to zoom.
    const cv = this.canvas, pts = new Map(); let drag = null, pinch = null;
    cv.addEventListener('pointerdown', e => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* not a real pointer */ }
      if (pts.size === 1) drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() };
      else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: this.zoom }; drag = null; }
    });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size >= 2) { const [a, b] = [...pts.values()]; this.zoom = clamp(pinch.z * pinch.d / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), 0.5, 2.6); return; }
      if (!drag || e.pointerId !== drag.id) return;
      this.camYaw -= (e.clientX - drag.x) * 0.006;
      this.camPitch = clamp(this.camPitch + (e.clientY - drag.y) * 0.004, -0.75, 0.85);
      drag.x = e.clientX; drag.y = e.clientY;
    });
    const up = e => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (!drag || e.pointerId !== drag.id) return;
      const moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy), dt = performance.now() - drag.t; drag = null;
      if (moved < 10 && dt < 500) this.tap(e.clientX, e.clientY);
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); this.zoom = clamp(this.zoom * (1 + e.deltaY * 0.001), 0.5, 2.6); }, { passive: false });
    this.onKey = e => { this.keys[e.key.toLowerCase()] = e.type === 'keydown'; };
    window.addEventListener('keydown', this.onKey); window.addEventListener('keyup', this.onKey);
    host.querySelector('.cam').onclick = () => this.snap(this.bestInView());
    const trk = host.querySelector('.track'); if (trk) trk.onclick = () => this.showTracks();
    host.querySelector('.t3-count').onclick = () => {
      const all = CREATURES.filter(c => c.era === this.era), ids = trailIds(this.era);
      const fa = all.filter(c => APP().isFound(c.id)).length, name = { triassic: 'Triassic', jurassic: 'Jurassic', cretaceous: 'Cretaceous' }[this.era];
      APP().toast(`📷 ${ids.filter(id => APP().isFound(id)).length} of ${ids.length} creatures on this trail. You've met ${fa} of all ${all.length} ${name} creatures. The other ${all.length - ids.length} live in the 🗺️ map view!`, 5000);
    };
    const runBtn = host.querySelector('.run');
    runBtn.onclick = () => { this.running = !this.running; runBtn.classList.toggle('on', this.running); runBtn.innerHTML = this.running ? '🚶<small>Walk</small>' : '🏃<small>Run</small>'; APP().sfx('pop'); };
    host.querySelector('.ride').onclick = () => this.startRide();
    host.querySelector('.off').onclick = () => this.stopRide();
    for (const [cls, key] of [['.up', 'up'], ['.down', 'down']]) {
      const b = host.querySelector(cls); if (!b) continue;
      const on = e => { this.keys[key] = true; e.preventDefault(); }, off = () => { this.keys[key] = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
    }
    const dv = host.querySelector('.dive');
    if (dv) dv.onclick = () => { const R = this.riding; if (R && R.def.swim && !R.dive && !R.toShore) { R.dive = 1.8; APP().sfx('splash'); this.splash(R.wrap.position, 16); } };
  }
  tap(x, y) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(v, this.camera);
    const hits = ray.intersectObjects(this.dinos.map(d => d.hit), false);
    if (hits.length) { this.snap(hits[0].object.userData.dino); return; }
    if (this.riding) return;
    const th = ray.intersectObject(this.terrain, false);
    if (th.length) { const p = th[0].point; if (Math.hypot(p.x, p.z) < EDGE) this.moveTarget = p.clone(); }
  }

  // ---------- photos & discovery ----------
  bestInView() {
    const cam = this.camera, best = { d: null, score: 1e9 };
    const frus = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    for (const D of this.dinos) {
      const c = D.wrap.position.clone(); c.y += D.size.y * 0.5;
      const dist = c.distanceTo(this.player.position);
      if (dist > 55 || !frus.containsPoint(c)) continue;
      const ndc = c.clone().project(cam);
      const score = Math.hypot(ndc.x, ndc.y) * 30 + dist * (APP().isFound(D.id) ? 1.5 : 1);
      if (score < best.score) { best.score = score; best.d = D; }
    }
    return best.d;
  }
  snap(D) {
    const flash = this.host.querySelector('.t3-flash');
    APP().sfx('pop');
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    if (!D) { APP().toast('📷 No dinosaur in the picture. Walk closer, or turn to face one!'); return; }
    const dist = D.wrap.position.distanceTo(this.player.position);
    if (dist > 55) { APP().toast('📷 Too far away! Walk closer to take a good photo.'); return; }
    // photo thumbnail
    this.renderer.render(this.scene, this.camera);
    let photo = null;
    try {
      const c = document.createElement('canvas'); c.width = 320; c.height = 200;
      const src = this.renderer.domElement, sw = src.width, sh = src.height, a = 320 / 200;
      let w = sw, h = sw / a; if (h > sh) { h = sh; w = sh * a; }
      c.getContext('2d').drawImage(src, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, 320, 200);
      photo = c.toDataURL('image/jpeg', 0.62);
    } catch (e) { /* ignore */ }
    this.play(D, D.actions.roar ? 'roar' : 'attack'); setTimeout(() => { if (!this.disposed) this.play(D, D.def.fly ? 'fly' : 'idle'); }, 1200);
    APP().sfx(APP().voiceOf(D.c));
    const wasNew = !APP().isFound(D.id);
    this.paused = true;
    APP().discover(D.id, { photo, onClose: () => { this.paused = false; this.clock.getDelta(); this.updateCount(); this.updateMission(); } });
    if (wasNew) this.updateCount();
  }
  updateCount() {
    const ids = trailIds(this.era), f = ids.filter(id => APP().isFound(id)).length;
    this.host.querySelector('.t3-count').innerHTML = (f === ids.length ? `🎉 ${f} / ${ids.length}` : `📷 ${f} / ${ids.length}`) + ' <small>on this trail</small>';
    const key = 'trailDone_' + this.era;
    if (f === ids.length && !APP().getFlag(key)) {
      APP().setFlag(key); APP().stars(5);
      const others = CREATURES.filter(c => c.era === this.era).length - ids.length;
      const name = { triassic: 'Triassic', jurassic: 'Jurassic', cretaceous: 'Cretaceous' }[this.era];
      setTimeout(() => APP().celebrate(`You found every creature on the ${name} trail!`,
        `Amazing exploring! You photographed all ${ids.length} creatures here and earned 5 bonus stars.` + (others > 0 ? ` There are ${others} more ${name} creatures to meet in the map view. Tap the map button at the top to find them!` : '')), 700);
    }
  }
  missionState() {
    const ids = trailIds(this.era), found = ids.filter(id => APP().isFound(id));
    return { total: ids.length, found: found.length, plant: found.filter(id => BY_ID[id].diet === 'plants').length,
      meat: found.filter(id => BY_ID[id].diet === 'meat').length, fly: found.filter(id => MODEL_DEFS[id].fly).length,
      swim: found.filter(id => MODEL_DEFS[id].swim).length, rode: APP().getFlag('rode_' + this.era),
      flew: APP().getFlag('flew_' + this.era), swam: APP().getFlag('swam_' + this.era) };
  }
  updateMission() {
    const M = [
      { id: 'm1', text: 'Photograph your first creature', ok: s => s.found >= 1 },
      { id: 'm2', text: 'Find 2 plant eaters', ok: s => s.plant >= 2 },
      { id: 'm3', text: 'Photograph a flying reptile', ok: s => s.fly >= 1 },
      { id: 'm4', text: 'Spot a meat eater (from a safe distance!)', ok: s => s.meat >= 1 },
      { id: 'm5', text: 'Find the sea reptile in the lake', ok: s => s.swim >= 1 },
      { id: 'm6', text: 'Ride a friendly plant eater', ok: s => s.rode },
      { id: 'm8', text: 'Fly on a flying reptile', ok: s => s.flew },
      { id: 'm9', text: 'Swim with a sea reptile', ok: s => s.swam },
      { id: 'm7', text: 'Photograph every creature on the trail', ok: s => s.found >= s.total }
    ];
    const s = this.missionState();
    const avail = M.filter(m => !(m.id === 'm3' && !this.dinos.some(d => d.def.fly)) && !(m.id === 'm5' && !this.dinos.some(d => d.def.swim)) && !(m.id === 'm4' && !this.dinos.some(d => d.c.diet === 'meat'))
      && !(m.id === 'm8' && !this.dinos.some(d => d.def.fly && RIDE_OK(d))) && !(m.id === 'm9' && !this.dinos.some(d => d.def.swim && RIDE_OK(d))));
    for (const m of avail) {
      const key = `mission_${this.era}_${m.id}`;
      if (!APP().getFlag(key) && m.ok(s)) { APP().setFlag(key); APP().stars(2); APP().toast(`🎯 Mission complete: <b>${m.text}</b>! +2 ⭐`, 3200); }
    }
    const next = avail.find(m => !APP().getFlag(`mission_${this.era}_${m.id}`));
    this.host.querySelector('.t3-mission').innerHTML = next ? `🎯 ${next.text} ${APP().spk('Mission: ' + next.text)}` : `🏆 All missions done here!`;
  }

  // ---------- tracks ----------
  showTracks() {
    const todo = this.dinos.filter(d => !APP().isFound(d.id));
    const pool = todo.length ? todo : this.dinos;
    let best = null, bd = 1e9;
    for (const D of pool) { const d = D.wrap.position.distanceTo(this.player.position); if (d < bd) { bd = d; best = D; } }
    if (!best) return;
    this.trackTarget = best; this.trackUntil = performance.now() + 12000;
    // footprints from the player towards it
    for (const f of this.footprints) this.scene.remove(f);
    this.footprints = [];
    const from = this.player.position.clone(), to = best.wrap.position.clone(); to.y = 0;
    const dir = to.clone().sub(from); dir.y = 0; const len = Math.min(dir.length() - 3, 70); dir.normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    // what kind of feet? two-legged dinosaurs leave three-toed prints; heavy four-legged ones leave round prints
    const look = best.c.look || {}, flyer = best.def.fly, swimmer = best.def.swim;
    const kind = flyer ? 'bird' : swimmer ? 'flipper' : look.form === 'biped' ? 'three' : 'round';
    const L = 1.3 * (flyer ? 0.25 : swimmer ? 0.5 : clamp(best.size.y * 0.15, 0.12, 0.95));
    const geo = footGeometry(kind);
    this.trackMat = new THREE.MeshLambertMaterial({ color: 0x3f2a1c, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const stride = L * (kind === 'round' ? 2.2 : 3.2) + 0.6, spread = L * 0.55;
    const heading = Math.atan2(-dir.x, -dir.z);
    for (let d = 2, k = 0; d < len; d += stride, k++) {
      const p = from.clone().addScaledVector(dir, d).addScaledVector(side, k % 2 ? spread : -spread);
      const m = new THREE.Mesh(geo, this.trackMat);
      m.scale.setScalar(L); m.rotation.y = heading + (k % 2 ? -0.12 : 0.12);
      m.position.set(p.x, this.heightAt(p.x, p.z) + 0.03, p.z); this.scene.add(m); this.footprints.push(m);
    }
    APP().sfx('pop');
    const size = L > 0.8 ? 'Huge' : L > 0.45 ? 'Big' : L > 0.26 ? 'Medium-sized' : 'Tiny';
    const clue = kind === 'three' ? `${size} three-toed tracks! A dinosaur that walked on two legs went this way.`
      : kind === 'round' ? `${size} round tracks! A heavy dinosaur that walked on four legs went this way.`
      : kind === 'bird' ? 'Little bird-like tracks by the water! Something that can fly landed here.'
      : 'Tracks leading to the water! Something that swims lives there.';
    APP().toast(todo.length ? `🐾 ${clue} Follow them, and look where the arrow points.` : '🐾 You found everyone here! These tracks lead to an old friend.', 4200);
  }

  // ---------- riding ----------
  // she taps Call: the creature calls out (and shows what scientists think it sounded like)
  callOut(D, movie) {
    const now = performance.now(); if (!D || now < (this.callUntil || 0)) return;
    const dur = (movie ? APP().movieRoar(D.c) : APP().call(D.c)) || 1.5; this.callUntil = now + dur * 1000;
    if (!this.riding || this.riding !== D) {
      const a = D.actions.roar ? 'roar' : D.actions.attack && !D.def.swim ? 'attack' : null;
      if (a && !D.busy) { this.play(D, a); setTimeout(() => { if (!this.disposed && !D.busy) this.play(D, D.def.fly ? 'fly' : 'idle'); }, Math.min(2200, dur * 1000)); }
    }
    const found = APP().isFound(D.id), why = movie ? APP().movieWhy() : APP().callWhy(D.c);
    APP().toast(found ? `${movie ? '🎬' : '📣'} ${why}` : '📣 Who could that be? Take a photo 📷 to find out!', found ? 7000 : 3000);
  }
  nearestRideable() {
    let best = null, bd = 1e9;
    for (const D of this.dinos) {
      if (!RIDE_OK(D) || !APP().isFound(D.id) || (this.canRide && !this.canRide(D))) continue;
      // gap to its body first (0 when she is right beside it), then how close she is to its middle.
      // Flyers and swimmers can be called over from further away, but a walker right beside her comes first.
      const raw = D.wrap.position.distanceTo(this.player.position), gap = Math.max(0, raw - D.radius);
      const far = D.def.fly || D.def.swim;
      if (far ? gap > 45 : gap >= 6) continue;
      const d = far ? 1e6 + raw : gap * 1000 + raw;
      if (d < bd) { bd = d; best = D; }
    }
    return best;
  }
  startRide(D = this.nearestRideable()) {
    if (!D || this.summoning) return;
    if (D.def.fly || D.def.swim) return this.summon(D);
    this.mount(D);
  }
  // a flyer swoops down to land beside her; a swimmer comes to the edge of the water
  summon(D) {
    const P = this.player.position, name = APP().nick(D.c);
    if (D.def.swim) {
      const dx = P.x - this.lake.x, dz = P.z - this.lake.z, dl = Math.hypot(dx, dz) || 1;
      if (dl > this.lake.r + 10) { APP().toast(`🌊 Walk to the edge of the water first, then call ${name}!`); return; }
      const meet = new THREE.Vector3(this.lake.x + dx / dl * (this.lake.r - 3), 0, this.lake.z + dz / dl * (this.lake.r - 3));
      D.state = 'walk'; D.busy = false; D.target.copy(meet); D.arriveAt = 1.5; D.walkSpeed = 6; this.play(D, D.actions.swim ? 'swim' : 'walk');
      D.onArrive = () => { this.summoning = null; this.mount(D); };
    } else {
      const side = new THREE.Vector3(Math.cos(this.player.rotation.y), 0, -Math.sin(this.player.rotation.y));
      const meet = P.clone().addScaledVector(side, D.radius * 0.5 + 2.5);
      if (this.inLake(meet, -1)) meet.copy(P).addScaledVector(side, -(D.radius * 0.5 + 2.5));
      meet.y = this.heightAt(meet.x, meet.z);
      D.coming = meet;
    }
    this.summoning = D;
    APP().sfx(APP().voiceOf(D.c));
    APP().toast(D.def.fly ? `🦅 Here comes ${name}! It's flying down to pick you up.` : `🌊 Here comes ${name}! It's swimming over to you.`, 3200);
  }
  mount(D) {
    this.summoning = null;
    this.riding = D; this.moveTarget = null;
    if (!this.saddle) this.saddle = buildSaddle();
    D.wrap.add(this.saddle);
    this.saddle.scale.setScalar(clamp(D.size.y / 3.5, 0.7, 1));   // a smaller saddle on smaller dinosaurs
    this.findSeat(D);
    this.legL.rotation.z = 0.5; this.legR.rotation.z = -0.5;
    D.state = 'ridden'; D.coming = null; D.landing = false; D.vel = new THREE.Vector3(); D.alt = D.wrap.position.y;
    D.wrap.rotation.order = 'YXZ';
    APP().sfx('boing');
    const name = APP().nick(D.c);
    APP().toast(D.def.fly ? `🦅 You're flying on ${name}! Steer with the joystick. Use ⬆️ and ⬇️ to go up and down.`
      : D.def.swim ? `🌊 You're swimming with ${name}! Steer with the joystick, and tap 🌊 Dive to go under.`
      : `🦕 You're riding ${name}! Use the joystick to explore.`, 4200);
    const key = (D.def.fly ? 'flew_' : D.def.swim ? 'swam_' : 'rode_') + this.era;
    if (!APP().getFlag(key)) { APP().setFlag(key); this.updateMission(); }
  }
  swingLegs(D, dt) {
    const moving = D.moveSpeed > 0.05;
    D.gait += dt * (moving ? Math.max(2.5, D.moveSpeed / Math.max(0.5, D.size.z * 0.12) * 2.2) : 0);
    D.swingAmt = lerp(D.swingAmt || 0, moving ? 1 : 0, Math.min(1, dt * 5));
    if (D.swingAmt < 0.01) { for (const l of D.legBones) { l.bone.quaternion.copy(l.rest); if (l.foot) l.bone.position.copy(l.restPos); } return; }
    D.wrap.updateMatrixWorld(true);
    const side = new THREE.Vector3(1, 0, 0).applyQuaternion(D.wrap.getWorldQuaternion(new THREE.Quaternion()));
    const pq = new THREE.Quaternion(), rot = new THREE.Quaternion();
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(D.wrap.getWorldQuaternion(new THREE.Quaternion()));
    for (const l of D.legBones) {
      if (l.foot) {   // step the foot: forward and back along the body, lifting it on the way forward
        const sw = Math.sin(D.gait + l.phase), lift = Math.max(0, Math.cos(D.gait + l.phase));
        const move = fwd.clone().multiplyScalar(sw * D.size.z * 0.06).add(new THREE.Vector3(0, lift * D.size.z * 0.025, 0)).multiplyScalar(D.swingAmt);
        l.bone.parent.getWorldQuaternion(pq); const sc = l.bone.parent.getWorldScale(new THREE.Vector3()).x || 1;
        l.bone.position.copy(l.restPos).add(move.applyQuaternion(pq.invert()).divideScalar(sc));
        continue;
      }
      l.bone.parent.getWorldQuaternion(pq);
      const axis = side.clone().applyQuaternion(pq.invert()).normalize();
      const sw = Math.sin(D.gait + l.phase);
      const ang = l.knee ? -Math.max(0, sw) * 0.5 * D.swingAmt : sw * 0.42 * D.swingAmt;
      rot.setFromAxisAngle(axis, ang);
      l.bone.quaternion.copy(l.rest).premultiply(rot);
    }
  }
  // where along the body the saddle goes: over the middle of the ribs for four-legged ones,
  // just in front of the hips for two-legged ones (the middle of the outline is too far back when the tail is long)
  seatSpot(D) {
    const L = D.size.z;
    // sea reptiles have flippers, not legs: sit on the highest part of the back, between the long neck and the tail
    if (D.def.swim) {
      D.wrap.updateMatrixWorld(true);
      const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), top = D.size.y + 5;
      let bestZ = 0, bestY = -1e9;
      for (let f = -0.3; f <= 0.15001; f += 0.03) {
        ray.set(D.wrap.localToWorld(new THREE.Vector3(0, top, f * L)), down); ray.far = top + 2;
        const hit = ray.intersectObject(D.obj, true).find(h => h.object.isMesh);
        if (!hit) continue;
        const y = D.wrap.worldToLocal(hit.point.clone()).y;
        if (y > bestY + 0.02) { bestY = y; bestZ = f * L; }
      }
      if (bestY > -1e9) return bestZ;
    }
    let thighs = D.legBones.filter(l => !l.knee && !l.foot).map(l => l.bone);
    if (thighs.length < 2) thighs = findLegs(D.obj, D.wrap, D.size).filter(l => !l.knee).map(l => l.bone);
    if (thighs.length >= 2) {
      D.wrap.updateMatrixWorld(true);
      const zs = thighs.map(b => D.wrap.worldToLocal(b.getWorldPosition(new THREE.Vector3())).z);
      const lo = Math.min(...zs), hi = Math.max(...zs);
      if (hi - lo > L * 0.15) return lo + (hi - lo) * 0.45;   // four legs: between hips and shoulders
      return (lo + hi) / 2 + L * 0.1;                         // two legs: just ahead of the hips
    }
    let head = null; D.obj.traverse(o => { if (!head && o.isBone && /head|skull/i.test(o.name) && !/ik|ctrl/i.test(o.name)) head = o; });
    if (head) return D.wrap.worldToLocal(head.getWorldPosition(new THREE.Vector3())).z - L * 0.4;
    return -0.08 * L;
  }
  findSeat(D) {
    D.wrap.updateMatrixWorld(true);
    const L = D.size.z, top = D.size.y + 5, ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
    if (D.seatZ === undefined) D.seatZ = this.seatSpot(D) + (D.def.seatShift || 0) * L;
    // the body's middle line: the average across all bones (legs and arms come in pairs), then the spine bone nearest the seat
    const loc = b => D.wrap.worldToLocal(b.getWorldPosition(new THREE.Vector3()));
    const bones = []; D.obj.traverse(o => { if (o.isBone && !/ik|pole|target|ctrl|control/i.test(o.name)) bones.push([o, loc(o)]); });
    const cx = bones.length ? bones.reduce((a, [, p]) => a + p.x, 0) / bones.length : 0;
    let spine = null, sd = 1e9;
    for (const [b, p] of bones) {
      if (Math.abs(p.x - cx) > D.size.x * 0.12 || p.y < D.size.y * 0.35) continue;
      const d = Math.abs(p.z - D.seatZ); if (d < sd) { sd = d; spine = b; }
    }
    let best = null, low = null;
    for (const f of [0, -0.04, 0.04, -0.08, 0.08, -0.14]) {
      // look down along the spine and a little to each side; the middle height of the three ignores
      // back plates and spikes (Stegosaurus, Kentrosaurus) so she sits on the back, not on top of the plates
      const z = D.seatZ + f * L, ys = [];
      for (const x of [-0.12, 0, 0.12]) {
        ray.set(D.wrap.localToWorld(new THREE.Vector3(cx + x * D.size.x, top, z)), down); ray.far = top + 2;
        const hit = ray.intersectObject(D.obj, true).find(h => h.object.isMesh);
        if (hit) ys.push(D.wrap.worldToLocal(hit.point.clone()).y);
      }
      if (!ys.length) continue;
      // use the spine height unless it sticks up well above both sides (a plate or a sail)
      const mid = ys.length === 3 ? ys[1] : Math.max(...ys);
      const sides = ys.length === 3 ? Math.max(ys[0], ys[2]) : mid;
      const y = ys.length === 3 && mid - sides > 0.25 ? sides : mid;
      if (!low || y < low.y) low = new THREE.Vector3(cx, y, z);
      if (y > D.size.y * 0.9) continue; // that's the neck or a raised head, not the back
      best = new THREE.Vector3(cx, y, z); break;
    }
    if (!best) best = low;
    const back = best ? best.add(new THREE.Vector3(0, -0.04, 0)) : new THREE.Vector3(cx, D.size.y * (D.def.seat || 0.6), D.seatZ);
    // pin the seat to the spine so it rides along with the body's movement without measuring again
    D.seatBack = back.clone(); D.seatBone = spine;
    D.seatOff = spine ? spine.worldToLocal(D.wrap.localToWorld(back.clone())) : null;
    if (this.saddle) { this.saddle.position.copy(back); this.saddle.userData.drop = (D.def.fly ? 0.3 : Math.min(1.4, Math.max(0.5, D.size.x * 0.35))) / this.saddle.scale.x; this.saddle.children.forEach(c => { if (c.userData.strap) { c.scale.y = this.saddle.userData.drop; c.position.y = -this.saddle.userData.drop / 2 + 0.05; } if (c.userData.stirrup) c.position.y = -this.saddle.userData.drop + 0.05; }); }
    this.seat = back.clone().add(new THREE.Vector3(0, 0.17 * (this.saddle ? this.saddle.scale.y : 1), -0.05));
  }
  stopRide(now) {
    const D = this.riding; if (!D) return;
    // a flyer glides down to land first; a swimmer carries her back to the shore first
    if (!now && D.def.fly && !D.landing) { D.landing = true; APP().toast('🛬 Coming in to land…'); return; }
    if (!now && D.def.swim && !D.toShore) {
      const dl = Math.hypot(D.wrap.position.x - this.lake.x, D.wrap.position.z - this.lake.z);
      if (dl < this.lake.r - 6) { D.toShore = true; APP().toast('🏖️ Swimming back to the shore…'); return; }
    }
    if (D.landing || D.toShore) { if (!now) return; }
    if (this.saddle) D.wrap.remove(this.saddle);
    this.legL.rotation.z = 0; this.legR.rotation.z = 0;
    this.riding = null; D.state = 'idle'; D.timer = 3; this.play(D, D.def.fly ? 'fly' : 'idle');
    D.landing = false; D.toShore = false; D.dive = 0; D.wrap.rotation.set(0, D.yaw, 0);
    let p;
    if (D.def.swim) {   // step onto the shore
      const dx = D.wrap.position.x - this.lake.x, dz = D.wrap.position.z - this.lake.z, dl = Math.hypot(dx, dz) || 1;
      p = new THREE.Vector3(this.lake.x + dx / dl * (this.lake.r + 2), 0, this.lake.z + dz / dl * (this.lake.r + 2));
    } else {
      const side = new THREE.Vector3(Math.cos(D.yaw), 0, -Math.sin(D.yaw));
      p = D.wrap.position.clone().addScaledVector(side, D.radius + 1.5);
    }
    this.player.position.set(p.x, this.heightAt(p.x, p.z), p.z);
    if (D.def.fly) D.returning = true;   // it flies back up to its circle
  }
  // ---------- flying ----------
  rideFly(R, mv, dt) {
    const fwd = new THREE.Vector3(Math.sin(R.yaw), 0, Math.cos(R.yaw));
    let want;
    if (R.landing) {   // head for dry land and glide down
      want = fwd.clone().multiplyScalar(5);
      if (this.inLake(R.wrap.position, -3)) { const dx = R.wrap.position.x - this.lake.x, dz = R.wrap.position.z - this.lake.z, dl = Math.hypot(dx, dz) || 1; want.set(dx / dl * 8, 0, dz / dl * 8); }
    } else want = mv.length() > 0.05 ? mv.clone().multiplyScalar(this.running ? 18 : 11) : fwd.multiplyScalar(4);   // always gliding a little
    R.vel.lerp(want, Math.min(1, dt * 1.5));
    const prevYaw = R.yaw;
    if (R.vel.length() > 0.5) R.yaw = angleLerp(R.yaw, Math.atan2(R.vel.x, R.vel.z), 0.06);
    let turn = ((R.yaw - prevYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; turn /= Math.max(dt, 0.001);
    const np = R.wrap.position.clone().addScaledVector(R.vel, dt);
    if (Math.hypot(np.x, np.z) < EDGE - 7) { R.wrap.position.x = np.x; R.wrap.position.z = np.z; }
    const ground = Math.max(this.heightAt(R.wrap.position.x, R.wrap.position.z), this.inLake(R.wrap.position, 0) ? -0.35 : -99);
    const climb = R.landing ? -1 : (this.keys['up'] || this.keys['e'] || this.keys[' ']) ? 1 : (this.keys['down'] || this.keys['q']) ? -1 : 0;
    R.alt = clamp(R.alt + climb * (R.landing ? 5 : 8) * dt, ground + (R.landing ? 0 : 2.5), 110);
    R.wrap.position.y = lerp(R.wrap.position.y, R.alt, Math.min(1, dt * 3));
    R.wrap.rotation.set(-climb * 0.22, R.yaw, clamp(-turn * 0.35, -0.55, 0.55));
    if (R.actions.fly) R.actions.fly.timeScale = climb > 0 ? 2.2 : R.vel.length() > 12 ? 1.6 : 1.1;
    this.play(R, 'fly');
    R.moveSpeed = R.vel.length();
    if (R.landing && !this.inLake(R.wrap.position, -1) && R.wrap.position.y - ground < 0.4) this.stopRide(true);
  }
  // ---------- swimming ----------
  rideSwim(R, mv, dt, t) {
    let spd = (this.running ? 9 : 6) * mv.length(), dir = mv;
    if (R.toShore) {   // head for the nearest shore
      const dx = R.wrap.position.x - this.lake.x, dz = R.wrap.position.z - this.lake.z, dl = Math.hypot(dx, dz) || 1;
      dir = new THREE.Vector3(dx / dl, 0, dz / dl); spd = 6;
      if (dl > this.lake.r - 4) { this.stopRide(true); return; }
    }
    if (spd > 0.05) R.yaw = angleLerp(R.yaw, Math.atan2(dir.x, dir.z), 0.06);
    const np = R.wrap.position.clone().addScaledVector(new THREE.Vector3(Math.sin(R.yaw), 0, Math.cos(R.yaw)), spd * dt);
    if (Math.hypot(np.x - this.lake.x, np.z - this.lake.z) < this.lake.r - 2.5) { R.wrap.position.x = np.x; R.wrap.position.z = np.z; }
    R.moveSpeed = spd;
    this.play(R, spd > 0.1 ? (R.actions.swim ? 'swim' : 'walk') : 'idle');
    R.wrap.rotation.set(0, R.yaw + Math.sin(t * 4) * (spd > 0.1 ? 0.07 : 0.03), 0);
    // float so her seat is just above the water; a dive dips under and pops back up
    // where her seat is right now (the back moves as it swims), so she always stays just above the water
    const seatY = R.seatBone ? R.wrap.worldToLocal(R.seatBone.localToWorld(R.seatOff.clone())).y : R.seatBack ? R.seatBack.y : R.size.y * 0.6;
    let y = -0.35 - seatY + 0.1;
    if (R.dive > 0) { R.dive = Math.max(0, R.dive - dt); y -= Math.sin((1 - R.dive / 1.8) * Math.PI) * 1.8; if (R.dive === 0) this.splash(R.wrap.position, 14); }
    R.wrap.position.y = lerp(R.wrap.position.y, y, Math.min(1, dt * 4));
    // a little wake behind
    R.wakeT = (R.wakeT || 0) - dt;
    if (spd > 0.5 && R.wakeT <= 0) { R.wakeT = 0.12; const back = R.wrap.position.clone().addScaledVector(new THREE.Vector3(Math.sin(R.yaw), 0, Math.cos(R.yaw)), -R.size.z * 0.35); this.splash(back, 2); }
  }
  splash(at, n) {
    this.drops = this.drops || [];
    const m = this.dropMat || (this.dropMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
    const g = this.dropGeo || (this.dropGeo = new THREE.SphereGeometry(0.18, 6, 4));
    for (let i = 0; i < n; i++) {
      const d = new THREE.Mesh(g, m); d.position.set(at.x + rand(-0.8, 0.8), -0.3, at.z + rand(-0.8, 0.8));
      d.userData.v = new THREE.Vector3(rand(-1.5, 1.5), rand(2, 4.5), rand(-1.5, 1.5)); d.userData.life = 0.9;
      this.scene.add(d); this.drops.push(d);
    }
  }
  updateDrops(dt) {
    if (!this.drops || !this.drops.length) return;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i]; d.userData.life -= dt; d.userData.v.y -= 9.8 * dt; d.position.addScaledVector(d.userData.v, dt);
      if (d.userData.life <= 0 || d.position.y < -0.6) { this.scene.remove(d); this.drops.splice(i, 1); }
    }
  }

  inLake(p, m) { return Math.hypot(p.x - this.lake.x, p.z - this.lake.z) < this.lake.r - m; }

  // ---------- main loop ----------
  tick() {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.paused) this.update(dt);
    // nature patches lost in the haze are skipped (those out of view are skipped by three.js itself)
    if (this.chunks) {
      const far = this.scene.fog.far + 60, cp = this.camera.position, lift = Math.max(0, cp.y - 20);
      for (const c of this.chunks) {
        const d = Math.hypot(c.userData.centre.x - cp.x, c.userData.centre.z - cp.z) + lift, lod = c.userData.lod;
        const nr = [130, 105, 80][this.q || 0], gr = [110, 85, 65][this.q || 0];   // full-detail radius shrinks on good/fast graphics
        c.visible = lod === 'ground' ? d < gr : lod === 'near' ? (d < nr || !FAR_OK(c)) : lod === 'far' ? d >= nr && d < far : d < far;
      }
    }
    // only draw and animate creatures she could actually see: in front of the camera and not lost in the haze
    this.camera.updateMatrixWorld();
    const frus = this.frus || (this.frus = new THREE.Frustum()), sph = this.sph || (this.sph = new THREE.Sphere()), pm = this.pm || (this.pm = new THREE.Matrix4());
    frus.setFromProjectionMatrix(pm.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));
    for (const D of this.dinos) {
      sph.center.copy(D.wrap.position); sph.center.y += D.size.y * 0.5; sph.radius = Math.max(D.size.x, D.size.y, D.size.z) * 0.7 + 2;
      const dd = sph.center.distanceTo(this.camera.position);
      D.wrap.visible = D === this.riding || (dd < this.scene.fog.far + sph.radius && frus.intersectsSphere(sph));
      if (!D.wrap.visible) continue;
      // far away: animate every other frame (half the work, no one can tell at that distance)
      if (D !== this.riding && dd > 120) { D.skip = !D.skip; if (D.skip) { D.acc = (D.acc || 0) + dt; continue; } }
      const ddt = dt + (D.acc || 0); D.acc = 0;
      // make the walk cycle keep pace with how fast the dinosaur is actually moving
      const walkA = D.actions.walk;
      if (walkA && D.cur === walkA && !D.def.fly && !D.def.swim) walkA.timeScale = D.moveSpeed > 0 ? clamp(D.moveSpeed / Math.max(0.6, D.size.z * 0.09), 0.8, 3.2) : 1;
      D.mixer.update(ddt);
      if (D.legBones.length) this.swingLegs(D, ddt);
    }
    this.renderer.render(this.scene, this.camera);
    // count frames every second: shown on the speed meter, and used to ease off quality if the iPad struggles
    this.fpsN = (this.fpsN || 0) + 1;
    const now = performance.now();
    if (!this.fpsT) this.fpsT = now;
    if (now - this.fpsT > 1000) {
      const fps = Math.round(this.fpsN * 1000 / (now - this.fpsT)); this.fpsN = 0; this.fpsT = now;
      this.autoQuality(fps);
      if (this.meter) {
        this.meter.textContent = `⚡ ${fps} frames/sec · ${['best', 'good', 'fast'][this.q]} graphics · loaded in ${this.loadSecs}s · ${this.renderer.info.render.triangles.toLocaleString()} triangles`;
        this.meter.style.background = fps >= 45 ? '#c9f0c4' : fps >= 25 ? '#ffe08a' : '#ffc4b8';
        // on the home Wi-Fi version only, report the reading to the Mac's game server log
        if (location.protocol === 'http:' && (this.beacons = (this.beacons || 0) + 1) % 5 === 0) {
          fetch(`speed-report?era=${this.era}&fps=${fps}&q=${this.q}&load=${this.loadSecs}&tri=${this.renderer.info.render.triangles}&w=${innerWidth}x${innerHeight}&dpr=${devicePixelRatio}`, { cache: 'no-store' }).catch(() => {});
        }
      }
    }
  }
  // graphics quality: 0 best (sharp + shadows), 1 good (a little less sharp), 2 fast (no shadows too).
  // Starts at best; if the device runs slowly for a few seconds it steps down, and remembers that for next time.
  applyQuality() {
    const dpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(Math.min(dpr, [1.75, 1.3, 1][this.q]));
    // "fast": the creatures and trees stop casting shadows (the costly part). The sun itself keeps its shadow
    // setting, because switching that mid-game made the dinosaurs' materials redraw black on the iPad.
    const cast = this.q < 2;
    this.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && o.userData.shadowWas === undefined) o.userData.shadowWas = o.castShadow; if (o.isMesh || o.isInstancedMesh) o.castShadow = cast && o.userData.shadowWas; });
    if (this.onResize) this.onResize(); else this.renderer.setSize(this.host.clientWidth, this.host.clientHeight, false);
  }
  autoQuality(fps) {
    if (this.paused || document.hidden || performance.now() - this.t0 < 6000 + (this.qAt || 0)) { this.slowN = 0; return; }
    this.slowN = fps < 40 ? (this.slowN || 0) + 1 : 0;
    if (this.slowN >= 3 && this.q < 2) {
      this.q++; this.slowN = 0; this.qAt = performance.now() - this.t0;   // give the new setting a few seconds to settle
      try { localStorage.setItem(QKEY, String(this.q)); } catch (e) { /* ignore */ }
      this.applyQuality();
    }
  }
  update(dt) {
    const P = this.player;
    // movement input (camera-relative)
    let ix = this.input.x, iy = this.input.y;
    if (this.keys['w'] || this.keys['arrowup']) iy = -1;
    if (this.keys['s'] || this.keys['arrowdown']) iy = 1;
    if (this.keys['a'] || this.keys['arrowleft']) ix = -1;
    if (this.keys['d'] || this.keys['arrowright']) ix = 1;
    let mv = new THREE.Vector3();
    if (Math.hypot(ix, iy) > 0.1) {
      const f = new THREE.Vector3(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)), rgt = new THREE.Vector3(-f.z, 0, f.x);
      mv.addScaledVector(f, -iy).addScaledVector(rgt, ix);
      if (mv.length() > 1) mv.normalize();
    } else if (this.moveTarget && !this.riding) {
      const d = this.moveTarget.clone().sub(P.position); d.y = 0;
      if (d.length() < 0.6) this.moveTarget = null; else mv = d.normalize();
    }
    const R = this.riding;
    if (R && R.def.fly) this.rideFly(R, mv, dt);
    else if (R && R.def.swim) this.rideSwim(R, mv, dt, performance.now() / 1000);
    if (R && this.riding !== R) { /* just got off */ }
    else if (R) {
      const spd = (R.def.pod ? 11 : R.actions.run ? 7 : 5) * mv.length();
      if (R.def.fly || R.def.swim) { /* moved above */ }
      else if (mv.length() > 0.05) {
        R.yaw = angleLerp(R.yaw, Math.atan2(mv.x, mv.z), 0.08);
        const np = R.wrap.position.clone().addScaledVector(new THREE.Vector3(Math.sin(R.yaw), 0, Math.cos(R.yaw)), spd * dt);
        if (Math.hypot(np.x, np.z) < EDGE - 4 && !this.inLake(np, R.def.pod ? 0.5 : 1) && !(this.blockMove && this.blockMove(R.wrap.position, np, R))) { R.wrap.position.x = np.x; R.wrap.position.z = np.z; }
        this.play(R, R.actions.run && mv.length() > 0.7 ? 'run' : 'walk');
        R.moveSpeed = spd;
      } else { this.play(R, 'idle'); R.moveSpeed = 0; }
      if (!R.def.fly && !R.def.swim) { R.wrap.position.y = this.heightAt(R.wrap.position.x, R.wrap.position.z); R.wrap.rotation.y = R.yaw; }
      // sit on the real back: every few frames, drop a ray onto the dinosaur's body just behind its middle
      if (!R.seatBack) this.findSeat(R);   // measured once per dinosaur; heavy, so never every frame
      const back = R.seatBone ? R.wrap.worldToLocal(R.seatBone.localToWorld(R.seatOff.clone())) : R.seatBack.clone();
      if (this.saddle) this.saddle.position.copy(back);
      this.seat = back.add(new THREE.Vector3(0, 0.17 * (this.saddle ? this.saddle.scale.y : 1), -0.05));
      P.position.copy(R.wrap.localToWorld(this.seat.clone())); P.rotation.y = R.yaw;
      this.legL.rotation.x = this.legR.rotation.x = -0.9;
    } else {
      const push = mv.length(), speed = (this.running ? 9 : push > 0.92 ? 5.6 : 4.2) * push;
      if (speed > 0.05) {
        const np = P.position.clone().addScaledVector(mv, speed * dt);
        // keep out of the lake and inside the valley; push away from dinosaurs
        if (this.inLake(np, 0.5) || Math.hypot(np.x, np.z) > EDGE || (this.blockMove && this.blockMove(P.position, np))) { this.moveTarget = null; }
        else {
          for (const D of this.dinos) {
            if (D.def.fly || D.def.swim) continue;
            const dx = np.x - D.wrap.position.x, dz = np.z - D.wrap.position.z, dd = Math.hypot(dx, dz), min = D.radius * 0.8 + 0.4;
            if (dd < min && dd > 0.001) { np.x = D.wrap.position.x + dx / dd * min; np.z = D.wrap.position.z + dz / dd * min; }
          }
          P.position.x = np.x; P.position.z = np.z;
        }
        P.rotation.y = angleLerp(P.rotation.y, Math.atan2(mv.x, mv.z), 0.2);
        this.walkT += dt * speed * (this.running ? 1.9 : 2.6);
        const sw = Math.sin(this.walkT) * (this.running ? 1.0 : 0.7);
        this.legL.rotation.x = sw; this.legR.rotation.x = -sw; this.armL.rotation.x = -sw * 0.8; this.armR.rotation.x = sw * 0.8;
      } else { this.legL.rotation.x *= 0.8; this.legR.rotation.x *= 0.8; this.armL.rotation.x *= 0.8; this.armR.rotation.x *= 0.8; }
      P.position.y = this.heightAt(P.position.x, P.position.z);
    }
    // camera follows behind
    const back = R ? 10 + R.size.y * 1.2 : 7.5, up = R ? 3 + R.size.y * 1.1 : 3.4;
    if (mv.length() > 0.1) { this.camYaw = angleLerp(this.camYaw, Math.atan2(-mv.x, -mv.z), dt * 0.9); this.camPitch *= 1 - Math.min(1, dt * 0.6); }
    // tilt: lower the camera and aim higher to look up at tall dinosaurs; raise it to look down
    const e0 = Math.atan2(up, back), elev = clamp(e0 + this.camPitch, -0.12, 1.3), dist = Math.hypot(back, up) * this.zoom;
    const lookUp = Math.max(0, e0 - elev) * dist * 2.4;
    const want = new THREE.Vector3(P.position.x + Math.sin(this.camYaw) * Math.cos(elev) * dist, P.position.y + 1.0 + Math.sin(elev) * dist, P.position.z + Math.cos(this.camYaw) * Math.cos(elev) * dist);
    // don't let trees block the view: pull the camera in front of any trunk in the way
    { const px = P.position.x, pz = P.position.z, vx = want.x - px, vz = want.z - pz, L2 = vx * vx + vz * vz;
      let best = 1;
      for (const tr of this.treeSpots) {
        const tx = tr[0] - px, tz = tr[1] - pz, u = (tx * vx + tz * vz) / L2;
        if (u <= 0.05 || u >= best) continue;
        const cx = tx - vx * u, cz = tz - vz * u;
        if (cx * cx + cz * cz < (3.2 * tr[3]) ** 2) best = Math.max(0.18, u - 0.12);
      }
      if (best < 1) { want.x = px + vx * best; want.z = pz + vz * best; want.y = lerp(P.position.y + 1.6, want.y, best); }
    }
    const gh = this.heightAt(want.x, want.z) + 0.6; if (want.y < gh) want.y = gh;
    this.camera.position.lerp(want, 1 - Math.pow(0.001, dt));
    this.camera.lookAt(P.position.x, P.position.y + (R ? R.size.y * 0.6 : 1.3) + lookUp, P.position.z);
    this.sun.position.set(P.position.x + 40, 70, P.position.z + 25); this.sun.target.position.copy(P.position);
    // the higher she flies, the further she can see; the sky dome moves with the camera so it never runs out
    if (this.sky) this.sky.position.set(this.camera.position.x, 0, this.camera.position.z);
    const cy = Math.max(0, this.camera.position.y - 10);
    const qf = [1, 0.8, 0.65][this.q || 0];   // good/fast graphics: the mist comes a little closer, so there is less to draw
    this.scene.fog.near = 80 * qf + cy * 2; this.scene.fog.far = 330 * qf + cy * 6;
    // dinosaurs
    const t = performance.now() / 1000;
    for (const D of this.dinos) if (D !== this.riding) this.updateDino(D, dt, t);
    this.updateDrops(dt);
    // smoke
    if (this.smoke) for (const s of this.smoke) { s.userData.t = (s.userData.t + dt * 0.05) % 1; const k = s.userData.t; s.position.set(-300 + k * 40, 116 + k * 80, -240 - k * 16); s.scale.setScalar(0.6 + k * 1.6); s.material.opacity = 0.55 * (1 - k); }
    // HUD
    this.updateHud();
  }
  // a flyer's visit: it glides down in front of her, low and close, then flies back up
  flyVisit(D, dt) {
    const V = D.visit, p = this.player.position, span = D.def.span || 3, head = p.y + KID_H;
    let r, alt, base;
    if (V.found) {
      // one she already has: it sweeps past out in front, about 3 m (10 feet) above her head, so she sees it in the top of
      // the picture but it never flies across her or the camera
      r = 5 + span * 0.6; alt = head + 3 + span * 0.3;
      V.ph = (V.ph || 0) + dt * 0.35; base = (this.camYaw || 0) + Math.PI + 0.45 * Math.sin(V.ph);
    } else {
      // one she still needs: it sweeps from side to side out in front of her, well above her head, so she can photograph it
      r = 6 + span * 0.8; alt = head + 2.2 + span * 0.2;
      V.ph = (V.ph || 0) + dt * 0.35;
      base = (this.camYaw || 0) + Math.PI + 0.4 * Math.sin(V.ph);   // narrow enough to stay in view on a tall (portrait) screen
    }
    const to = new THREE.Vector3(p.x + Math.sin(base) * r, alt, p.z + Math.cos(base) * r);
    const d = to.clone().sub(D.wrap.position), L = d.length();
    if (L > 0.05) {
      D.wrap.position.addScaledVector(d, Math.min(1, (V.near ? 6 : 13) * dt / L));
      D.yaw = angleLerp(D.yaw || 0, Math.atan2(d.x, d.z), dt * 3); D.wrap.rotation.set(0, D.yaw, -0.2 * D.dir);
    }
    if (L < 4) V.near = true;
    if (V.near) V.left -= dt;
    if (V.left <= 0 || this.riding) {
      D.visit = null; this.visitor = null; D.returning = true;
      // found ones come back only now and then; and after any visit the sky stays clear for a while
      const found = APP().isFound(D.id);
      D.visitT = found ? rand(150, 240) : rand(25, 40);
      this.visitAfter = performance.now() + (found ? 60000 : 15000);
    }
  }
  updateDino(D, dt, t) {
    const def = D.def;
    if (def.fly && (D.coming || D.returning)) {
      const circle = new THREE.Vector3(D.home.x + Math.cos(D.ang) * D.range, D.alt0 || D.alt, D.home.z + Math.sin(D.ang) * D.range);
      const to = D.coming || circle, d = to.clone().sub(D.wrap.position), L = d.length();
      if (L < 0.8) {
        if (D.coming) { D.coming = null; this.mount(D); return; }
        D.returning = false; D.alt = D.alt0 || D.alt; D.wrap.rotation.set(0, D.wrap.rotation.y, 0);
      } else {
        D.wrap.position.addScaledVector(d, Math.min(1, 12 * dt / L));
        D.yaw = angleLerp(D.yaw || 0, Math.atan2(d.x, d.z), dt * 3); D.wrap.rotation.set(0, D.yaw, 0);
        if (D.actions.fly) D.actions.fly.timeScale = 1.8;
      }
      return;
    }
    if (def.fly && D.visit) { this.flyVisit(D, dt); return; }
    if (def.fly && D.visitT !== undefined && !this.riding && !this.summoning && !this.visitor && performance.now() > (this.visitAfter || 0)) {
      // now and then a flyer swoops down to circle round her, so she can take its photo
      D.visitT -= dt;
      if (D.visitT <= 0) {
        const p = this.player.position, a = Math.atan2(D.wrap.position.z - p.z, D.wrap.position.x - p.x);
        const found = APP().isFound(D.id);
        D.visit = { ang: a, left: found ? 10 : 16, near: false, found }; this.visitor = D;
        if (!APP().isFound(D.id)) APP().toast(`🦅 Look up! A flying reptile is swooping down to visit you. Take its photo 📷!`, 4000);
      }
    }
    if (def.fly) {
      if (D.alt0 === undefined) D.alt0 = D.alt;
      D.ang += dt * D.dir * (7 / D.range);
      const x = D.home.x + Math.cos(D.ang) * D.range, z = D.home.z + Math.sin(D.ang) * D.range;
      D.wrap.position.set(x, D.alt + Math.sin(t * 0.8 + D.range) * 2, z);
      D.wrap.rotation.y = Math.atan2(-Math.sin(D.ang) * D.dir, Math.cos(D.ang) * D.dir);
      D.wrap.rotation.z = -0.25 * D.dir;
      return;
    }
    const pd = D.wrap.position.distanceTo(this.player.position);
    D.timer -= dt;
    if (D.state === 'idle') {
      if (pd < 14 && !def.swim) { // curious: turn towards the explorer
        const a = Math.atan2(this.player.position.x - D.wrap.position.x, this.player.position.z - D.wrap.position.z);
        D.yaw = angleLerp(D.yaw, a, dt * 1.5);
      }
      if (D.timer <= 0 && !D.busy) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * D.range;
        D.target.set(D.home.x + Math.cos(a) * r, 0, D.home.z + Math.sin(a) * r);
        if (!def.swim && Math.hypot(D.target.x - this.lake.x, D.target.z - this.lake.z) < this.lake.r + 3) { D.timer = 1; return; }
        D.state = 'walk'; this.play(D, 'walk');
      }
    } else if (D.state === 'walk') {
      const d = D.target.clone().sub(D.wrap.position); d.y = 0;
      if (d.length() < (D.arriveAt || 0.8)) {
        D.state = 'idle'; D.timer = rand(3, 9); this.play(D, 'idle'); D.moveSpeed = 0;
        if (D.onArrive) { const f = D.onArrive; D.onArrive = null; D.walkSpeed = 0; D.arriveAt = 0; f(); }
      } else {
        const want = Math.atan2(d.x, d.z); D.yaw = angleLerp(D.yaw, want, dt * 2);
        const sp = D.walkSpeed || (def.swim ? 1.6 : clamp(D.size.z * 0.18, 0.8, 2.4));
        D.wrap.position.addScaledVector(new THREE.Vector3(Math.sin(D.yaw), 0, Math.cos(D.yaw)), sp * dt);
        D.moveSpeed = sp;
      }
    }
    D.wrap.rotation.y = D.yaw + (def.swim && !D.cur ? Math.sin(t * 2.2 + D.home.x) * 0.12 : 0);
    D.wrap.position.y = def.swim ? -0.9 - D.size.y * 0.35 + Math.sin(t + D.home.x) * 0.15 : this.heightAt(D.wrap.position.x, D.wrap.position.z);
  }
  updateHud() {
    // nearest creature → size card
    let near = null, nd = 1e9;
    for (const D of this.dinos) { const d = D.wrap.position.distanceTo(this.player.position) - D.radius; if (d < nd) { nd = d; near = D; } }
    const card = this.host.querySelector('.t3-size');
    if (near && nd < 22 && !this.riding) {
      const found = APP().isFound(near.id), c = near.c, def = near.def;
      const key = near.id + found;
      if (card.dataset.k !== key) {
        card.dataset.k = key;
        let line;
        if (def.fly) line = `Wings ${c.len} m wide, about as wide as ${Math.round(c.len / KID_H * 2) / 2} of you lying down!`;
        else { const hh = Math.round(near.size.y * 2) / 2, k = Math.round(hh / KID_H * 2) / 2; line = `${c.len} m long and about ${hh} m tall. That's ${k <= 1 ? 'about as tall as you' : k + ' of you standing on each other'}!`; }
        if (near.p && !near.p.grown) { const hh = Math.max(0.5, Math.round(near.size.y * 2) / 2), gh = Math.round(near.full.y * 2) / 2; line = `A baby, about ${hh} m tall now. When it grows up it will be ${c.len} m long and ${gh} m tall!`; }
        const name = found ? (near.p && near.p.nick ? `${near.p.nick} the ${APP().nick(c)}` : APP().nick(c)) : 'A mystery creature';
        const movie = found && APP().hasMovie(c);
        card.innerHTML = `<div><b>${found ? '📏 ' : '❓ '}${name}</b><span>${found ? line : 'Take a photo 📷 to find out who it is!'}</span></div>${found ? APP().spk(`${name}. ${line}`) : ''}${movie ? '<button class="t3-call movie" aria-label="Movie roar">🎬<small>Roar</small></button>' : ''}<button class="t3-call real" aria-label="Call">📣<small>${movie ? 'Real' : 'Call'}</small></button>`;
        card.querySelector('.t3-call.real').onclick = e => { e.stopPropagation(); this.callOut(near); };
        const mb = card.querySelector('.t3-call.movie'); if (mb) mb.onclick = e => { e.stopPropagation(); this.callOut(near, true); };
      }
      card.classList.remove('hidden');
    } else card.classList.add('hidden');
    // ride buttons
    const rideBtn = this.host.querySelector('.ride'), offBtn = this.host.querySelector('.off'), R = this.riding;
    const can = !R && !this.summoning ? this.nearestRideable() : null;
    rideBtn.classList.toggle('hidden', !can);
    const rk = can ? (can.def.fly ? 'fly' : can.def.swim ? 'swim' : 'ride') : '';
    if (rideBtn.dataset.k !== rk) { rideBtn.dataset.k = rk; rideBtn.innerHTML = rk === 'fly' ? '🦅<small>Fly</small>' : rk === 'swim' ? '🌊<small>Swim</small>' : '🦕<small>Ride</small>'; }
    offBtn.classList.toggle('hidden', !R || !!(R.landing || R.toShore));
    const ok = R ? (R.def.fly ? 'land' : R.def.swim ? 'shore' : 'off') : '';
    if (offBtn.dataset.k !== ok) { offBtn.dataset.k = ok; offBtn.innerHTML = ok === 'land' ? '🛬<small>Land</small>' : ok === 'shore' ? '🏖️<small>To shore</small>' : '⬇️<small>Hop off</small>'; }
    const flyBox = this.host.querySelector('.t3-fly'), dv = this.host.querySelector('.dive');
    if (flyBox) flyBox.classList.toggle('hidden', !(R && R.def.fly && !R.landing));
    if (dv) dv.classList.toggle('hidden', !(R && R.def.swim && !R.toShore));
    // tracking arrow
    const arrow = this.host.querySelector('.t3-arrow');
    if (this.trackMat) { const left = (this.trackUntil || 0) - performance.now(); this.trackMat.opacity = clamp(left / 3000, 0, 0.85); }
    if (this.trackTarget && performance.now() < this.trackUntil && !APP().isFound(this.trackTarget.id)) {
      const tp = this.trackTarget.wrap.position, pp = this.player.position;
      const a = Math.atan2(tp.x - pp.x, tp.z - pp.z), rel = a - (this.camYaw + Math.PI);
      arrow.style.transform = `translateX(-50%) rotate(${-rel}rad)`;
      arrow.classList.remove('hidden');
    } else { arrow.classList.add('hidden'); if (this.footprints.length && performance.now() > (this.trackUntil || 0)) { for (const f of this.footprints) this.scene.remove(f); this.footprints = []; } }
  }

  dispose() {
    this.disposed = true;
    if (this.renderer) { this.renderer.setAnimationLoop(null); this.renderer.dispose(); this.renderer.forceContextLoss && this.renderer.forceContextLoss(); }
    window.removeEventListener('resize', this.onTurn); window.removeEventListener('orientationchange', this.onTurn);
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('keydown', this.onKey); window.removeEventListener('keyup', this.onKey);
    document.removeEventListener('visibilitychange', this.onVis);
    if (this.scene) this.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  }
}

// =====================================================================
//                         MY DINO PARK (3D)
// =====================================================================
// Her own park, built like a grand theme park: a gate she opens with her ranger ID card, a plaza,
// paddocks for each kind of creature, a hatchery, gyrosphere pods, and care that the dinosaurs act out.
const PK = {
  wallZ: 96 * WK,
  plaza: { x: 0, z: 50 * WK, r: 18 },
  centre: { x: 0, z: 8 * WK },
  hatch: { x: -44 * WK, z: 62 * WK, r: 11 },
  pods: { x: 28 * WK, z: 62 * WK },
  meadow: { x: -66 * WK, z: 0, r: 60, name: 'The Meadow', e: '🌿' },
  ridge: { x: 72 * WK, z: 6 * WK, r: 50, name: 'Predator Ridge', e: '🦖' },
  lagoon: { x: 0, z: -78 * WK, r: 55, name: 'The Lagoon', e: '🌊' },
  aviary: { x: 62 * WK, z: -64 * WK, r: 24, name: 'The Aviary', e: '🦅' },
  lookout: { x: 46 * WK, z: 32 * WK, r: 4.5, h: 5 }
};
ERA_LOOK.park = { sky: [0x6fc0ff, 0xeaf7ff], fog: 0xd6ecf5, grass: [0x72b653, 0x4f9440], path: 0xd9c49a, trees: ['palm', 'palm', 'broadleaf', 'magnolia', 'conifer'], ground: ['fern', 'flower', 'bush', 'fern'], volcano: false };
const angDiff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
const hash01 = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };

// painted signs and floating labels
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function signTex(text, o = {}) {
  const w = o.w || 1024, h = o.h || 256;
  return canvasTex(w, h, (g) => {
    g.fillStyle = o.bg || '#1f3b2a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = o.border || '#f2c230'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
    g.fillStyle = o.fg || '#ffd84a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let size = o.size || h * 0.42; g.font = `900 ${size}px "Avenir Next","Helvetica Neue",Arial,sans-serif`;
    while (g.measureText(text).width > w * 0.9 && size > 10) { size -= 4; g.font = `900 ${size}px "Avenir Next","Helvetica Neue",Arial,sans-serif`; }
    g.fillText(text, w / 2, h * (o.sub ? 0.4 : 0.54));
    if (o.sub) { g.font = `700 ${h * 0.2}px "Avenir Next",Arial,sans-serif`; g.fillStyle = o.subCol || '#ffffff'; g.fillText(o.sub, w / 2, h * 0.76); }
  });
}
function labelSprite(text, o = {}) {
  const t = canvasTex(512, 128, (g, w, h) => {
    g.font = `800 58px "Avenir Next","Helvetica Neue",Arial,sans-serif`;
    const tw = Math.min(w - 8, g.measureText(text).width + 50);
    g.fillStyle = o.bg || 'rgba(20,30,25,0.72)';
    const x0 = (w - tw) / 2; g.beginPath(); g.roundRect(x0, 20, tw, 88, 44); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 66, w - 30);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(o.w || 4, (o.w || 4) / 4, 1); s.renderOrder = 5;
  return s;
}
const M = (color, extra = {}) => new THREE.MeshLambertMaterial(Object.assign({ color, flatShading: true }, extra));

let activePark = null;
export function stopPark() { if (activePark) { activePark.dispose(); activePark = null; if (LOWMEM) cache.clear(); } }
export async function startPark(host) {
  stopTrail(); stopPark();
  const world = new Park(host);
  activePark = world; window.__park = world;
  await world.init();
  return world;
}

class Park extends Trail {
  constructor(host) {
    super(host, 'park', {});
    this.loadingText = 'Opening your Dino Park…';
    this.fx = []; this.eggMeshes = []; this.pods = []; this.anims = []; this.doorOpen = 0; this.doorWant = 0;
    this.fences = []; this.boxes = [];
    const G = (z, f) => Object.assign({}, z, f);
    // each gate faces the end of the path that leads to it
    const doorAt = { meadow: [-34 * WK, 0], ridge: [46 * WK, 8 * WK], aviary: [51 * WK, -53 * WK] };
    for (const k of ['meadow', 'ridge', 'aviary']) {
      const z = PK[k], [dx, dz] = doorAt[k];
      this.fences.push(G(z, { key: k, gate: Math.atan2(dz - z.z, dx - z.x), gap: (k === 'aviary' ? 2.4 : 6) / z.r }));
    }
    this.boxes.push({ x0: PK.centre.x - 16, x1: PK.centre.x + 16, z0: PK.centre.z - 8, z1: PK.centre.z + 8 });   // visitor centre
  }
  hudHtml() {
    return `
        <div class="t3-top"><div class="t3-mission"></div><button class="t3-count"></button></div>
        <div class="t3-size hidden"></div>
        <div class="t3-arrow hidden">⬆️</div>
        <div class="t3-joy"><div class="t3-knob"></div></div>
        <div class="t3-fly hidden"><button class="t3-btn up" aria-label="Fly up">⬆️<small>Up</small></button><button class="t3-btn down" aria-label="Fly down">⬇️<small>Down</small></button></div>
        <div class="t3-btns">
          <button class="t3-btn pod hidden" aria-label="Gyrosphere">🔵<small>Gyrosphere</small></button>
          <button class="t3-btn cam" aria-label="Take a photo">📷<small>Photo</small></button>
          <button class="t3-btn map" aria-label="Park map">🗺️<small>Map</small></button>
          <button class="t3-btn deco" aria-label="Decorate">🎨<small>Decorate</small></button>
          <button class="t3-btn run" aria-label="Run">🏃<small>Run</small></button>
          <button class="t3-btn ride hidden" aria-label="Ride">🦕<small>Ride</small></button>
          <button class="t3-btn off hidden" aria-label="Hop off">⬇️<small>Hop off</small></button>
          <button class="t3-btn dive hidden" aria-label="Dive">🌊<small>Dive</small></button>
        </div>
        <div class="pk-care hidden"></div>
        <div class="pk-panel hidden"></div>
        <div class="pk-deco hidden"></div>
        <div class="pk-id hidden"></div>
        <div class="t3-fade"></div>
        <div class="t3-flash"></div>
        <div class="t3-meter hidden"></div>`;
  }

  // ---------- layout ----------
  buildPath() {
    const curve = (pts, closed) => new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), closed, 'catmullrom', 0.5);
    const K = pts => pts.map(([x, z]) => [x * WK, z * WK]);
    const avenue = curve([[0, PK.wallZ + 16], [0, PK.wallZ], [0, (PK.wallZ + PK.plaza.z) / 2], [0, PK.plaza.z + PK.plaza.r]], false);
    const ring = curve(K([[-16, 36], [-26, 22], [-26, -26], [-12, -42], [20, -42], [36, -36], [38, -14], [36, 20], [16, 36]]), true);
    const spurs = [curve(K([[-12, 56], [-24, 62], [-33, 62]]), false), curve(K([[12, 56], [20, 62]]), false), curve(K([[-26, 0], [-34, 0]]), false),
      curve(K([[38, 8], [46, 8]]), false), curve([[0, -42 * WK], [0, PK.lagoon.z + PK.lagoon.r + 2]], false), curve(K([[36, -36], [44, -46], [51, -53]]), false), curve(K([[36, 20], [42, 27]]), false)];
    const safari = curve(Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return [PK.meadow.x + Math.cos(a) * 38, PK.meadow.z + Math.sin(a) * 38]; }), true);
    this.curve = avenue;
    this.pathPts = [...avenue.getSpacedPoints(60), ...ring.getSpacedPoints(420), ...safari.getSpacedPoints(200), ...spurs.flatMap(c => c.getSpacedPoints(18))];
    this.pierZ0 = PK.lagoon.z + PK.lagoon.r + 2; this.pierZ1 = this.pierZ0 - 26;
    this.lake = { x: PK.lagoon.x, z: PK.lagoon.z, r: PK.lagoon.r };
    this.flats = [PK.plaza, { x: 0, z: PK.wallZ, r: 14 }, { x: 0, z: PK.wallZ + 14, r: 14 }, PK.hatch, { x: PK.pods.x, z: PK.pods.z, r: 8 }, { x: PK.centre.x, z: PK.centre.z, r: 20 }, { x: PK.aviary.x, z: PK.aviary.z, r: PK.aviary.r + 2 }];
  }
  planHomes() { this.homes = {}; }
  pathDist(x, z) {
    let best = 1e9;
    for (let i = 0; i < this.pathPts.length; i++) { const p = this.pathPts[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < best) best = d; }
    return Math.sqrt(best);
  }
  rawHeight(x, z) {
    let h = 1.0 * Math.sin(x * 0.045) * Math.cos(z * 0.04) + 0.5 * Math.sin(x * 0.11 + z * 0.07) + 0.3 * Math.cos(z * 0.15 - x * 0.05);
    const d = Math.hypot(x, z);
    if (d > EDGE - 12 && !(Math.abs(x) < 26 && z > PK.wallZ - 6)) h += (d - (EDGE - 12)) * 0.55;
    // Predator Ridge sits on a rocky rise
    const rd = Math.hypot(x - PK.ridge.x, z - PK.ridge.z);
    if (rd < PK.ridge.r + 10) h += 2.2 * clamp(1 - rd / (PK.ridge.r + 10), 0, 1) + 1.2 * Math.sin(x * 0.3) * Math.cos(z * 0.25) * clamp(1 - rd / PK.ridge.r, 0, 1);
    const pd = this.pathDist(x, z);
    h = lerp(h * 0.2, h, clamp((pd - 3) / 7, 0, 1));
    for (const f of this.flats) { const fd = Math.hypot(x - f.x, z - f.z); h = lerp(0.05, h, clamp((fd - f.r) / 7, 0, 1)); }
    // lookout hill beside Predator Ridge, with a gentle slope up
    const lk = PK.lookout, ld0 = Math.hypot(x - lk.x, z - lk.z);
    if (ld0 < lk.r + 9) h = Math.max(h, lk.h * clamp(1 - (ld0 - lk.r) / 9, 0, 1));
    const ld = Math.hypot(x - this.lake.x, z - this.lake.z);
    if (ld < this.lake.r + 6) h = lerp(h, -3.2, clamp(1 - (ld - this.lake.r * 0.35) / (this.lake.r * 0.65 + 6), 0, 1));
    return h;
  }
  onPier(x, z) { return Math.abs(x - PK.lagoon.x) < 1.8 && z < this.pierZ0 && z > this.pierZ1; }
  heightAt(x, z) { return this.onPier(x, z) ? 0.6 : super.heightAt(x, z); }
  inLake(p, m) { return !this.onPier(p.x, p.z) && super.inLake(p, m); }
  blocked(x, z, tree) {
    const near = (o, r) => Math.hypot(x - o.x, z - o.z) < r;
    if (Math.abs(z - PK.wallZ) < 5 && Math.abs(x) < 175) return true;
    if (near(PK.plaza, PK.plaza.r + 4) || near(PK.hatch, PK.hatch.r + 3) || near(PK.pods, 10) || near(PK.centre, 22) || near(PK.aviary, PK.aviary.r + 3) || near(PK.lookout, PK.lookout.r + 7)) return true;
    if (x > -8 && x < 8 && z > PK.plaza.z + PK.plaza.r && z < PK.wallZ + 4) return true;   // the grand avenue
    for (const f of this.fences) { const d = Math.hypot(x - f.x, z - f.z); if (Math.abs(d - f.r) < 3) return true; }
    // open grassland inside the paddocks: only a few trees
    if (tree && (near(PK.meadow, PK.meadow.r) || near(PK.ridge, PK.ridge.r))) return hash01(x, z) < 0.8;
    return false;
  }
  blockMove(a, b, rider) {
    const pad = rider ? Math.min(3, rider.radius * 0.35) : 0;
    const wz = PK.wallZ;
    if ((a.z - wz) * (b.z - wz) <= 0 && Math.abs(b.x) < 175 && (Math.abs(b.x) > 7 - pad || this.doorOpen < 0.85)) return true;
    for (const f of this.fences) {
      const da = Math.hypot(a.x - f.x, a.z - f.z) - f.r, db = Math.hypot(b.x - f.x, b.z - f.z) - f.r;
      if (Math.abs(db) < pad + 0.6 || da * db <= 0) { const ang = Math.atan2(b.z - f.z, b.x - f.x); if (Math.abs(angDiff(ang, f.gate)) > f.gap - pad / f.r) { if (Math.abs(db) < Math.abs(da) || da * db <= 0) return true; } }
    }
    for (const r of this.boxes) if (b.x > r.x0 - pad && b.x < r.x1 + pad && b.z > r.z0 - pad && b.z < r.z1 + pad) return true;
    return false;
  }

  async buildWorld() {
    this.buildSky(); this.buildPath(); this.planHomes(); this.buildTerrain(); this.buildWater(); await this.buildScenery(); this.buildPlayer();
    this.footprints = [];
    const P = this.player; P.position.set(0, this.heightAt(0, PK.wallZ + 12), PK.wallZ + 12); P.rotation.y = Math.PI; this.camYaw = 0; this.camPitch = -0.3; this.zoom = 1.7;
    this.buildGate(); this.buildAvenue(); this.buildPlaza(); this.buildCentre(); this.buildPaddocks(); this.buildLagoonPier(); this.buildAviary(); this.buildHatchery(); this.buildPodStation(); this.buildSignposts();
    await Promise.all([this.buildDinos(), this.buildStatue()]);
    this.buildEggs(); this.buildDecor();
  }
  add(o, x, y, z) { if (x !== undefined) o.position.set(x, y, z); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); this.scene.add(o); return o; }
  box(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }

  buildGate() {
    const z = PK.wallZ, wood = M(0x6b4a2e), dark = M(0x4a321f), stone = M(0x9a9184), g = new THREE.Group();
    for (const sx of [-1, 1]) {
      const pillar = this.box(3.2, 17, 3.2, stone, sx * 9.6, 8.5, 0); g.add(pillar);
      g.add(this.box(3.8, 1, 3.8, M(0x7d7468), sx * 9.6, 17.2, 0), this.box(4, 1.2, 4, M(0x7d7468), sx * 9.6, 0.6, 0));
      // torch
      const torch = new THREE.Group(); torch.position.set(sx * 9.6, 9, 1.9);
      torch.add(this.box(0.3, 1.4, 0.3, dark, 0, 0, 0));
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 7), new THREE.MeshBasicMaterial({ color: 0xffa21f }));
      flame.position.y = 1.2; torch.add(flame); g.add(torch);
      this.anims.push(t => { flame.scale.set(1 + Math.sin(t * 13 + sx) * 0.12, 1 + Math.sin(t * 17 + sx * 2) * 0.2, 1); });
    }
    g.add(this.box(23, 2.4, 2.2, wood, 0, 15.6, 0));
    // the big sign with her name
    const nm = (APP().park.name() || '').trim();
    const title = nm ? `${nm.toUpperCase()}${/s$/i.test(nm) ? "'" : "'S"} DINO PARK` : 'MY DINO PARK';
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.2), new THREE.MeshLambertMaterial({ map: signTex(title, { sub: '🦕  WHERE DINOSAURS LIVE AGAIN  🦖', h: 240 }) }));
    sign.position.set(0, 12.6, 1.2); g.add(sign);
    const back = sign.clone(); back.rotation.y = Math.PI; back.position.z = -1.2; g.add(back);
    // doors, hinged at the pillars, swing inwards
    this.doors = [];
    for (const sx of [-1, 1]) {
      const hinge = new THREE.Group(); hinge.position.set(sx * 7.9, 0, 0);
      const door = new THREE.Group();
      for (let i = 0; i < 9; i++) { const log = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 12, 7), i % 2 ? wood : dark); log.position.set(-sx * (0.45 + i * 0.86), 6, 0); door.add(log); }
      door.add(this.box(7.9, 0.6, 0.5, dark, -sx * 3.9, 3, 0.45), this.box(7.9, 0.6, 0.5, dark, -sx * 3.9, 9, 0.45));
      hinge.add(door); g.add(hinge); this.doors.push({ hinge, sx });
    }
    // ID scanner beside the path
    const scan = new THREE.Group(); scan.position.set(4.2, 0, 5);
    scan.add(this.box(0.8, 1.3, 0.6, M(0x3a4048), 0, 0.65, 0));
    this.scanLight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.05), new THREE.MeshBasicMaterial({ color: 0xff4040 }));
    this.scanLight.position.set(0, 1.1, 0.31); scan.add(this.scanLight); g.add(scan);
    this.add(g, 0, 0, z);
    // palisade wall of sharpened logs either side
    const n = 2 * 180, logG = new THREE.CylinderGeometry(0.45, 0.45, 9, 6), tipG = new THREE.ConeGeometry(0.46, 1.4, 6);
    const logs = new THREE.InstancedMesh(logG, wood, n), tips = new THREE.InstancedMesh(tipG, dark, n), m4 = new THREE.Matrix4();
    let k = 0;
    for (const sx of [-1, 1]) for (let i = 0; i < 180; i++) {
      const x = sx * (11.8 + i * 0.9), y = this.heightAt(x, z) - 0.5, hh = 1 + hash01(x, 3) * 0.12;
      m4.makeScale(1, hh, 1).setPosition(x, y + 4.5 * hh, z); logs.setMatrixAt(k, m4);
      m4.makeTranslation(x, y + 9 * hh + 0.7, z); tips.setMatrixAt(k, m4); k++;
    }
    logs.castShadow = tips.castShadow = true; this.scene.add(logs, tips);
  }
  buildAvenue() {
    const cols = [0xd8322b, 0xf2c230, 0x2d8a4e];
    for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) {
      const z = PK.wallZ - 8 - i * 9, x = sx * 6.5, y = this.heightAt(x, z);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 9, 6), M(0xdddddd)); pole.position.set(x, y + 4.5, z);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), new THREE.MeshLambertMaterial({ color: cols[(i + (sx > 0)) % 3], side: THREE.DoubleSide }));
      flag.position.set(x - sx * 0.8, y + 7, z); this.add(pole); this.add(flag);
      this.anims.push(t => { flag.rotation.y = Math.sin(t * 2.2 + i + sx) * 0.25; });
    }
    // lamp posts along the avenue and ring
    for (let i = 0; i < 10; i++) for (const sx of [-1, 1]) {
      const z = PK.wallZ - 4 - i * 8 - 3.5, x = sx * 4.2, y = this.heightAt(x, z);
      const g = new THREE.Group(); g.add(this.box(0.18, 4, 0.18, M(0x2c3238), 0, 2, 0));
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1b8 })); lamp.position.y = 4.1; g.add(lamp);
      this.add(g, x, y, z);
    }
  }
  buildPlaza() {
    const p = PK.plaza;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(p.r, 40), M(0xd9d0bd, { flatShading: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(p.x, 0.08, p.z); floor.receiveShadow = true; this.scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(p.r - 0.8, p.r, 40), M(0xb9ad95)); ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, 0.1, p.z); this.scene.add(ring);
    // fountain
    const f = new THREE.Group();
    f.add(new THREE.Mesh(new THREE.CylinderGeometry(5, 5.3, 0.9, 28), M(0xa89f90)));
    const water = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.2, 28), new THREE.MeshPhongMaterial({ color: 0x4aa8e0, shininess: 90, transparent: true, opacity: 0.85 }));
    water.position.y = 0.4; f.add(water);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 1.8, 12), M(0x9a9184)); ped.position.y = 1.2; f.add(ped);
    const jm = new THREE.MeshBasicMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.55 });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2, jet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.4, 6), jm);
      jet.position.set(Math.cos(a) * 3, 1.4, Math.sin(a) * 3); jet.rotation.z = Math.cos(a) * 0.35; jet.rotation.x = -Math.sin(a) * 0.35; f.add(jet);
      this.anims.push(t => { jet.scale.y = 0.85 + Math.sin(t * 6 + i) * 0.15; });
    }
    this.add(f, p.x, 0, p.z);
    this.statueSpot = new THREE.Vector3(p.x, 2.1, p.z);
    // benches
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + 0.26, b = new THREE.Group();
      b.add(this.box(2.4, 0.15, 0.6, M(0x8a5a32), 0, 0.55, 0), this.box(2.4, 0.6, 0.12, M(0x8a5a32), 0, 0.9, -0.3), this.box(0.15, 0.5, 0.5, M(0x333333), -1, 0.25, 0), this.box(0.15, 0.5, 0.5, M(0x333333), 1, 0.25, 0));
      b.rotation.y = -a + Math.PI / 2 + Math.PI; this.add(b, p.x + Math.cos(a) * (p.r - 3), 0, p.z + Math.sin(a) * (p.r - 3));
    }
  }
  async buildStatue() {
    // a stone statue of her favourite, Triceratops, on the fountain
    const D = await makeDino('triceratops'); if (!D || this.disposed) return;
    const stone = new THREE.MeshLambertMaterial({ color: 0xb7afa2 });
    D.obj.traverse(o => { if (o.isMesh) o.material = stone; });
    D.wrap.scale.setScalar(3.2 / D.size.z); D.wrap.position.copy(this.statueSpot); D.wrap.rotation.y = Math.PI * 0.85;
    D.wrap.remove(D.hit);
    D.actions.idle && (D.actions.idle.play(), D.mixer.update(0.2));
    this.add(D.wrap);
  }
  buildCentre() {
    const c = PK.centre, g = new THREE.Group(), white = M(0xf1efe8), glass = new THREE.MeshPhongMaterial({ color: 0x5aa7d6, shininess: 120, emissive: 0x0d2a40 });
    g.add(this.box(32, 9, 14, white, 0, 4.5, 0));
    g.add(this.box(26, 6.5, 0.3, glass, 0, 4.2, 7.1));
    for (let i = -6; i <= 6; i++) g.add(this.box(0.25, 6.6, 0.4, M(0xd9d6cf), i * 2.1, 4.2, 7.2));
    g.add(this.box(35, 0.8, 17, M(0x3a5a44), 0, 9.4, 0.4));
    g.add(this.box(12, 3, 10, white, 0, 11.2, 0));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9, 4, 4), M(0x3a5a44)); roof.rotation.y = Math.PI / 4; roof.position.y = 14.6; g.add(roof);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshLambertMaterial({ map: signTex('VISITOR CENTRE', { h: 160, bg: '#f5f1e6', fg: '#1f3b2a', border: '#2d8a4e' }) }));
    sign.position.set(0, 8.1, 7.35); g.add(sign);
    // a big dinosaur skeleton banner
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshLambertMaterial({ map: signTex('🦖', { w: 256, h: 384, size: 200, bg: '#b8312b', border: '#f2c230' }) }));
    ban.position.set(-13, 5, 7.4); g.add(ban); const ban2 = ban.clone(); ban2.position.x = 13; g.add(ban2);
    this.add(g, c.x, 0, c.z + 0);
  }
  buildPaddocks() {
    const wood = M(0x7a5634), post = new THREE.CylinderGeometry(0.16, 0.2, 2.4, 6), rail = new THREE.BoxGeometry(1, 0.16, 0.12);
    const ePost = new THREE.CylinderGeometry(0.2, 0.26, 6.5, 6), wire = new THREE.CylinderGeometry(0.035, 0.035, 1, 4);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    for (const f of this.fences) {
      if (f.key === 'aviary') continue;
      const electric = f.key === 'ridge', step = electric ? 4 : 3, n = Math.ceil(2 * Math.PI * f.r / step);
      const spots = [];
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (Math.abs(angDiff(a, f.gate)) < f.gap) continue; spots.push(a); }
      const posts = new THREE.InstancedMesh(electric ? ePost : post, electric ? M(0x55595e) : wood, spots.length);
      const rails = new THREE.InstancedMesh(electric ? wire : rail, electric ? new THREE.MeshBasicMaterial({ color: 0x333333 }) : wood, spots.length * (electric ? 4 : 2));
      let r = 0;
      spots.forEach((a, i) => {
        const x = f.x + Math.cos(a) * f.r, z = f.z + Math.sin(a) * f.r, y = this.heightAt(x, z);
        m4.makeTranslation(x, y + (electric ? 3.25 : 1.2), z); posts.setMatrixAt(i, m4);
        const b = a + Math.PI * 2 / n; if (Math.abs(angDiff(b, f.gate)) < f.gap) return;
        const x2 = f.x + Math.cos(b) * f.r, z2 = f.z + Math.sin(b) * f.r, y2 = this.heightAt(x2, z2);
        const mid = new THREE.Vector3((x + x2) / 2, 0, (z + z2) / 2), len = Math.hypot(x2 - x, z2 - z), yaw = Math.atan2(z2 - z, x2 - x);
        const hs = electric ? [1.4, 2.8, 4.2, 5.6] : [0.8, 1.7];
        for (const h of hs) {
          if (electric) { q.setFromUnitVectors(up, new THREE.Vector3(x2 - x, y2 - y, z2 - z).normalize()); m4.compose(new THREE.Vector3(mid.x, (y + y2) / 2 + h, mid.z), q, new THREE.Vector3(1, len, 1)); }
          else { q.setFromAxisAngle(up, -yaw); m4.compose(new THREE.Vector3(mid.x, (y + y2) / 2 + h, mid.z), q, new THREE.Vector3(len, 1, 1)); }
          rails.setMatrixAt(r++, m4);
        }
      });
      rails.count = r; posts.castShadow = true; this.scene.add(posts, rails);
      // entrance arch with the zone's name
      const gx = f.x + Math.cos(f.gate) * f.r, gz = f.z + Math.sin(f.gate) * f.r, gy = this.heightAt(gx, gz);
      const arch = new THREE.Group(), side = new THREE.Vector3(-Math.sin(f.gate), 0, Math.cos(f.gate)), w = f.gap * f.r;
      for (const s of [-1, 1]) { const p = this.box(0.9, 7, 0.9, electric ? M(0x55595e) : wood, side.x * s * (w + 0.3), 3.5, side.z * s * (w + 0.3)); arch.add(p); }
      const sgn = new THREE.Mesh(new THREE.PlaneGeometry(w * 2 + 2, 2.2), new THREE.MeshLambertMaterial({ map: signTex(`${f.e} ${f.name.toUpperCase()}`, { h: 170, bg: electric ? '#3a2323' : '#1f3b2a', border: electric ? '#f2c230' : '#f2c230' }), side: THREE.DoubleSide }));
      sgn.position.y = 6.6; sgn.rotation.y = -f.gate + Math.PI / 2; arch.add(sgn);
      if (electric) for (const s of [-1, 1]) { const warn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: signTex('⚡', { w: 256, h: 256, size: 170, bg: '#f2c230', fg: '#111', border: '#111' }), side: THREE.DoubleSide })); warn.position.set(side.x * s * (w + 0.3), 3, side.z * s * (w + 0.3)); warn.rotation.y = -f.gate + Math.PI / 2; warn.position.addScaledVector(new THREE.Vector3(Math.cos(f.gate), 0, Math.sin(f.gate)), 0.5); arch.add(warn); }
      this.add(arch, gx, gy, gz);
    }
    // lookout platform over Predator Ridge
    const lk = PK.lookout, g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(lk.r + 0.4, lk.r + 0.6, 0.4, 20), M(0x8a6a45)));
    const railM = M(0x5a4030);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; if (Math.abs(angDiff(a, Math.atan2(PK.plaza.z - lk.z, PK.plaza.x - lk.x))) < 0.5) continue; g.add(this.box(0.15, 1.1, 0.15, railM, Math.cos(a) * (lk.r + 0.3), 0.75, Math.sin(a) * (lk.r + 0.3))); }
    const tor = new THREE.Mesh(new THREE.TorusGeometry(lk.r + 0.3, 0.07, 4, 32), railM); tor.rotation.x = Math.PI / 2; tor.position.y = 1.3; g.add(tor);
    const ls = labelSprite('🔭 Lookout', { w: 5 }); ls.position.y = 3.2; g.add(ls);
    this.add(g, lk.x, lk.h + 0.05, lk.z);
  }
  buildLagoonPier() {
    const g = new THREE.Group(), deck = M(0x9a7550), z0 = this.pierZ0, z1 = this.pierZ1;
    const len = z0 - z1;
    g.add(this.box(3.6, 0.3, len, deck, 0, 0.45, (z0 + z1) / 2));
    for (let z = z0; z >= z1; z -= 4) for (const sx of [-1, 1]) g.add(this.box(0.3, 3.4, 0.3, M(0x5a4030), sx * 1.7, -1, z));
    for (const sx of [-1, 1]) g.add(this.box(0.12, 0.12, len, M(0x5a4030), sx * 1.75, 1.4, (z0 + z1) / 2));
    for (let z = z0; z >= z1; z -= 2) for (const sx of [-1, 1]) g.add(this.box(0.1, 0.9, 0.1, M(0x5a4030), sx * 1.75, 1, z));
    const ls = labelSprite('🌊 The Lagoon', { w: 4 }); ls.position.set(0, 5.5, z0 + 4); g.add(ls);
    this.add(g, PK.lagoon.x, 0, 0);
  }
  buildAviary() {
    const a = PK.aviary, g = new THREE.Group(), geo = new THREE.IcosahedronGeometry(a.r, 2), pos = geo.attributes.position;
    const strutM = M(0xe8e8e8), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), seen = new Set(), struts = [];
    const doorA = this.fences.find(f => f.key === 'aviary').gate;
    for (let i = 0; i < pos.count; i += 3) for (let k = 0; k < 3; k++) {
      v1.fromBufferAttribute(pos, i + k); v2.fromBufferAttribute(pos, i + (k + 1) % 3);
      if (v1.y < -0.1 && v2.y < -0.1) continue;
      const key = [v1, v2].map(v => v.toArray().map(n => n.toFixed(1)).join(',')).sort().join('|'); if (seen.has(key)) continue; seen.add(key);
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      if (mid.y < 3.2 && Math.abs(angDiff(Math.atan2(mid.z, mid.x), doorA)) < 0.28) continue;   // the doorway
      struts.push([v1.clone(), v2.clone()]);
    }
    const sg = new THREE.CylinderGeometry(0.09, 0.09, 1, 5), inst = new THREE.InstancedMesh(sg, strutM, struts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    struts.forEach(([p, q2], i) => { const d = q2.clone().sub(p); q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); m4.compose(p.clone().add(q2).multiplyScalar(0.5), q, new THREE.Vector3(1, d.length(), 1)); inst.setMatrixAt(i, m4); });
    g.add(inst);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(a.r - 0.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.12, shininess: 120, depthWrite: false, side: THREE.DoubleSide }));
    g.add(glass);
    const ls = labelSprite('🦅 The Aviary', { w: 6 }); ls.position.set(Math.cos(doorA) * (a.r + 1), 5, Math.sin(doorA) * (a.r + 1)); g.add(ls);
    // perches inside
    for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 7 + i * 2, 6), M(0x6b4a2e)); const an = i * 2.1; t.position.set(Math.cos(an) * 6, (7 + i * 2) / 2, Math.sin(an) * 6); g.add(t); }
    this.add(g, a.x, 0, a.z);
  }
  buildSignposts() {
    const p = PK.plaza, g = new THREE.Group();
    g.add(this.box(0.35, 6, 0.35, M(0x6b4a2e), 0, 3, 0));
    const places = [['🌿 Meadow', PK.meadow], ['🦖 Predator Ridge', PK.ridge], ['🌊 Lagoon', PK.lagoon], ['🦅 Aviary', PK.aviary], ['🥚 Hatchery', PK.hatch], ['🔵 Gyrospheres', PK.pods]];
    places.forEach(([t, o], i) => {
      const board = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.8), new THREE.MeshLambertMaterial({ map: signTex(t, { w: 512, h: 112, bg: '#f5ecd2', fg: '#3a2a18', border: '#6b4a2e' }), side: THREE.DoubleSide }));
      const yaw = Math.atan2(o.z - (p.z + 10), o.x - (p.x + 9));
      const arm = new THREE.Group(); arm.position.y = 5.3 - i * 0.85; arm.rotation.y = -yaw; board.position.x = 1.9; arm.add(board); g.add(arm);
    });
    this.add(g, p.x + 9, 0, p.z + 10);
  }
  buildHatchery() {
    const h = PK.hatch, g = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(h.r, h.r + 0.3, 0.3, 24), M(0xc9a978)); floor.position.y = 0.15; g.add(floor);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; g.add(this.box(0.4, 6, 0.4, M(0xf1efe8), Math.cos(a) * (h.r - 0.5), 3, Math.sin(a) * (h.r - 0.5))); }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(h.r + 1.5, 4.5, 8, 1, true), new THREE.MeshPhongMaterial({ color: 0xbfe3f5, transparent: true, opacity: 0.35, shininess: 100, side: THREE.DoubleSide, depthWrite: false }));
    roof.position.y = 8.2; g.add(roof);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(h.r + 1.4, 0.18, 5, 32), M(0xf1efe8)); rim.rotation.x = Math.PI / 2; rim.position.y = 6; g.add(rim);
    const ls = labelSprite('🥚 The Hatchery', { w: 7 }); ls.position.y = 11.8; g.add(ls);
    // the egg delivery board, facing the path
    const face = Math.atan2(PK.plaza.z - h.z, PK.plaza.x - h.x);
    const board = new THREE.Group(); board.position.set(Math.cos(face) * (h.r + 1.5), 0, Math.sin(face) * (h.r + 1.5)); board.rotation.y = -face + Math.PI / 2;
    board.add(this.box(0.2, 3, 0.2, M(0x6b4a2e), -1.4, 1.5, 0), this.box(0.2, 3, 0.2, M(0x6b4a2e), 1.4, 1.5, 0));
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.7), new THREE.MeshLambertMaterial({ map: signTex('🥚 ORDER AN EGG', { w: 512, h: 272, sub: 'tap here', bg: '#fff6de', fg: '#8a4a12', border: '#e08a2a', subCol: '#8a4a12' }), side: THREE.DoubleSide }));
    bm.position.y = 2.6; board.add(bm); g.add(board);
    this.boardHit = bm;
    // nests with heat lamps
    this.nests = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, r = i % 2 ? 6.5 : 4, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const nest = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.3, 6, 14), M(0xb8904a)); nest.rotation.x = Math.PI / 2; nest.position.set(x, 0.45, z); g.add(nest);
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.5, 10, 1, true), M(0x444444, { side: THREE.DoubleSide })); lamp.position.set(x, 3.2, z); g.add(lamp);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff9a3a })); bulb.position.set(x, 3.0, z); g.add(bulb);
      g.add(this.box(0.05, 2.8, 0.05, M(0x444444), x, 4.8, z));
      this.nests.push({ pos: new THREE.Vector3(h.x + x, 0.55, h.z + z), bulb });
    }
    this.add(g, h.x, 0, h.z);
  }
  eggColour(id) {
    const c = BY_ID[id]; const k = hash01(c.len, c.mya);
    return new THREE.Color().setHSL(c.diet === 'meat' ? 0.03 + k * 0.05 : 0.2 + k * 0.2, 0.45, 0.62);
  }
  buildEggs() {
    for (const m of this.eggMeshes) this.scene.remove(m.mesh);
    this.eggMeshes = [];
    // more eggs than nests: the rest wait their turn, and a sign says how many
    const all = APP().park.eggs(), wait = all.length - this.nests.length;
    if (this.waitSign) { this.scene.remove(this.waitSign); this.waitSign = null; }
    if (wait > 0) { this.waitSign = labelSprite(`🥚 ${wait} more ${wait === 1 ? 'egg is' : 'eggs are'} waiting for a nest`, { w: 8, bg: 'rgba(160,90,20,0.85)' }); this.waitSign.position.set(PK.hatch.x, 9.8, PK.hatch.z); this.scene.add(this.waitSign); }
    APP().park.eggs().slice(0, this.nests.length).forEach((e, i) => {
      const n = this.nests[i], mesh = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshLambertMaterial({ color: this.eggColour(e.id) }));
      shell.scale.set(1, 1.35, 1); shell.position.y = 0.6; shell.castShadow = true; mesh.add(shell);
      for (let s = 0; s < 7; s++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), M(0x6b4a2e)); const a = s * 2.4, b = (s / 7 - 0.5) * 2; sp.position.set(Math.cos(a) * 0.47 * Math.cos(b * 0.6), 0.6 + b * 0.5, Math.sin(a) * 0.47 * Math.cos(b * 0.6)); mesh.add(sp); }
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffb14a, transparent: true, opacity: 0, depthWrite: false })); glow.position.y = 0.6; glow.scale.y = 1.3; mesh.add(glow);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.7; mesh.add(hit);
      mesh.position.copy(n.pos); this.scene.add(mesh);
      const E = { e, mesh, glow, hit, nest: n, wob: 0 }; hit.userData.egg = E; this.eggMeshes.push(E);
      n.bulb.material.color.set(0xffc36a);
    });
  }
  buildPodStation() {
    const s = PK.pods, g = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.3, 0.3, 28), M(0x9aa3ab)); pad.position.y = 0.15; g.add(pad);
    for (const sx of [-1, 1]) g.add(this.box(0.3, 4.5, 0.3, M(0xe8e8e8), sx * 5.5, 2.25, -3.5));
    g.add(this.box(12, 0.25, 5, M(0xe0703a), 0, 4.6, -3.5));
    const ls = labelSprite('🔵 Gyrospheres', { w: 4.5 }); ls.position.set(0, 7.2, -3.5); g.add(ls);
    this.add(g, s.x, 0, s.z);
    for (let i = 0; i < 3; i++) this.pods.push(this.makePod(s.x - 3.5 + i * 3.5, s.z + 0.5));
  }
  makePod(x, z) {
    const wrap = new THREE.Group(), R = 1.7;
    const ball = new THREE.Group(); ball.position.y = R; wrap.add(ball);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 16), new THREE.MeshPhongMaterial({ color: 0xa8dcff, emissive: 0x16384f, transparent: true, opacity: 0.38, shininess: 160, specular: 0xffffff, depthWrite: false }));
    ball.add(glass);
    const ringM = M(0xe0703a, { flatShading: false });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.12, 8, 32), ringM); ring.rotation.y = Math.PI / 2; ball.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(R, 0.09, 8, 32), M(0xffffff, { flatShading: false })); ball.add(ring2);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(R + 0.02, 0.07, 6, 32), M(0x333333)); belt.rotation.x = Math.PI / 2; wrap.add(belt); belt.position.y = R;
    const seat = new THREE.Group(); seat.position.y = R - 0.6;
    seat.add(this.box(0.9, 0.2, 0.8, M(0x2c3238), 0, 0, 0), this.box(0.9, 0.9, 0.18, M(0x2c3238), 0, 0.45, -0.35));
    wrap.add(seat);
    wrap.position.set(x, this.heightAt(x, z), z); this.scene.add(wrap);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = R; wrap.add(hit);
    const P = { id: 'pod', c: { name: 'Gyrosphere', len: 3.4 }, def: { pod: true }, wrap, ball, obj: ball, actions: {}, legBones: [], size: new THREE.Vector3(3.4, 3.4, 3.4), radius: 1.9, yaw: 0, seatBack: new THREE.Vector3(0, R - 0.5, 0.05), hit };
    hit.userData.pod = P;
    return P;
  }

  // ---------- her dinosaurs ----------
  zoneOf(id) {
    const d = MODEL_DEFS[id]; if (d.swim) return 'lagoon'; if (d.fly) return 'aviary';
    return BY_ID[id].diet === 'meat' ? 'ridge' : 'meadow';
  }
  babyScale(p) { return p.grown ? 1 : 0.35 + 0.035 * Math.min(10, p.friend); }
  async buildDinos() {
    const list = APP().park.list();
    await Promise.all(list.map(p => this.addParkDino(p)));
  }
  async addParkDino(p, at) {
    if (!MODEL_DEFS[p.id]) return null;
    const D = await makeDino(p.id, this.R); if (!D || this.disposed) return null;
    D.p = p; D.full = D.size.clone(); D.fullR = D.radius;
    this.setGrowth(D, this.babyScale(p));
    const z = PK[this.zoneOf(p.id)], def = D.def, R = this.R;
    if (def.swim) { D.home = new THREE.Vector3(this.lake.x, 0, this.lake.z); D.range = this.lake.r - 5; }
    else if (def.fly) { D.home = new THREE.Vector3(z.x, 0, z.z); D.range = z.r * 0.5; D.alt = rand(5, 11); D.ang = R() * 6.28; D.dir = R() < 0.5 ? 1 : -1; }
    else { const a = R() * 6.28, rr = R() * z.r * 0.45; D.home = new THREE.Vector3(z.x + Math.cos(a) * rr, 0, z.z + Math.sin(a) * rr); D.range = Math.max(4, z.r * 0.62 - D.fullR * 0.5); }
    D.wrap.position.copy(at || D.home);
    if (def.fly) D.wrap.position.y = D.alt; else if (def.swim) D.wrap.position.y = -0.9 - D.size.y * 0.35; else D.wrap.position.y = this.heightAt(D.wrap.position.x, D.wrap.position.z);
    this.play(D, def.fly ? 'fly' : 'idle');
    if (def.fly && D.actions.fly) D.actions.fly.timeScale = 1.4;
    this.nameTag(D);
    this.scene.add(D.wrap); this.dinos.push(D);
    return D;
  }
  setGrowth(D, k) {
    D.grow = k; D.wrap.scale.setScalar(k);
    D.size = D.full.clone().multiplyScalar(k); D.radius = D.fullR * k;
    if (D.hit) { if (!D.hitBase) D.hitBase = D.hit.scale.clone(); const m = 3 / k; D.hit.scale.set(Math.max(D.hitBase.x, m), Math.max(D.hitBase.y, m), Math.max(D.hitBase.z, m)); }
    if (D.tag) D.tag.position.y = D.full.y + 0.6 / k;
    if (D.tag) D.tag.scale.set(3.4 / k, 0.85 / k, 1);
  }
  nameTag(D) {
    if (D.tag) D.wrap.remove(D.tag);
    const p = D.p, t = `${p.nick || APP().nick(D.c)}${p.grown ? '' : ' 🍼'}`;
    D.tag = labelSprite(t, { w: 3.4 }); D.tag.userData.dino = D; D.wrap.add(D.tag); this.setGrowth(D, D.grow);
  }

  // ---------- arriving: the ranger ID card opens the gate ----------
  afterBuild() {
    this.updateCount(); this.updateMission();
    const h = this.host, idc = h.querySelector('.pk-id'), st = APP().park.stats(), nm = APP().park.name() || 'Explorer';
    const since = new Date(st.since || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    idc.innerHTML = `
      <div class="id-card">
        <div class="id-top"><span>🦕 DINO PARK</span><b>RANGER</b></div>
        <div class="id-body">
          <div class="id-photo">👧</div>
          <div class="id-info"><div class="id-name">${esc3(nm)}</div><div>Park Ranger since ${esc3(since)}</div><div>🦕 ${st.met} dinosaurs met</div><div>💚 ${st.friends} park friends</div></div>
        </div>
        <div class="id-code"></div>
      </div>
      <p class="id-help">Tap your card to scan it at the gate! ${APP().spk(`Welcome, Ranger ${nm}! Tap your card to scan it and open the gate.`)}</p>`;
    idc.classList.remove('hidden');
    idc.querySelector('.id-card').onclick = () => {
      if (idc.classList.contains('scanning')) return;
      idc.classList.add('scanning'); APP().sfx('pop');
      setTimeout(() => {
        this.scanLight.material.color.set(0x3ad35a); APP().sfx('good');
        idc.querySelector('.id-help').innerHTML = '✅ <b>Access granted!</b> Welcome to your park!';
        this.doorWant = 1; this.camEase = true;
        if (!APP().getFlag('park_scan')) { APP().setFlag('park_scan'); }
        this.updateMission();
        setTimeout(() => idc.classList.add('hidden'), 1300);
      }, 900);
    };
  }

  // ---------- tapping things ----------
  tap(x, y) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(v, this.camera);
    if (this.decorating) return this.decorTap(ray);
    const targets = [...this.dinos.map(d => d.hit), ...this.dinos.filter(d => d.tag).map(d => d.tag), ...this.eggMeshes.map(e => e.hit), ...this.pods.map(p => p.hit), this.boardHit];
    const hit = ray.intersectObjects(targets, false)[0];
    if (hit) {
      const o = hit.object;
      if (o.userData.dino) return this.openCare(o.userData.dino);
      if (o.userData.egg) return this.warmEgg(o.userData.egg);
      if (o.userData.pod) return this.near(o.userData.pod.wrap.position, 8) ? this.enterPod(o.userData.pod) : this.walkTo(o.userData.pod.wrap.position, 2.5);
      if (o === this.boardHit) return this.near(new THREE.Vector3(PK.hatch.x, 0, PK.hatch.z), PK.hatch.r + 6) ? this.orderEgg() : this.walkTo(this.boardHit.getWorldPosition(new THREE.Vector3()), 2);
    }
    if (this.riding) return;
    const th = ray.intersectObject(this.terrain, false);
    if (th.length) { const p = th[0].point; if (Math.hypot(p.x, p.z) < EDGE) this.moveTarget = p.clone(); }
  }
  near(p, d) { return Math.hypot(p.x - this.player.position.x, p.z - this.player.position.z) < d; }
  walkTo(p, stop) {
    if (this.riding) return;
    const P = this.player.position, d = new THREE.Vector3(p.x - P.x, 0, p.z - P.z), L = d.length();
    if (L > stop) this.moveTarget = new THREE.Vector3(P.x + d.x / L * (L - stop), 0, P.z + d.z / L * (L - stop));
  }

  // ---------- eggs ----------
  orderEgg() {
    const ids = APP().park.candidates();
    const panel = this.host.querySelector('.pk-panel');
    if (!ids.length) { APP().toast(APP().park.stats().met ? '🥚 Every dinosaur you have met is already in your park! Meet more in the Time Machine.' : '🥚 Meet dinosaurs in the Time Machine first, then order their eggs here!', 4200); return; }
    if (this.eggMeshes.length >= this.nests.length) { APP().toast('🥚 All the nests are full! Hatch some eggs first.'); return; }
    panel.innerHTML = `<div class="pk-head"><b>🥚 Order an egg</b><button class="pk-x" aria-label="Close">✕</button></div>
      <p class="pk-sub">Pick a dinosaur you have met. ${APP().spk('Pick a dinosaur you have met. Its egg will go into a warm nest. Sea reptiles swim straight to the lagoon!')}</p>
      <div class="pk-grid">${ids.map(id => `<button class="pk-pick" data-id="${id}"><b>${esc3(BY_ID[id].short || BY_ID[id].name)}</b><small>${MODEL_DEFS[id] && MODEL_DEFS[id].swim ? '🌊 lagoon' : '🥚 egg'}</small></button>`).join('')}</div>`;
    panel.classList.remove('hidden');
    panel.querySelector('.pk-x').onclick = () => panel.classList.add('hidden');
    panel.querySelectorAll('.pk-pick').forEach(b => b.onclick = async () => {
      panel.classList.add('hidden');
      const r = APP().park.takeEgg(b.dataset.id); if (!r) return;
      if (r.egg) { APP().sfx('pop'); this.buildEggs(); APP().toast(`🥚 A ${esc3(APP().nick(BY_ID[r.egg.id]))} egg is in a warm nest! Tap it to help it hatch.`, 3800); }
      else { APP().sfx('splash'); await this.addParkDino(r.sea); APP().toast(`🌊 A baby ${esc3(APP().nick(BY_ID[r.sea.id]))} is swimming in the Lagoon! Sea reptiles had live babies, just like dolphins.`, 4600); }
      this.updateCount(); this.updateMission();
    });
  }
  async warmEgg(E) {
    if (!this.near(E.mesh.position, 7)) { this.walkTo(E.mesh.position, 2); return; }
    const r = APP().park.warm(E.e.uid); if (!r) return;
    E.wob = 1; this.hearts(E.mesh.position.clone().setY(1.6), ['🔥', '💛', '✨'], 3);
    if (r.warm) { APP().sfx(r.warm >= 2 ? 'crack' : 'pop'); E.glow.material.opacity = 0.12 * r.warm; return; }
    APP().sfx('hatch');
    const pos = E.mesh.position.clone();
    this.scene.remove(E.mesh); this.eggMeshes = this.eggMeshes.filter(x => x !== E); E.nest.bulb.material.color.set(0xff9a3a);
    this.hearts(pos.clone().setY(1.2), ['🎉', '⭐', '🐣'], 10);
    if (APP().park.eggs().length > this.eggMeshes.length) this.buildEggs();
    const D = await this.addParkDino(r.hatched, pos);
    if (D) { D.busy = true; this.faceEachOther(D); }
    this.updateCount(); this.updateMission();
    APP().park.nameBaby(r.hatched.uid, true, () => {
      if (!D) return;
      this.nameTag(D);
      const zn = this.zoneOf(D.id), z = PK[zn];
      APP().toast(`🐣 ${esc3(r.hatched.nick || APP().nick(D.c))} is off to its new home: ${z.e} ${z.name}! Use the 🗺️ map to visit.`, 4200);
      setTimeout(() => { if (this.disposed) return; D.wrap.position.copy(D.home); D.wrap.position.y = D.def.fly ? D.alt : this.heightAt(D.home.x, D.home.z); D.busy = false; }, 1600);
    });
  }

  // ---------- caring ----------
  openCare(D) {
    if (this.riding === D) return;
    this.careD = D; D.busy = true; D.state = 'idle'; this.play(D, D.def.fly ? 'fly' : 'idle'); D.moveSpeed = 0;
    if (!D.def.fly && !D.def.swim) this.walkTo(D.wrap.position, D.radius + 2.2);
    if (D.def.swim) this.comeToHer(D);
    this.drawCare();
  }
  // a swimmer comes to the water's edge nearest her (or beside the pier)
  waterSpotNear(D) {
    const P = this.player.position, dx = P.x - this.lake.x, dz = P.z - this.lake.z, dl = Math.hypot(dx, dz) || 1;
    const r = Math.max(2, Math.min(dl - 2 - D.radius * 0.6, this.lake.r - 3 - D.radius * 0.4));
    // spread out along the shore so she can pick the one she wants (the one she is caring for comes straight to her)
    const swimmers = this.dinos.filter(o => o.def.swim), i = swimmers.indexOf(D);
    let a = Math.atan2(dz, dx);
    if (this.careD !== D && swimmers.length > 1) a += ((i - (swimmers.length - 1) / 2) * (10 + D.radius)) / Math.max(r, 10);
    return new THREE.Vector3(this.lake.x + Math.cos(a) * r, 0, this.lake.z + Math.sin(a) * r);
  }
  comeToHer(D) {
    const spot = this.waterSpotNear(D);
    D.state = 'walk'; D.target.copy(spot); D.arriveAt = 1.2; D.walkSpeed = 9; D.busy = false; this.play(D, D.actions.swim ? 'swim' : 'walk');
    D.onArrive = () => { D.busy = this.careD === D; if (D.busy) this.faceEachOther(D); };
  }
  closeCare() { const D = this.careD; if (D) D.busy = false; this.careD = null; this.host.querySelector('.pk-care').classList.add('hidden'); this.host.classList.remove('caring'); }
  drawCare(msg) {
    const D = this.careD, p = D.p, box = this.host.querySelector('.pk-care'), c = D.c;
    const n = Math.floor(Math.min(10, p.friend) / 2), rideOk = p.grown && RIDE_OK(D);
    const title = p.nick ? `${esc3(p.nick)} <small>the ${esc3(APP().nick(c))}</small>` : esc3(c.name);
    msg = msg || (p.grown ? `${p.nick || 'Your ' + APP().nick(c)} is all grown up!` : `Care for your baby to help it grow up big!`);
    box.innerHTML = `<div class="pk-head"><b>${title}</b><span class="pk-hearts">${'❤️'.repeat(n)}${'🤍'.repeat(5 - n)} ${p.grown ? '🦕' : '🍼'}</span><button class="pk-x" aria-label="Close">✕</button></div>
      <div class="pk-msg"><p>${esc3(msg)}</p>${APP().spk(msg)}</div>
      <div class="pk-btns">
        <button data-a="feed"><span>🍽️</span>Feed</button><button data-a="bath"><span>${c.kind === 'sea' ? '🌊' : '🫧'}</span>${c.kind === 'sea' ? 'Splash' : 'Bath'}</button>
        <button data-a="play"><span>⚽</span>Play</button><button data-a="cuddle"><span>🤗</span>Cuddle</button>${APP().hasMovie(c) ? '<button data-a="movie"><span>🎬</span>Roar</button>' : ''}<button data-a="call"><span>📣</span>${APP().hasMovie(c) ? 'Real' : 'Call'}</button>
        ${rideOk ? (D.def.swim ? '<button data-a="ride"><span>🌊</span>Swim</button>' : D.def.fly ? '<button data-a="ride"><span>🦅</span>Fly</button>' : '<button data-a="ride"><span>🦕</span>Ride</button>') : ''}<button data-a="name"><span>✏️</span>Name</button><button data-a="facts"><span>📖</span>Facts</button>
      </div><div class="pk-foods hidden"></div>`;
    box.classList.remove('hidden'); this.host.classList.add('caring');
    box.querySelector('.pk-x').onclick = () => this.closeCare();
    box.querySelectorAll('.pk-btns button').forEach(b => b.onclick = () => this.careAction(b.dataset.a));
  }
  careAction(a) {
    const D = this.careD; if (!D) return;
    if (a === 'facts') { APP().park.facts(D.id); return; }
    if (a === 'name') { APP().park.nameBaby(D.p.uid, false, () => { this.nameTag(D); if (this.careD === D) this.drawCare(); }); return; }
    if (a === 'ride') { this.closeCare(); this.startRide(D); return; }
    if (a === 'call') { this.callOut(D); return; }
    if (a === 'movie') { this.callOut(D, true); return; }
    if (a === 'feed') {
      const box = this.host.querySelector('.pk-foods');
      box.innerHTML = `<p>What did ${esc3(APP().nick(D.c))} eat? ${APP().spk(`What did ${APP().nick(D.c)} eat?`)}</p><div class="pk-food">${APP().park.foods().map(f => `<button data-k="${f.k}"><span>${f.e}</span>${esc3(f.name)}</button>`).join('')}</div>`;
      box.classList.toggle('hidden');
      box.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => {
        const r = APP().park.care(D.p.uid, 'feed', b.dataset.k);
        if (r.wrong) { APP().sfx('oops'); b.disabled = true; b.classList.add('nope'); this.say(r.msg); return; }
        box.classList.add('hidden'); this.doFeed(D, APP().park.foods().find(f => f.k === b.dataset.k)); this.afterCare(D, r, 'fed');
      });
      return;
    }
    const r = APP().park.care(D.p.uid, a); if (!r) return;
    if (a === 'bath') this.doBath(D); else if (a === 'play') this.doPlay(D); else this.doCuddle(D);
    this.afterCare(D, r, a);
  }
  say(msg) { const m = this.host.querySelector('.pk-msg'); if (m) m.innerHTML = `<p>${esc3(msg)}</p>${APP().spk(msg)}`; }
  afterCare(D, r, what) {
    const key = { fed: 'park_fed', bath: 'park_bath', play: 'park_play', cuddle: 'park_cuddle' }[what];
    if (key && !APP().getFlag(key)) APP().setFlag(key);
    if (this.careD === D) this.drawCare(r.msg);
    if (!r.grew) this.growTo(D, this.babyScale(D.p), 1.2);
    else {
      APP().sfx('star');
      this.growTo(D, 1, 2.5);
      setTimeout(() => { if (this.disposed) return; this.nameTag(D); this.hearts(D.wrap.position.clone().setY(D.full.y + 1), ['🎉', '⭐', '✨', '🦕'], 16); APP().celebrate(`${D.p.nick || APP().nick(D.c)} is all grown up!`, RIDE_OK(D) ? 'Look how big it is now! Your grown-up dinosaur can carry you. Tap it and choose Ride!' : 'Look how big it is now! Thank you for taking such good care of it.'); if (this.careD === D) this.drawCare(); }, 2600);
    }
    this.updateMission();
  }
  growTo(D, k, secs) { D.growFrom = D.grow; D.growTo = k; D.growT = 0; D.growS = secs; }
  faceEachOther(D) {
    const P = this.player.position, a = Math.atan2(P.x - D.wrap.position.x, P.z - D.wrap.position.z); D.yaw = a; D.wrap.rotation.y = a;
  }
  // in front of the dinosaur, towards her
  spotNear(D, extra = 1.5) {
    const P = this.player.position, d = new THREE.Vector3(P.x - D.wrap.position.x, 0, P.z - D.wrap.position.z).normalize();
    return D.wrap.position.clone().addScaledVector(d, D.radius + extra);
  }
  doFeed(D, f) {
    APP().sfx('munch');
    const spot = D.def.fly || D.def.swim ? this.player.position.clone().add(new THREE.Vector3(Math.sin(this.player.rotation.y) * 2, 0, Math.cos(this.player.rotation.y) * 2)) : this.spotNear(D, 1.2);
    spot.y = this.heightAt(spot.x, spot.z);
    const trough = new THREE.Group();
    trough.add(this.box(1.8, 0.5, 0.9, M(0x7a5634), 0, 0.25, 0));
    const col = { ferns: 0x3f8f3a, leaves: 0x2f6b3a, seeds: 0x8a5a32, bugs: 0x333333, meat: 0xb8312b, fish: 0x9fb8c8, squid: 0xe9a0b0 }[f.k] || 0x4f9a45;
    for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), M(col)); b.position.set((i % 3 - 1) * 0.45, 0.55 + (i > 5 ? 0.15 : 0), (Math.floor(i / 3) - 1) * 0.22); trough.add(b); }
    const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(f.e), depthWrite: false })); icon.scale.setScalar(0.9); icon.position.y = 1.6; trough.add(icon);
    this.add(trough, spot.x, spot.y, spot.z);
    this.fx.push({ obj: trough, life: 9, max: 9, fade: false, spin: icon });
    if (D.def.fly || D.def.swim) { this.hearts(D.wrap.position.clone().add(new THREE.Vector3(0, D.size.y, 0)), ['😋', f.e, '💚'], 6); return; }
    D.busy = false; D.state = 'walk'; D.target.set(spot.x, 0, spot.z); D.arriveAt = D.radius * 0.8 + 0.8; D.walkSpeed = clamp(D.full.z * 0.2, 1.2, 3);
    this.play(D, 'walk');
    D.onArrive = () => {
      D.busy = true; this.play(D, D.actions.eat ? 'eat' : 'idle'); D.chew = 3.5;
      this.hearts(spot.clone().setY(spot.y + 1.2), ['😋', f.e, '💚'], 7);
      setTimeout(() => { if (!this.disposed) { D.busy = this.careD === D; this.play(D, 'idle'); } }, 3600);
    };
  }
  doBath(D) {
    APP().sfx('splash');
    const P = this.player.position, from = new THREE.Vector3(P.x, P.y + 0.9, P.z), to = D.wrap.position.clone().setY(D.wrap.position.y + D.size.y * 0.7);
    this.player.rotation.y = Math.atan2(to.x - P.x, to.z - P.z);
    const dropM = new THREE.MeshBasicMaterial({ color: 0x5ab8ff, transparent: true, opacity: 0.9 }), bubM = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, shininess: 120 });
    for (let i = 0; i < 90; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 5, 4), dropM);
      d.position.copy(from); d.visible = false; this.scene.add(d);
      const delay = i * 0.035, dur = 0.7, spread = new THREE.Vector3(rand(-0.6, 0.6), rand(-0.3, 0.5), rand(-0.6, 0.6)).multiplyScalar(Math.max(1, D.size.y * 0.3));
      this.fx.push({ obj: d, life: delay + dur, max: delay + dur, fly: { from, to: to.clone().add(spread), delay, dur, arc: 1.5 + D.size.y * 0.3 } });
    }
    for (let i = 0; i < 26; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(rand(0.2, 0.45) * Math.max(1, D.size.y * 0.25), 8, 6), bubM.clone());
      b.position.copy(D.wrap.position).add(new THREE.Vector3(rand(-1, 1) * D.size.x * 0.6, rand(0.2, 1) * D.size.y, rand(-1, 1) * D.size.z * 0.4)); b.visible = false; this.scene.add(b);
      this.fx.push({ obj: b, life: 5, max: 5, delay: 1 + i * 0.05, vel: new THREE.Vector3(0, rand(0.3, 0.7), 0), fade: true });
    }
    this.play(D, D.actions.roar ? 'roar' : 'idle'); setTimeout(() => { if (!this.disposed) this.play(D, D.def.fly ? 'fly' : 'idle'); }, 1500);
  }
  doPlay(D) {
    APP().sfx('boing');
    const P = this.player.position, dir = new THREE.Vector3(D.wrap.position.x - P.x, 0, D.wrap.position.z - P.z).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(rand(-4, 4));
    const land = D.wrap.position.clone().addScaledVector(dir, D.radius + 7).add(side); land.y = this.heightAt(land.x, land.z);
    if (this.inLake(land, -2) && !D.def.swim) land.copy(D.wrap.position).addScaledVector(dir, -(D.radius + 3));
    const ballTex = canvasTex(128, 64, (g) => { const cs = ['#e8322b', '#ffffff', '#2d6fe0', '#ffffff', '#f2c230', '#ffffff']; cs.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 64 / 6, 128, 64 / 6 + 1); }); });
    const R = 0.35 * Math.max(1, D.size.y * 0.25), ball = new THREE.Mesh(new THREE.SphereGeometry(R, 16, 12), new THREE.MeshLambertMaterial({ map: ballTex }));
    ball.castShadow = true; this.scene.add(ball);
    const from = new THREE.Vector3(P.x, P.y + 1.2, P.z), to = land.clone().setY(land.y + R);
    this.fx.push({ obj: ball, life: 14, max: 14, fly: { from, to, delay: 0, dur: 1.1, arc: 5 }, ball: true, R });
    if (D.def.fly || D.def.swim) { setTimeout(() => this.hearts(D.wrap.position.clone().setY(D.wrap.position.y + D.size.y), ['⚽', '💖'], 5), 900); return; }
    setTimeout(() => {
      if (this.disposed) return;
      D.busy = false; D.state = 'walk'; D.target.set(to.x, 0, to.z); D.arriveAt = D.radius * 0.7 + 0.5; D.walkSpeed = clamp(D.full.z * 0.35, 2, 5.5);
      this.play(D, D.actions.run ? 'run' : 'walk');
      D.onArrive = () => {
        // a nudge with the nose sends the ball rolling on
        const f = this.fx.find(x => x.obj === ball); if (f) { const k = new THREE.Vector3(Math.sin(D.yaw), 0, Math.cos(D.yaw)); f.roll = k.multiplyScalar(4); f.fly = null; }
        this.hearts(ball.position.clone().setY(ball.position.y + 1.5), ['⚽', '💖', '✨'], 5); APP().sfx('boing');
        D.busy = this.careD === D; this.play(D, D.actions.roar ? 'roar' : 'idle'); setTimeout(() => { if (!this.disposed) this.play(D, 'idle'); }, 1400);
      };
    }, 700);
  }
  doCuddle(D) {
    APP().sfx('pop');
    this.hearts(D.wrap.position.clone().setY(D.wrap.position.y + D.size.y * 0.8), ['💖', '💕', '💗', '🥰'], 10);
    this.hearts(this.player.position.clone().setY(this.player.position.y + 1.6), ['💖'], 3);
    this.armL.rotation.x = this.armR.rotation.x = -2.4; setTimeout(() => { this.armL.rotation.x = this.armR.rotation.x = 0; }, 1500);
  }
  hearts(at, emo, n) {
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(emo[i % emo.length]), depthWrite: false, transparent: true }));
      s.scale.setScalar(0.8); s.position.copy(at).add(new THREE.Vector3(rand(-1, 1), rand(0, 0.8), rand(-1, 1))); s.visible = false; this.scene.add(s);
      this.fx.push({ obj: s, life: 2.4, max: 2.4, delay: i * 0.08, vel: new THREE.Vector3(rand(-0.3, 0.3), rand(1, 1.8), rand(-0.3, 0.3)), fade: true, sprite: true });
    }
  }

  // ---------- gyrospheres ----------
  enterPod(pod) {
    if (this.riding) return;
    this.closeCare();
    this.riding = pod; this.moveTarget = null; pod.yaw = this.camYaw + Math.PI; pod.moveSpeed = 0;
    this.legL.rotation.z = 0.5; this.legR.rotation.z = -0.5;
    APP().sfx('boing'); APP().toast('🔵 You are in a gyrosphere! Use the joystick to roll around the park.', 3200);
    if (!APP().getFlag('park_pod')) { APP().setFlag('park_pod'); this.updateMission(); }
  }
  stopRide(now) {
    const R = this.riding; if (!R) return;
    if (!R.def.pod) {
      super.stopRide(now);
      if (this.riding) return;   // still landing, or swimming back to the shore
      if (R.p && !APP().getFlag('park_rode')) { APP().setFlag('park_rode'); this.updateMission(); }
      return;
    }
    this.legL.rotation.z = 0; this.legR.rotation.z = 0; this.riding = null;
    const side = new THREE.Vector3(Math.cos(R.yaw), 0, -Math.sin(R.yaw)), p = R.wrap.position.clone().addScaledVector(side, 2.6);
    this.player.position.set(p.x, this.heightAt(p.x, p.z), p.z);
  }
  canRide(D) { return !!(D.p && D.p.grown); }   // in the park: her own grown-ups only

  // ---------- park map ----------
  showMap() {
    const panel = this.host.querySelector('.pk-panel');
    const places = [
      ['🚪', 'Main gate', 0, PK.wallZ - 8, Math.PI], ['⛲', 'Plaza', 0, PK.plaza.z + PK.plaza.r + 4, Math.PI], ['🥚', 'Hatchery', PK.hatch.x + PK.hatch.r + 6, PK.hatch.z, -Math.PI / 2], ['🔵', 'Gyrospheres', PK.pods.x - 8, PK.pods.z + 8, 2.4],
      ['🌿', 'The Meadow', -30 * WK, 0, -Math.PI / 2], ['🦖', 'Predator Ridge', 42 * WK, 8 * WK, Math.PI / 2], ['🔭', 'Lookout', PK.lookout.x, PK.lookout.z, Math.PI / 2],
      ['🌊', 'The Lagoon', 0, PK.lagoon.z + PK.lagoon.r + 6, Math.PI], ['🦅', 'The Aviary', 49 * WK, -50 * WK, 2.4]];
    const count = z => this.dinos.filter(d => this.zoneOf(d.id) === z).length;
    const counts = { 'The Meadow': count('meadow'), 'Predator Ridge': count('ridge'), 'The Lagoon': count('lagoon'), 'The Aviary': count('aviary'), Hatchery: this.eggMeshes.length };
    panel.innerHTML = `<div class="pk-head"><b>🗺️ Park map</b><button class="pk-x" aria-label="Close">✕</button></div>
      <div class="pk-grid">${places.map(([e, n], i) => `<button class="pk-pick" data-i="${i}"><b>${e} ${n}</b>${counts[n] !== undefined ? `<small>${counts[n]} ${n === 'Hatchery' ? (counts[n] === 1 ? 'egg' : 'eggs') : counts[n] === 1 ? 'creature' : 'creatures'}</small>` : ''}</button>`).join('')}</div>`;
    panel.classList.remove('hidden');
    panel.querySelector('.pk-x').onclick = () => panel.classList.add('hidden');
    panel.querySelectorAll('.pk-pick').forEach(b => b.onclick = () => {
      panel.classList.add('hidden');
      const [, , x, z, face] = places[+b.dataset.i];
      if (z > PK.wallZ - 2 && this.doorOpen < 0.85) { this.doorWant = 1; }
      const fade = this.host.querySelector('.t3-fade'); fade.classList.add('on');
      setTimeout(() => {
        if (this.disposed) return;
        const R = this.riding, y = this.heightAt(x, z);
        if (R && !R.def.pod) this.stopRide();
        if (this.riding) { this.riding.wrap.position.set(x, y, z); this.riding.yaw = face; }
        else { this.player.position.set(x, y, z); this.player.rotation.y = face; }
        this.camYaw = face + Math.PI; this.moveTarget = null;
        this.camera.position.set(x - Math.sin(face) * 8, y + 4, z - Math.cos(face) * 8);
        fade.classList.remove('on');
      }, 450);
    });
  }
  bindInput() {
    super.bindInput();
    this.host.querySelector('.map').onclick = () => { if (this.decorating) this.toggleDecorate(false); this.showMap(); };
    this.host.querySelector('.deco').onclick = () => this.toggleDecorate();
    this.host.querySelector('.pod').onclick = () => { const p = this.pods.find(q => this.near(q.wrap.position, 6)); if (p) this.enterPod(p); };
    this.host.querySelector('.t3-count').onclick = () => {
      const s = APP().park.stats();
      APP().toast(`🦕 ${s.friends} ${s.friends === 1 ? 'creature' : 'creatures'} live in your park and 🥚 ${s.eggs} ${s.eggs === 1 ? 'egg is' : 'eggs are'} waiting to hatch. Order more eggs at the Hatchery!`, 4600);
    };
  }
  updateCount() {
    const s = APP().park.stats();
    this.host.querySelector('.t3-count').innerHTML = `🦕 ${s.friends} <small>· 🥚 ${s.eggs}</small>`;
  }
  updateMission() {
    const list = APP().park.list();
    const M = [
      { id: 'park_scan', text: 'Scan your Ranger ID card at the gate', ok: () => APP().getFlag('park_scan') },
      { id: 'park_m_egg', text: 'Order an egg at the Hatchery', ok: () => list.length + APP().park.eggs().length > 0 },
      { id: 'park_m_hatch', text: 'Keep an egg warm until it hatches', ok: () => list.length > 0 },
      { id: 'park_fed', text: 'Feed a dinosaur the right food', ok: () => APP().getFlag('park_fed') },
      { id: 'park_bath', text: 'Give a dinosaur a bath', ok: () => APP().getFlag('park_bath') },
      { id: 'park_play', text: 'Throw a ball for a dinosaur', ok: () => APP().getFlag('park_play') },
      { id: 'park_pod', text: 'Roll around in a gyrosphere', ok: () => APP().getFlag('park_pod') },
      { id: 'park_m_deco', text: 'Decorate your park (tap 🎨)', ok: () => APP().park.decor().length > 0 },
      { id: 'park_m_grown', text: 'Help a baby grow all the way up', ok: () => list.some(p => p.grown) },
      { id: 'park_rode', text: 'Ride your own grown-up dinosaur', ok: () => APP().getFlag('park_rode') },
      { id: 'park_flew', text: 'Fly on your own grown-up flying reptile', ok: () => APP().getFlag('flew_park') },
      { id: 'park_swam', text: 'Swim with your own grown-up sea reptile', ok: () => APP().getFlag('swam_park') }
    ];
    for (const m of M) { const key = 'mission_' + m.id; if (!APP().getFlag(key) && m.ok()) { APP().setFlag(key); APP().stars(2); APP().toast(`🎯 Mission complete: <b>${m.text}</b>! +2 ⭐`, 3200); } }
    const next = M.find(m => !APP().getFlag('mission_' + m.id));
    this.host.querySelector('.t3-mission').innerHTML = next ? `🎯 ${next.text} ${APP().spk('Mission: ' + next.text)}` : '🏆 You are a super Park Ranger!';
    this.updateCount();
  }

  // ---------- every frame ----------
  update(dt) {
    super.update(dt);
    const t = performance.now() / 1000;
    // gate doors
    this.doorOpen += clamp(this.doorWant - this.doorOpen, -dt * 0.5, dt * 0.5);
    const e = this.doorOpen * this.doorOpen * (3 - 2 * this.doorOpen);
    for (const d of this.doors) d.hinge.rotation.y = -d.sx * e * 1.75;
    for (const f of this.anims) f(t);
    // after the grand view of the gate, glide back to the normal walking camera
    if (this.camEase) { const k = Math.min(1, dt * 1.2); this.camPitch += (0.05 - this.camPitch) * k; this.zoom += (1 - this.zoom) * k; if (Math.abs(this.zoom - 1) < 0.01) this.camEase = false; }
    // gyrosphere rolling
    const R = this.riding;
    if (R && R.def.pod) { R.ball.rotation.x += (R.moveSpeed || 0) * dt / 1.7; this.legL.rotation.x = this.legR.rotation.x = -1.2; }
    // babies growing
    for (const D of this.dinos) if (D.growTo !== undefined) {
      D.growT += dt; const k = clamp(D.growT / D.growS, 0, 1);
      this.setGrowth(D, lerp(D.growFrom, D.growTo, k * k * (3 - 2 * k)));
      if (k >= 1) D.growTo = undefined;
    }
    // eggs wobble and glow
    for (const E of this.eggMeshes) { if (E.wob > 0) { E.wob = Math.max(0, E.wob - dt * 1.5); E.mesh.rotation.z = Math.sin(t * 30) * 0.2 * E.wob; } E.glow.material.opacity = Math.max(E.glow.material.opacity, 0.04 + 0.03 * Math.sin(t * 3)); }
    // effects
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i]; f.life -= dt; const age = f.max - f.life;
      if (f.delay && age < f.delay) continue;
      f.obj.visible = true;
      if (f.fly) {
        const k = clamp((age - (f.fly.delay || 0)) / f.fly.dur, 0, 1);
        f.obj.position.lerpVectors(f.fly.from, f.fly.to, k); f.obj.position.y += Math.sin(k * Math.PI) * f.fly.arc;
        if (k >= 1 && !f.ball) f.life = 0;
        if (f.ball) f.obj.rotation.x += dt * 8 * (1 - k);
      } else if (f.roll) {
        f.obj.position.addScaledVector(f.roll, dt); f.roll.multiplyScalar(1 - dt * 1.2);
        f.obj.position.y = this.heightAt(f.obj.position.x, f.obj.position.z) + f.R; f.obj.rotation.x += f.roll.length() * dt / f.R;
      } else if (f.vel) f.obj.position.addScaledVector(f.vel, dt);
      if (f.spin) f.spin.position.y = 1.6 + Math.sin(t * 3) * 0.15;
      if (f.fade) { const o = clamp(f.life / 0.8, 0, 1); f.obj.material.opacity = (f.sprite ? 1 : 0.7) * o; }
      if (f.life <= 0) { this.scene.remove(f.obj); this.fx.splice(i, 1); }
    }
  }
  updateDino(D, dt, t) {
    if (D.def.swim && !D.busy && D.state === 'idle' && this.riding !== D && this.summoning !== D) {
      const P = this.player.position, byWater = Math.hypot(P.x - this.lake.x, P.z - this.lake.z) < this.lake.r + 10;
      if (byWater && D.wrap.position.distanceTo(this.waterSpotNear(D)) > 6 && (D.curious = (D.curious || 0) - dt) <= 0) { D.curious = 8; this.comeToHer(D); D.onArrive = null; }
    }
    if (D.chew) { D.chew -= dt; const b = Math.sin(t * 9) * 0.03; D.obj.rotation.x = b; if (D.chew <= 0) { D.chew = 0; D.obj.rotation.x = 0; } }
    super.updateDino(D, dt, t);
  }
  updateHud() {
    // the size card from the trail, but for her own friends
    super.updateHud();
    const podBtn = this.host.querySelector('.pod');
    podBtn.classList.toggle('hidden', !!this.riding || this.decorating || !this.pods.some(p => this.near(p.wrap.position, 6)));
    // walkers that wander far away close their card; swimmers and flyers are coming to her, so theirs stays open
    const cd = this.careD;
    if (cd && !this.riding && !cd.def.swim && !cd.def.fly && !this.near(cd.wrap.position, cd.radius + 30)) this.closeCare();
  }

  // ---------- decorating ----------
  buildDecor() {
    this.decorObjs = new Map();
    for (const it of APP().park.decor()) this.addDecor(it);
  }
  addDecor(it) {
    const g = this.decorModel(it);
    g.rotation.y = it.r || 0;
    g.position.set(it.x, this.heightAt(it.x, it.z), it.z);
    // an invisible, easy-to-tap shape so she can pick it up again
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 1.5; hit.userData.decor = it; g.add(hit); g.userData.hit = hit;
    this.add(g); this.decorObjs.set(it.id, g);
    return g;
  }
  decorModel(it) {
    const g = new THREE.Group(), e = it.e, B = (w, h, d, c, x, y, z) => this.box(w, h, d, M(c), x, y, z);
    const mesh = (geo, c, x, y, z, extra) => { const m = new THREE.Mesh(geo, M(c, extra)); m.position.set(x, y, z); g.add(m); return m; };
    const live = f => this.anims.push(t => { if (g.parent) f(t); });
    const tree = (trunkH, top, topGeo) => { mesh(new THREE.CylinderGeometry(0.3, 0.45, trunkH, 6), 0x6b4a2e, 0, trunkH / 2, 0); mesh(topGeo, top, 0, trunkH + 1, 0); };
    // real models for each decoration; they appear as soon as they have loaded
    const put = (name, h, x = 0, y = 0, z = 0, ry = 0) => propObject(name, h).then(o => { if (this.disposed) return; o.position.set(x, y, z); o.rotation.y = ry; g.add(o); return o; });
    switch (e) {
      case '🌿': put('fern', 1.1); put('fern', 0.8, 0.9, 0, 0.4, 1.2); break;
      case '🪨': put('rock1', 1.3); put('rock2', 0.7, 1.2, 0, 0.6, 0.8); break;
      case '🍄': put('mushrooms', 0.7); put('toadstool', 0.9, 0.8, 0, 0.3); break;
      case '🐚': put('shell', 0.5, 0, 0, 0, 0.6); break;
      case '🌲': put('pine1', 8); break;
      case '🌴': put('palm1', 7); break;
      case '🌸': put('flowers1', 0.9); put('flowers2', 1.0, 0.8, 0, 0.3, 1); put('flowers1', 0.8, -0.6, 0, 0.6, 2); break;
      case '🌳': put('broad1', 7); break;
      case '🦴': put('ribcage', 1.6); break;
      case '🪺': { const nest = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.3, 10, 24), new THREE.MeshLambertMaterial({ color: 0x9a7440 })); nest.rotation.x = Math.PI / 2; nest.position.y = 0.3; nest.scale.z = 0.8; g.add(nest);
        for (let i = 0; i < 3; i++) put('egg', 0.5, Math.cos(i * 2.1) * 0.3, 0.2, Math.sin(i * 2.1) * 0.3, i); break; }
      case '🦋': { put('flowerbush', 1.1);
        const flies = []; for (let i = 0; i < 3; i++) propObject(i % 2 ? 'butterfly2' : 'butterfly1', 0.35).then(o => { if (this.disposed) return; const w = new THREE.Group(); w.add(o); g.add(w); flies.push([w, o, i]); });
        live(t => flies.forEach(([w, o, i]) => { const a = t * 0.7 + i * 2.1; w.position.set(Math.cos(a) * 1.4, 1.4 + Math.sin(t * 1.8 + i) * 0.35, Math.sin(a) * 1.4); w.rotation.y = -a;
          o.scale.x = o.scale.z * (0.25 + 0.75 * Math.abs(Math.sin(t * 11 + i))); })); break; }   // wings flap by folding in and out
      case '🐝': { put('hive', 1.2, 0, 0.9, 0); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.9, 8), new THREE.MeshLambertMaterial({ color: 0x6b4a2e })); post.position.y = 0.45; g.add(post);
        const bees = []; for (let i = 0; i < 4; i++) propObject('bee', 0.22).then(o => { if (!this.disposed) { g.add(o); bees.push([o, i]); } });
        live(t => bees.forEach(([o, i]) => { const a = t * 2 + i * 1.6; o.position.set(Math.cos(a) * 1.1, 1.5 + Math.sin(t * 3 + i) * 0.4, Math.sin(a * 1.2) * 1.1); o.rotation.y = -a; })); break; }
      case '🐢': put('turtle', 0.6).then(o => { if (o) live(t => { o.position.y = Math.abs(Math.sin(t * 1.5)) * 0.03; o.rotation.y = Math.sin(t * 0.3) * 0.3; }); }); break;
      case '🐊': propObject('crocodile', 0, 3).then(o => { if (this.disposed) return; g.add(o); live(t => { o.rotation.y = Math.sin(t * 0.2) * 0.15; }); }); break;
      case '🌋': { put('volcano', 4); const puffs = []; for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), new THREE.MeshLambertMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 })); g.add(p); puffs.push(p); }
        live(t => puffs.forEach((p, i) => { const k = (t * 0.25 + i / 4) % 1; p.position.set(k * 0.8, 4 + k * 3, 0); p.scale.setScalar(0.5 + k * 1.3); p.material.opacity = 0.5 * (1 - k); })); break; }
      case '☄️': { put('meteor', 1.6, 0, 0.3, 0); const crater = new THREE.Mesh(new THREE.RingGeometry(1.3, 2.4, 24), new THREE.MeshLambertMaterial({ color: 0x5a4a40 })); crater.rotation.x = -Math.PI / 2; crater.position.y = 0.05; g.add(crater); break; }
      case '💡': put('lamp', 3); break;
      case '🪑': put('bench', 0.9); break;
      case '🚩': put('flag', 3); break;
      case '⛲': put('fountain', 1.6); break;
      case '🎈': { const bs = []; [0xff5a5a, 0x5ab0ff, 0xffd84a, 0x7ad97a, 0xd97aff].forEach((c, i) => { const a = i * 1.26; const b = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 16), new THREE.MeshPhongMaterial({ color: c, shininess: 90 })); b.scale.y = 1.2; g.add(b); bs.push([b, a]);
          const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 3, 4), new THREE.MeshLambertMaterial({ color: 0xffffff })); str.position.set(Math.cos(a) * 0.25, 1.5, Math.sin(a) * 0.25); g.add(str); });
        const wt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.3, 16), new THREE.MeshLambertMaterial({ color: 0x8a8580 })); wt.position.y = 0.15; g.add(wt);
        live(t => bs.forEach(([b, a], i) => { b.position.set(Math.cos(a) * 0.6, 3.3 + Math.sin(t * 1.5 + i) * 0.15, Math.sin(a) * 0.6); })); break; }
      case '🗿': { B(1.6, 1.2, 2.6, 0x9a9184, 0, 0.6, 0); const id = it.s && MODEL_DEFS[it.s] ? it.s : 'triceratops';
        makeDino(id).then(D => { if (!D || this.disposed) return; const stone = new THREE.MeshLambertMaterial({ color: 0xb7afa2 }); D.obj.traverse(o => { if (o.isMesh) o.material = stone; }); D.wrap.remove(D.hit); const k = 2.6 / Math.max(D.size.z, D.size.x, D.size.y); D.wrap.scale.setScalar(k); D.wrap.position.y = 1.2; (D.actions.idle || D.actions.walk) && ((D.actions.idle || D.actions.walk).play(), D.mixer.update(0.3)); D.wrap.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(D.wrap); });
        const lab = labelSprite(APP().nick(BY_ID[id]), { w: 2.6 }); lab.position.y = 4.4; g.add(lab); break; }
      default: { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(e) })); s.scale.setScalar(1.6); s.position.y = 1.2; g.add(s); }
    }
    return g;
  }
  toggleDecorate(on = !this.decorating) {
    this.decorating = on; this.decorPick = null;
    const panel = this.host.querySelector('.pk-deco'), btn = this.host.querySelector('.deco');
    btn.classList.toggle('on', on); btn.innerHTML = on ? '✅<small>Done</small>' : '🎨<small>Decorate</small>';
    this.host.classList.toggle('decorating', on);
    if (!on) { panel.classList.add('hidden'); return; }
    this.closeCare(); this.host.querySelector('.pk-panel').classList.add('hidden');
    if (this.riding && !this.riding.def.pod) this.stopRide();
    this.camPitch = 0.6; this.zoom = Math.max(this.zoom, 1.5);
    this.drawDecoPanel();
    if (!APP().getFlag('park_deco_help')) { APP().setFlag('park_deco_help'); }
  }
  drawDecoPanel() {
    const panel = this.host.querySelector('.pk-deco'), stars = APP().park.stars(), help = 'Pick something, then tap the ground to put it there. Tap a decoration to pick it up again and get your stars back.';
    panel.innerHTML = `<div class="pk-sub">🎨 ${help} ${APP().spk(help)}</div>
      <div class="deco-items">${APP().park.decorItems().map(d => `<button class="deco-item${this.decorPick === d.e ? ' sel' : ''}${stars < d.cost ? ' poor' : ''}" data-e="${d.e}"><span>${d.e}</span><small>⭐${d.cost}</small></button>`).join('')}</div>`;
    panel.classList.remove('hidden');
    panel.querySelectorAll('.deco-item').forEach(b => b.onclick = () => { this.decorPick = b.dataset.e; APP().sfx('pop'); this.drawDecoPanel(); });
  }
  decorTap(ray) {
    const hitD = ray.intersectObjects([...this.decorObjs.values()].map(g => g.userData.hit), false)[0];
    if (hitD) {
      const it = hitD.object.userData.decor, g = this.decorObjs.get(it.id);
      const back = APP().park.removeDecor(it.id); this.scene.remove(g); this.decorObjs.delete(it.id);
      APP().toast(`↩️ Picked up ${it.e}. You got ${back} ⭐ back.`); this.drawDecoPanel(); return;
    }
    if (!this.decorPick) { APP().toast('👇 Pick a decoration first!'); return; }
    const th = ray.intersectObject(this.terrain, false)[0]; if (!th) return;
    const p = th.point;
    if (this.inLake(p, -1) || Math.hypot(p.x, p.z) > EDGE - 4 || this.boxes.some(r => p.x > r.x0 && p.x < r.x1 && p.z > r.z0 && p.z < r.z1)) { APP().toast('🚫 That spot is not good for building. Try somewhere else!'); APP().sfx('oops'); return; }
    let s;
    if (this.decorPick === '🗿') { const met = APP().park.metIds().filter(id => MODEL_DEFS[id] && !MODEL_DEFS[id].fly && !MODEL_DEFS[id].swim); s = met.length ? met[Math.floor(Math.random() * met.length)] : 'triceratops'; }
    const face = Math.atan2(this.player.position.x - p.x, this.player.position.z - p.z);
    const r = APP().park.placeDecor(this.decorPick, +p.x.toFixed(2), +p.z.toFixed(2), +face.toFixed(2), s);
    if (!r) return;
    if (r.poor) { APP().sfx('oops'); APP().toast(`You need ${r.poor} more ⭐. Care for your dinosaurs, finish missions or play Dino Detective to earn stars!`, 4200); return; }
    const g = this.addDecor(r.item); g.scale.setScalar(0.01); this.growIn(g);
    this.hearts(new THREE.Vector3(p.x, p.y + 1.5, p.z), ['✨'], 4);
    this.drawDecoPanel(); this.updateMission();
  }
  growIn(g) { let k = 0; const f = () => { if (this.disposed) return; k = Math.min(1, k + 0.08); const e = 1 + Math.sin(k * Math.PI) * 0.25; g.scale.setScalar(k * e); if (k < 1) requestAnimationFrame(f); else g.scale.setScalar(1); }; f(); }
  dispose() { super.dispose(); }
}
const emojiCache = {};
function emojiTex(e) { return emojiCache[e] || (emojiCache[e] = emojiTexture(e)); }
function esc3(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

// =====================================================================
//                         TIME-TRAVEL TUNNEL
// =====================================================================
const MILESTONES = [
  { y: 0, e: '📱', t: 'Today', s: 'Phones, tablets and you!' },
  { y: 200, e: '🚂', t: '200 years ago', s: 'Steam trains puff along' },
  { y: 800, e: '🏰', t: '800 years ago', s: 'Knights and castles' },
  { y: 4500, e: '🐫', t: '4,500 years ago', s: 'The pyramids of Egypt are built' },
  { y: 10000, e: '🦣', t: '10,000 years ago', s: 'Woolly mammoths roam' },
  { y: 66e6, e: '☄️', t: '66 million years ago', s: 'A giant asteroid hits Earth' },
  { y: 90e6, e: '🌸', t: '90 million years ago', s: 'Flowers are blooming' },
  { y: 150e6, e: '🌲', t: '150 million years ago', s: 'Giant long-necked dinosaurs' },
  { y: 230e6, e: '🌋', t: '230 million years ago', s: 'The very first dinosaurs' }
];
const ERA_YEARS = { cretaceous: 68e6, jurassic: 152e6, triassic: 231e6 };

function emojiTexture(e) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(128, 128, 118, 0, Math.PI * 2); g.fill();
  g.font = '150px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 128, 140);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function fmtYears(y) {
  if (y < 1) return 'Today';
  if (y < 1e6) return Math.round(y).toLocaleString('en-GB') + ' years ago';
  return (y / 1e6 >= 10 ? Math.round(y / 1e6) : (y / 1e6).toFixed(1)) + ' million years ago';
}

// ---------- portrait studio: a nicely lit picture of one creature (used to make the fact-card pictures) ----------
export async function portrait(id, W = 960, H = 600) {
  const D = await makeDino(id); if (!D) return null;
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(W, H, false); r.setPixelRatio(1); r.outputColorSpace = THREE.SRGBColorSpace; r.setClearColor(0x000000, 0);
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xffffff, 0x8a9a7a, 1.9));
  const key = new THREE.DirectionalLight(0xfff2e0, 2.4); key.position.set(4, 6, 5); sc.add(key);
  const rim = new THREE.DirectionalLight(0xdfefff, 1.2); rim.position.set(-5, 3, -4); sc.add(rim);
  const pose = D.actions[D.def.fly ? 'fly' : 'idle'] || D.actions.walk;
  if (pose) { pose.play(); D.mixer.update(D.def.fly ? 0.35 : 0.6); }
  sc.add(D.wrap); D.wrap.remove(D.hit); D.wrap.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(D.wrap, true), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.01, 5000);
  // three-quarter view from the front-left, a little above; flyers seen from slightly below with wings spread
  const dir = D.def.fly ? new THREE.Vector3(0.55, -0.25, 0.8) : new THREE.Vector3(0.95, 0.28, 0.75);
  dir.normalize();
  const fitH = s.y / 2 / Math.tan(THREE.MathUtils.degToRad(15)), fitW = Math.max(s.x, s.z) / 2 / Math.tan(THREE.MathUtils.degToRad(15)) / (W / H);
  cam.position.copy(c).addScaledVector(dir, Math.max(fitH, fitW) * 0.92 + Math.max(s.x, s.z) * 0.12);
  cam.lookAt(c);
  r.render(sc, cam);
  const url = r.domElement.toDataURL('image/webp', 0.86);
  r.dispose(); r.forceContextLoss && r.forceContextLoss();
  return url;
}
export function preloadEra(era) { return Promise.all(trailIds(era).map(id => loadModel(MODEL_DEFS[id].f))).catch(() => {}); }

export function timeTravel(era, onDone) {
  preloadEra(era);
  const target = ERA_YEARS[era] || 150e6;
  const stops = MILESTONES.filter(m => m.y <= target * 1.02);
  const ov = document.createElement('div');
  ov.className = 'tt';
  ov.innerHTML = `<canvas></canvas><div class="tt-year">Today</div><div class="tt-cap"></div><button class="tt-skip">Skip ⏩</button>`;
  document.body.appendChild(ov);
  const cv = ov.querySelector('canvas'), yearEl = ov.querySelector('.tt-year'), capEl = ov.querySelector('.tt-cap');
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); r.setSize(innerWidth, innerHeight, false);
  const sc = new THREE.Scene(); sc.fog = new THREE.Fog(0x120a2e, 10, 70);
  const cam = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 200);
  const fit = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
  addEventListener('resize', fit); addEventListener('orientationchange', fit);
  // tunnel with swirling stripes
  const tc = document.createElement('canvas'); tc.width = 64; tc.height = 512;
  const tg = tc.getContext('2d');
  for (let i = 0; i < 16; i++) { tg.fillStyle = `hsl(${(i * 37) % 360},80%,${i % 2 ? 55 : 35}%)`; tg.fillRect(0, i * 32, 64, 32); }
  const tex = new THREE.CanvasTexture(tc); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(6, 4); tex.colorSpace = THREE.SRGBColorSpace;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 160, 32, 1, true), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, transparent: true, opacity: 0.85 }));
  tube.rotation.x = Math.PI / 2; tube.position.z = -70; sc.add(tube);
  // stars
  const sg = new THREE.BufferGeometry(), sp = [];
  for (let i = 0; i < 700; i++) { const a = Math.random() * 6.28, rr = rand(0.5, 5.5); sp.push(Math.cos(a) * rr, Math.sin(a) * rr, -rand(0, 150)); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 })); sc.add(stars);
  // picture sprites
  const DUR = 7, per = (DUR - 0.6) / stops.length;
  const sprites = stops.map((m, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(m.e), transparent: true }));
    s.scale.set(3.2, 3.2, 1); s.userData = { m, at: i * per + 0.2, side: i % 2 ? 1 : -1 }; s.visible = false; sc.add(s); return s;
  });
  let t = 0, last = performance.now(), done = false, shown = -1;
  APP().sfx('travel');
  const finish = () => {
    if (done) return; done = true;
    ov.classList.add('flash'); APP().sfx('arrive');
    removeEventListener('resize', fit); removeEventListener('orientationchange', fit);
    setTimeout(() => { onDone && onDone(); setTimeout(() => { r.setAnimationLoop(null); r.dispose(); ov.remove(); }, 450); ov.classList.add('out'); }, 350);
  };
  ov.querySelector('.tt-skip').onclick = finish;
  const startT = performance.now();
  setTimeout(finish, DUR * 1000 + 300);
  const logYear = y => Math.exp(Math.log(1 + y));
  r.setAnimationLoop(() => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.1); last = now; t = (now - startT) / 1000;
    tex.offset.y -= dt * (0.6 + t * 0.25); tex.offset.x += dt * 0.15;
    tube.rotation.z = 0; tube.rotation.y += dt * 0.4;
    const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) { let z = p.getZ(i) + dt * (25 + t * 6); if (z > 2) z -= 150; p.setZ(i, z); }
    p.needsUpdate = true;
    // year counter on a log scale
    const marks = stops.map((m, i) => ({ t: i * per + 0.2 + 0.6, y: m.y })).concat([{ t: DUR, y: target }]);
    let yr = 0;
    for (let i = 0; i < marks.length - 1; i++) {
      const a = marks[i], b = marks[i + 1];
      if (t >= a.t && t < b.t) { const f = (t - a.t) / (b.t - a.t); yr = Math.expm1(lerp(Math.log1p(a.y), Math.log1p(b.y), f)); }
    }
    if (t >= marks[marks.length - 1].t) yr = target;
    yearEl.textContent = fmtYears(yr);
    for (let i = 0; i < sprites.length; i++) {
      const s = sprites[i], u = (t - s.userData.at) / 1.6;
      if (u < 0 || u > 1) { s.visible = false; continue; }
      s.visible = true;
      s.position.set(s.userData.side * lerp(0.3, 2.6, u), Math.sin(u * 3) * 0.6, lerp(-45, 3, u * u));
      s.material.rotation = Math.sin(t * 2 + i) * 0.2;
      if (u > 0.35 && shown < i) { shown = i; capEl.innerHTML = `<b>${s.userData.m.t}</b><br>${s.userData.m.s}`; capEl.classList.remove('pop'); void capEl.offsetWidth; capEl.classList.add('pop'); }
    }
    r.render(sc, cam);
    if (t >= DUR) finish();
  });
}
