// Dino Explorer offline support (made by build.py — edit sw_template.js in source/, not this file).
// Every file of the game is listed with a short fingerprint. Files are kept in one store on the iPad;
// when the game is updated, only files whose fingerprint changed are downloaded again.
const FILES = {
"assets/credits.txt": "372d518d84",
"assets/gobkit/Ankylosaurus.glb": "6413ecf6bf",
"assets/gobkit/Carnotaurus.glb": "f4601b2183",
"assets/gobkit/LICENSE.txt": "af39a0c9a2",
"assets/gobkit/Oviraptor.glb": "b70b084bfc",
"assets/gobkit/Pachycephalosaurus.glb": "45a244cabd",
"assets/gobkit/Plesiosaurus.glb": "f7263d2a8f",
"assets/gobkit/Pterodactylus.glb": "4164fff088",
"assets/gobkit/README.txt": "042f79dbe7",
"assets/gobkit/Spinosaurus.glb": "1dca3aad7e",
"assets/gobkit/Stegosaurus.glb": "2519a259e1",
"assets/gobkit/Texture001.png": "942d4971bd",
"assets/gobkit/Trex.glb": "b8263338f3",
"assets/gobkit/Triceratops.glb": "15d20c9925",
"assets/music/theme.m4a": "8e923ca9e1",
"assets/portraits/allosaurus.webp": "5759f5dec6",
"assets/portraits/ankylosaurus.webp": "7228550082",
"assets/portraits/archaeopteryx.webp": "eebe9b25bf",
"assets/portraits/argentinosaurus.webp": "a5b6034197",
"assets/portraits/brachiosaurus.webp": "a4d97cca2e",
"assets/portraits/brontosaurus.webp": "d40d0907b6",
"assets/portraits/carnotaurus.webp": "74daa77eaf",
"assets/portraits/coelophysis.webp": "0a76ae7438",
"assets/portraits/compsognathus.webp": "f5749dfa37",
"assets/portraits/cryolophosaurus.webp": "86d6fad6c9",
"assets/portraits/dilophosaurus.webp": "f9348f7a21",
"assets/portraits/diplodocus.webp": "b8f108ae26",
"assets/portraits/edmontosaurus.webp": "bb9df1d7f8",
"assets/portraits/elasmosaurus.webp": "3a31881031",
"assets/portraits/eoraptor.webp": "1129e1265c",
"assets/portraits/eudimorphodon.webp": "ba4dad47be",
"assets/portraits/gallimimus.webp": "438076dde6",
"assets/portraits/giganotosaurus.webp": "a546d54b4a",
"assets/portraits/herrerasaurus.webp": "b8d6a3e040",
"assets/portraits/ichthyosaurus.webp": "64ec9009bb",
"assets/portraits/iguanodon.webp": "25cbbf6b22",
"assets/portraits/kentrosaurus.webp": "bdb4c30747",
"assets/portraits/maiasaura.webp": "601ee17357",
"assets/portraits/mamenchisaurus.webp": "d179e8397b",
"assets/portraits/megalosaurus.webp": "9e28e83ad7",
"assets/portraits/microraptor.webp": "67db461e83",
"assets/portraits/mosasaurus.webp": "88f3eb33e6",
"assets/portraits/nothosaurus.webp": "3a31881031",
"assets/portraits/oviraptor.webp": "0fbd01b0a5",
"assets/portraits/pachycephalosaurus.webp": "960fdafdd2",
"assets/portraits/parasaurolophus.webp": "fb6a306479",
"assets/portraits/plateosaurus.webp": "cbffb29bb7",
"assets/portraits/plesiosaurus.webp": "aca3ee84c0",
"assets/portraits/postosuchus.webp": "99271b50cf",
"assets/portraits/protoceratops.webp": "33238e1ca6",
"assets/portraits/pteranodon.webp": "0a73a2b3d1",
"assets/portraits/quetzalcoatlus.webp": "83e260ba00",
"assets/portraits/rhamphorhynchus.webp": "76e3d90c5e",
"assets/portraits/shonisaurus.webp": "3e2db7d678",
"assets/portraits/spinosaurus.webp": "b42f09cc7e",
"assets/portraits/stegosaurus.webp": "a6c2f68b19",
"assets/portraits/styracosaurus.webp": "c654168889",
"assets/portraits/therizinosaurus.webp": "c0ddf340d0",
"assets/portraits/trex.webp": "15741a7fe8",
"assets/portraits/triceratops.webp": "12a05bfd65",
"assets/portraits/velociraptor.webp": "c5046a25cf",
"assets/props/bee.glb": "8a1ceb0dbd",
"assets/props/bench.glb": "835333da13",
"assets/props/broad1.glb": "f32455e6cc",
"assets/props/broad1_far.glb": "53ba445524",
"assets/props/broad2.glb": "09222cbe36",
"assets/props/broad2_far.glb": "33755cb43a",
"assets/props/broad3.glb": "757cc21e2e",
"assets/props/bush.glb": "867e062e4c",
"assets/props/butterfly1.glb": "58c419689a",
"assets/props/butterfly2.glb": "29802c5067",
"assets/props/credits.txt": "5f9d050ed4",
"assets/props/crocodile.glb": "d0052091f9",
"assets/props/cycad.glb": "dd80b863b0",
"assets/props/cycad_far.glb": "6ac1633849",
"assets/props/egg.glb": "d65b7d7795",
"assets/props/fern.glb": "9bd9ef82d4",
"assets/props/flag.glb": "5e3c1bcb45",
"assets/props/flowerbush.glb": "9d124a0c60",
"assets/props/flowers1.glb": "0824e4406e",
"assets/props/flowers2.glb": "01b6790041",
"assets/props/fountain.glb": "dc267a6f51",
"assets/props/grass.glb": "bcbe9c65a1",
"assets/props/hive.glb": "8fed4d78dc",
"assets/props/horsetail.glb": "bb2da47b13",
"assets/props/lamp.glb": "45f9993de3",
"assets/props/meteor.glb": "119b478b88",
"assets/props/mushrooms.glb": "01c172188d",
"assets/props/palm1.glb": "61f57f2095",
"assets/props/palm1_far.glb": "08799b17ad",
"assets/props/palm2.glb": "b181a7791c",
"assets/props/palm2_far.glb": "0718eadd96",
"assets/props/pine1.glb": "549027c3ef",
"assets/props/pine1_far.glb": "a0e3c7a648",
"assets/props/pine2.glb": "7c692885a0",
"assets/props/pine2_far.glb": "3e0f853d8a",
"assets/props/pine3.glb": "28d5d1a94a",
"assets/props/pine3_far.glb": "0150636a09",
"assets/props/ribcage.glb": "ebb482da9a",
"assets/props/rock1.glb": "107b3ca206",
"assets/props/rock2.glb": "befa11b22a",
"assets/props/shell.glb": "a9d4ffea26",
"assets/props/toadstool.glb": "f98ab54d50",
"assets/props/turtle.glb": "119add059e",
"assets/props/volcano.glb": "a16741f4f6",
"assets/quaternius/apatosaurus.glb": "607d5a9ef3",
"assets/quaternius/parasaurolophus.glb": "6534c8c0d7",
"assets/quaternius/stegosaurus.glb": "0ee40cec39",
"assets/quaternius/trex.glb": "941c8f4bac",
"assets/quaternius/triceratops.glb": "494563bfd4",
"assets/quaternius/velociraptor.glb": "f63b93a163",
"assets/real/allosaurus.glb": "ec3529d196",
"assets/real/ankylosaurus.glb": "f828de1aa5",
"assets/real/archaeopteryx.glb": "4d72c15406",
"assets/real/argentinosaurus.glb": "a2e692630f",
"assets/real/brachiosaurus.glb": "466732f311",
"assets/real/brontosaurus.glb": "c9426b3c63",
"assets/real/carnotaurus.glb": "75c3a307ff",
"assets/real/compsognathus.glb": "9aed5ed682",
"assets/real/cryolophosaurus.glb": "7a1b1953ce",
"assets/real/dilophosaurus.glb": "26dd2381d7",
"assets/real/diplodocus.glb": "9bb48e2f67",
"assets/real/edmontosaurus.glb": "41c7825640",
"assets/real/eoraptor.glb": "368b95914c",
"assets/real/eudimorphodon.glb": "fd9b1763f3",
"assets/real/gallimimus.glb": "6e576eed8a",
"assets/real/giganotosaurus.glb": "ffb7cb03fe",
"assets/real/herrerasaurus.glb": "f3af7117f8",
"assets/real/ichthyosaurus.glb": "2737a50b0a",
"assets/real/iguanodon.glb": "580e0de543",
"assets/real/kentrosaurus.glb": "9dc2bcb76c",
"assets/real/maiasaura.glb": "d4ac960e19",
"assets/real/mamenchisaurus.glb": "cd499e84b2",
"assets/real/megalosaurus.glb": "a3ca3ca424",
"assets/real/microraptor.glb": "e72f1891ba",
"assets/real/mosasaurus.glb": "2cf41b7826",
"assets/real/pachycephalosaurus.glb": "b03ac9f1cb",
"assets/real/parasaurolophus.glb": "84ccb05477",
"assets/real/plateosaurus.glb": "518aa8ac0a",
"assets/real/postosuchus.glb": "e7f5cd4973",
"assets/real/protoceratops.glb": "72009fae33",
"assets/real/pteranodon.glb": "27284b47ea",
"assets/real/quetzalcoatlus.glb": "deb78fc4d4",
"assets/real/shonisaurus.glb": "bcf9f2fcbd",
"assets/real/spinosaurus.glb": "515b57202a",
"assets/real/stegosaurus.glb": "79f7a677f0",
"assets/real/styracosaurus.glb": "7d62e8dd30",
"assets/real/therizinosaurus.glb": "e92ee17cd3",
"assets/real/trex.glb": "9d30e35476",
"assets/real/triceratops.glb": "52dada7c88",
"assets/real/velociraptor.glb": "2769ae3b68",
"assets/sounds/trex_movie.m4a": "c419d713b8",
"explore3d.js": "7d55c8cbac",
"icon-180.png": "832282318b",
"icon-192.png": "d33c595d97",
"icon-512.png": "617ad27578",
"index.html": "ce80efc08f",
"manifest.webmanifest": "214ff14fcc",
"robots.txt": "f71d20196d",
"vendor/LICENSE-three.txt": "5c4c9366ed",
"vendor/jsm/loaders/GLTFLoader.js": "eabdcd7e3b",
"vendor/jsm/utils/BufferGeometryUtils.js": "c7edaa6ddd",
"vendor/jsm/utils/SkeletonUtils.js": "15dcdf8aef",
"vendor/three.module.min.js": "3eb31ec476"
};
const STORE = 'dino-explorer-files';
const scope = self.registration.scope;
const key = p => new URL(p + '?h=' + FILES[p], scope).href;
const rel = url => { const u = new URL(url); if (u.origin !== new URL(scope).origin || !u.href.startsWith(scope)) return null; const p = decodeURIComponent(u.pathname.slice(new URL(scope).pathname.length)); return p === '' ? 'index.html' : p; };
const BIG = p => p.endsWith('.glb');
const CORE = Object.keys(FILES).filter(p => !BIG(p));

