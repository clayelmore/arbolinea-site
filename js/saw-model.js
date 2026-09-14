import { loadObjModel } from './obj-model.js';

// Base colors come from bucksaw.mtl's Kd values; roughness and metalness
// are tuned for the stage's studio lighting (no env map, so metal stays low).
const LOOK = {
  oak:      { color: 0xbd8a2c, roughness: 0.58, metalness: 0.0 },
  oak_end:  { color: 0x9e7024, roughness: 0.66, metalness: 0.0 },
  steel:    { color: 0xa8abb0, roughness: 0.36, metalness: 0.35 },
  pin:      { color: 0x2a2a2d, roughness: 0.45, metalness: 0.3 },
  hole:     { color: 0x0d0b08, roughness: 0.9,  metalness: 0.0 },
  cord:     { color: 0xd64d1a, roughness: 0.78, metalness: 0.0 },
  canvas:   { color: 0x94918a, roughness: 0.92, metalness: 0.0 },
};

const asset = (name) => new URL('../assets/models/' + name, import.meta.url).href;

// Only the assembled state ships on the site. The folded and stowed states
// and the fold animation live in the design handoff, not in this repo.
export function buildSaw() {
  return loadObjModel({
    obj: asset('bucksaw-open.obj'),
    mtl: asset('bucksaw.mtl'),
    look: LOOK,
    name: 'elmore_buck_saw',
  });
}
