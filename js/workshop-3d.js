// The workshop's 3D models. index.html imports this module only when the
// workshop section nears the viewport, so three.js never loads for visitors
// who do not scroll that far.
//
// Each <three-d-stage data-model="cajon|saw"> gets a small studio scene:
// soft light, a ground shadow, and a camera framed to fill the stage.
// On a scrolling page the viewer must never trap the page:
//   - no wheel zoom and no pan, ever
//   - mouse and trackpad: drag to turn
//   - touch: swipe sideways to turn; swiping up or down always scrolls the page
//   - prefers-reduced-motion turns the slow turntable off
//   - frames are drawn only while something moves and the stage is on screen

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildCajon } from './cajon-model.js';
import { buildSaw } from './saw-model.js';

const BUILDERS = { cajon: buildCajon, saw: buildSaw };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = matchMedia('(pointer: coarse)');

// How much of the free area the model should fill, and the camera's elevation.
// The free area leaves room for the badge (top) and the turn hint (bottom),
// in CSS pixels, so the model never runs under either label.
const FILL = 0.94;
const RESERVE_TOP = 52;
const RESERVE_BOTTOM = 34;
const RESERVE_SIDE = 16;
const ELEVATION = THREE.MathUtils.degToRad(18);
const START_AZIMUTH = THREE.MathUtils.degToRad(38);

const STYLE = `
  :host { position: absolute; inset: 0; display: block; overflow: hidden; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; outline: none; }
  .note {
    position: absolute; left: 16px; bottom: 14px;
    font: 400 12px/1.5 "Spline Sans Mono", ui-monospace, monospace;
    letter-spacing: 0.04em; color: #B8C2BA; user-select: none; pointer-events: none;
  }
  .err {
    position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
    padding: 24px; text-align: center; color: #B8C2BA;
    font: 400 14px/1.6 "Public Sans", system-ui, sans-serif;
  }
`;

function listen(target, type, fn, cleanups) {
  target.addEventListener(type, fn);
  cleanups.push(() => target.removeEventListener(type, fn));
}

