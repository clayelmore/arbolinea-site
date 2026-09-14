import * as THREE from 'three';

const IN_TO_M = 0.0254;

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Could not load ' + url + ' (' + r.status + ')');
  return r.text();
}

function parseMTL(text) {
  const out = {};
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts[0] === 'newmtl') { cur = parts[1]; out[cur] = {}; }
    else if (cur && parts[0] === 'Kd') out[cur].kd = parts.slice(1, 4).map(Number);
    else if (cur && parts[0] === 'Ns') out[cur].ns = Number(parts[1]);
  }
  return out;
}

// Minimal OBJ reader: v / g / usemtl / f (vertex indices, quads or tris).
// Runs of the same group+material merge into one mesh, so the part names
// stay readable instead of splitting into dozens of fragments.
function parseOBJ(text) {
  const verts = [];
  const buckets = new Map();
  const order = [];
  let group = 'part';
  let material = 'default';

  const bucket = () => {
    const key = group + '|' + material;
    let b = buckets.get(key);
    if (!b) { b = { name: group, material, pos: [] }; buckets.set(key, b); order.push(b); }
    return b;
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('mtllib')) continue;
    const parts = line.split(/\s+/);
    const tag = parts[0];
    if (tag === 'v') {
      verts.push(Number(parts[1]), Number(parts[2]), Number(parts[3]));
    } else if (tag === 'g' || tag === 'o') {
      group = parts[1] || 'part';
    } else if (tag === 'usemtl') {
      material = parts[1] || 'default';
    } else if (tag === 'f') {
      const idx = parts.slice(1).map(tok => {
        const i = parseInt(tok.split('/')[0], 10);
        return (i > 0 ? i - 1 : verts.length / 3 + i) * 3;
      });
      const pos = bucket().pos;
      for (let k = 1; k < idx.length - 1; k++) {
        for (const j of [idx[0], idx[k], idx[k + 1]]) {
          pos.push(verts[j], verts[j + 1], verts[j + 2]);
        }
      }
    }
  }
  return order;
}

/**
 * Loads an OBJ + MTL pair into a THREE.Group of named meshes.
 * `look` overrides per material name: { color, roughness, metalness }.
 * Model is scaled inches to meters, centered in x/z, resting on y = 0.
 */
export async function loadObjModel({ obj, mtl, look = {}, name = 'model' }) {
  const [objText, mtlText] = await Promise.all([
    fetchText(obj),
    fetchText(mtl),
  ]);

  const lib = parseMTL(mtlText);
  const cache = new Map();
  const materialFor = (mname) => {
    if (cache.has(mname)) return cache.get(mname);
    const o = look[mname] || {};
    const kd = lib[mname] && lib[mname].kd;
    const m = new THREE.MeshStandardMaterial({
      color: o.color !== undefined
        ? o.color
        : new THREE.Color(kd ? kd[0] : 0.7, kd ? kd[1] : 0.6, kd ? kd[2] : 0.5),
      roughness: o.roughness !== undefined ? o.roughness : 0.6,
      metalness: o.metalness !== undefined ? o.metalness : 0.0,
    });
    m.name = mname;
    cache.set(mname, m);
    return m;
  };

  const model = new THREE.Group();
  model.name = name;
  const seen = new Map();

  for (const part of parseOBJ(objText)) {
    if (!part.pos.length) continue;
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(part.pos.length);
    for (let i = 0; i < part.pos.length; i++) arr[i] = part.pos[i] * IN_TO_M;
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    geo.computeVertexNormals();

    const n = (seen.get(part.name) || 0) + 1;
    seen.set(part.name, n);
    const mesh = new THREE.Mesh(geo, materialFor(part.material));
    mesh.name = n > 1 ? `${part.name}_${n}` : part.name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    model.add(mesh);
  }

  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  model.position.set(-c.x, -box.min.y, -c.z);
  return model;
}