async function save(cache, p) {
  if (await cache.match(key(p))) return true;
  const r = await fetch(key(p), { cache: 'no-cache' });
  if (!r.ok) return false;
  await cache.put(key(p), r);
  return true;
}
self.addEventListener('install', e => {
  e.waitUntil((async () => { const c = await caches.open(STORE); for (const p of CORE) await save(c, p); await self.skipWaiting(); })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const c = await caches.open(STORE), keep = new Set(Object.keys(FILES).map(key));
    for (const req of await c.keys()) if (!keep.has(req.url)) await c.delete(req);
    for (const k of await caches.keys()) if (k !== STORE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const p = rel(e.request.url);
  if (!p || !FILES[p]) return;   // anything else (e.g. links out) goes to the internet as normal
  e.respondWith((async () => {
    const c = await caches.open(STORE), hit = await c.match(key(p));
    if (hit) return hit;
    try { const r = await fetch(key(p)); if (r.ok) c.put(key(p), r.clone()); return r; }
    catch (err) { return (await c.match(key('index.html'))) || Response.error(); }
  })());
});
// the game asks for everything to be saved (all the dinosaur models), and how far it has got
self.addEventListener('message', e => {
  const port = e.ports && e.ports[0];
  if (e.data === 'status' || e.data === 'saveAll') e.waitUntil((async () => {
    const c = await caches.open(STORE), big = Object.keys(FILES).filter(BIG);
    let have = 0; for (const p of big) if (await c.match(key(p))) have++;
    if (port) port.postMessage({ have, total: big.length });
    if (e.data !== 'saveAll') return;
    for (const p of big) { try { await save(c, p); } catch (err) { /* offline: try again next time */ } }
    let now = 0; for (const p of big) if (await c.match(key(p))) now++;
    if (port) port.postMessage({ have: now, total: big.length, done: true });
  })());
});