class ThreeDStage extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STYLE;
    this._note = document.createElement('div');
    this._note.className = 'note';
    this._err = document.createElement('div');
    this._err.className = 'err';
    root.append(style, this._note, this._err);
    this._cleanups = [];
  }

  connectedCallback() {
    if (this._booted) { this._resume && this._resume(); return; }
    this._booted = true;
    this._boot().catch((err) => this.fail(err));
  }

  disconnectedCallback() {
    if (this._renderer) this._renderer.setAnimationLoop(null);
  }

  fail(err) {
    console.warn('three-d-stage:', err);
    if (this._renderer) this._renderer.setAnimationLoop(null);
    this._err.textContent = 'The 3D model could not load here.';
    this._err.style.display = 'flex';
    this._note.textContent = '';
    this.dataset.state = 'error';
  }

  async _boot() {
    const build = BUILDERS[this.dataset.model];
    if (!build) throw new Error('unknown model "' + this.dataset.model + '"');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer = renderer;
    this.shadowRoot.insertBefore(renderer.domElement, this._note);
    const canvas = renderer.domElement;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 4 / 3, 0.01, 500);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0002;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
    fill.position.set(-5, 3, -4);
    scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const model = await build();
    scene.add(model);

    // The model turns about its own vertical axis, so frame it for every
    // angle: its height, and the widest it can get as it turns.
    const box = new THREE.Box3().setFromObject(model);
    ground.position.y = box.min.y;
    const center = box.getCenter(new THREE.Vector3());
    const height = box.max.y - box.min.y;
    const reach = Math.hypot(
      Math.max(Math.abs(box.min.x - center.x), Math.abs(box.max.x - center.x)),
      Math.max(Math.abs(box.min.z - center.z), Math.abs(box.max.z - center.z))
    );
    const span = Math.max(height, reach * 2) * 1.5;
    Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span });
    key.shadow.camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(center);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.8;
    controls.autoRotateSpeed = 1.2;
    this._controls = controls;

    // Every point the model can occupy as it turns lies inside a cylinder:
    // radius `reach` around its vertical axis, from its base to its top.
    const ring = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      for (const y of [box.min.y, box.max.y]) ring.push(new THREE.Vector3(center.x + reach * Math.cos(a), y, center.z + reach * Math.sin(a)));
    }
    const probe = new THREE.Vector3();

    let framed = false;
    const frame = () => {
      const w = this.clientWidth || 1;
      const h = this.clientHeight || 1;
      renderer.setSize(w, h, false); // never let the canvas size the layout
      camera.aspect = w / h;
      camera.clearViewOffset();

      // Keep whatever angle the visitor turned to; only the distance changes.
      const dir = framed
        ? camera.position.clone().sub(center).normalize()
        : new THREE.Vector3(
            Math.cos(ELEVATION) * Math.sin(START_AZIMUTH),
            Math.sin(ELEVATION),
            Math.cos(ELEVATION) * Math.cos(START_AZIMUTH)
          );
      framed = true;

      // The free area between the labels, shrunk slightly by FILL.
      const top = Math.min(RESERVE_TOP, h * 0.25), bottom = Math.min(RESERVE_BOTTOM, h * 0.2), side = Math.min(RESERVE_SIDE, w * 0.1);
      const freeW = w - 2 * side, freeH = h - top - bottom;
      const padX = (freeW * (1 - FILL)) / 2, padY = (freeH * (1 - FILL)) / 2;

      // Project the cylinder from a distance; report its pixel extents.
      const extents = (distance) => {
        camera.position.copy(center).addScaledVector(dir, distance);
        camera.near = Math.max(distance / 100, 0.001);
        camera.far = distance * 100;
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of ring) {
          probe.copy(p).project(camera);
          const x = ((probe.x + 1) / 2) * w;
          const y = ((1 - probe.y) / 2) * h;
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
        return { minX, maxX, minY, maxY };
      };
      // Closest distance at which the swept shape fits the free area, then
      // shift the view so it sits centered between the labels.
      const fitsAt = (d) => {
        const e = extents(d);
        return e.maxX - e.minX <= freeW - 2 * padX && e.maxY - e.minY <= freeH - 2 * padY;
      };
      let lo = reach * 1.05 + 0.001, hi = Math.max(height, reach) * 40;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (fitsAt(mid)) hi = mid; else lo = mid;
      }
      const e = extents(hi);
      const shiftX = (e.minX + e.maxX) / 2 - (side + freeW / 2);
      const shiftY = (e.minY + e.maxY) / 2 - (top + freeH / 2);
      camera.setViewOffset(w, h, shiftX, shiftY, w, h);
      camera.updateProjectionMatrix();
      controls.update();
    };

    // Touch: turn sideways only, and let vertical swipes scroll the page.
    // Mouse: drag in any direction, kept above the ground.
    const applyPointerMode = () => {
      const touch = coarsePointer.matches;
      canvas.style.touchAction = 'pan-y pinch-zoom';
      if (touch) {
        controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 2 - ELEVATION;
        this._note.textContent = 'Swipe sideways to turn';
      } else {
        // A little tilt, not enough to push the model out of its frame.
        controls.minPolarAngle = Math.PI / 2 - ELEVATION - THREE.MathUtils.degToRad(10);
        controls.maxPolarAngle = Math.PI / 2 - ELEVATION + THREE.MathUtils.degToRad(8);
        this._note.textContent = 'Drag to turn';
      }
    };

    let onScreen = false;
    let interacting = false;
    let settle = 0;
    const loop = () => { controls.update(); renderer.render(scene, camera); };
    const draw = () => { controls.update(); renderer.render(scene, camera); };
    const run = () => {
      const moving = controls.autoRotate || interacting;
      renderer.setAnimationLoop(onScreen && !document.hidden && moving ? loop : null);
    };
    const applyMotion = () => {
      controls.autoRotate = !reducedMotion.matches && this.hasAttribute('autorotate') && !this._touched;
      run();
      draw();
    };

    const c = this._cleanups;
    listen(controls, 'start', () => {
      this._touched = true;
      controls.autoRotate = false;
      interacting = true;
      clearTimeout(settle);
      run();
    }, c);
    listen(controls, 'end', () => {
      clearTimeout(settle);
      settle = setTimeout(() => { interacting = false; run(); }, 1200); // let damping finish
    }, c);
    listen(coarsePointer, 'change', () => { applyPointerMode(); draw(); }, c);
    listen(reducedMotion, 'change', applyMotion, c);
    listen(document, 'visibilitychange', run, c);

    const ro = new ResizeObserver(() => { frame(); draw(); });
    ro.observe(this);
    c.push(() => ro.disconnect());
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      run();
    });
    io.observe(this);
    c.push(() => io.disconnect());

    applyPointerMode();
    frame();
    applyMotion();
    this._resume = run;
    this.dataset.state = 'ready';

    // For automated checks: render the model turned to an angle and report
    // where its pixels land on the stage, then put everything back.
    this._measure = (angle = 0) => {
      const before = model.rotation.y;
      model.rotation.y = angle;
      controls.update();
      renderer.render(scene, camera);
      const gl = renderer.getContext();
      const W = gl.drawingBufferWidth;
      const H = gl.drawingBufferHeight;
      const px = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      model.rotation.y = before;
      draw();
      let minX = W, minY = H, maxX = -1, maxY = -1, lit = 0;
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const i = (y * W + x) * 4;
          if (px[i + 3] > 40 && px[i] + px[i + 1] + px[i + 2] > 150) {
            lit++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      const dpr = W / (this.clientWidth || W);
      return { W, H, lit, minX, maxX, minY: H - 1 - maxY, maxY: H - 1 - minY, top: RESERVE_TOP * dpr, bottom: RESERVE_BOTTOM * dpr, side: RESERVE_SIDE * dpr };
    };
  }
}

if (!customElements.get('three-d-stage')) customElements.define('three-d-stage', ThreeDStage);
