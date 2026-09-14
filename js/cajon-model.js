import { loadObjModel } from './obj-model.js';

// Base colors come from be-better-cajon.mtl's Kd values; roughness and
// metalness are tuned for the stage's studio lighting (no env map).
const LOOK = {
  ply:      { color: 0xd1ae78, roughness: 0.62, metalness: 0.0 },
  tapa:     { color: 0xdebc87, roughness: 0.52, metalness: 0.0 },
  hardwood: { color: 0x4f3019, roughness: 0.55, metalness: 0.0 },
  brass:    { color: 0xb8873a, roughness: 0.34, metalness: 0.35 },
  steel:    { color: 0x9aa0a6, roughness: 0.38, metalness: 0.35 },
  rubber:   { color: 0x1c1a17, roughness: 0.92, metalness: 0.0 },
};

const asset = (name) => new URL('../assets/models/' + name, import.meta.url).href;

export function buildCajon() {
  return loadObjModel({
    obj: asset('be-better-cajon.obj'),
    mtl: asset('be-better-cajon.mtl'),
    look: LOOK,
    name: 'be_better_cajon',
  });
}
