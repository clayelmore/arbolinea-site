// The workshop's 3D models. index.html imports this module only when the
// workshop section nears the viewport, so three.js never loads for visitors
// who do not scroll that far.
//
// Each <three-d-stage data-model="cajon|saw"> gets a small studio scene:
// soft light, a ground shadow, and a camera framed to the object.
// On a scrolling page the viewer must never trap the page:
//   - no wheel zoom and no pan, ever
//   - mouse and trackpad can drag to turn the model
//   - touch screens get no drag at all, so a finger always scrolls the page
//   - prefers-reduced-motion turns the slow turntable off
//   - rendering pauses while the stage is off screen or the tab is hidden

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildCajon } from './cajon-model.js';
import { buildSaw } from './saw-model.js';

const BUILDERS = { cajon: buildCajon, saw: buildSaw };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = matchMedia('(pointer: coarse)');

const STYLE = `
  :host { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; }
  canvas { display: block; outline: none; }
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
  }

  connectedCallback() {
    if (this._booted) return;
    this._booted = true;
    this._boot().catch((err) => {
      console.warn('three-d-stage:', err);
      if (this._renderer) this._renderer.setAnimationLoop(null);
      this._err.textContent = 'The 3D model could not load here.';
      this._err.style.display = 'flex';
      this._note.textContent = '';
      this.dataset.state = 'error';
    });
  }

  async _boot() {
    const build = BUILDERS[this.dataset.model];
    if (!build) throw new Error('unknown model "' + this.dataset.model + '"');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer = renderer;
    this.shadowRoot.insertBefore(renderer.domElement, this._note);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    this._controls = controls;

    const applyPointerMode = () => {
      const touch = coarsePointer.matches;
      controls.enabled = !touch;
      // With orbit off, let touches fall through to the page so it scrolls.
      renderer.domElement.style.pointerEvents = touch ? 'none' : 'auto';
      renderer.domElement.style.touchAction = touch ? 'auto' : 'pan-y';
      this._note.textContent = touch ? '' : 'Drag to turn';
    };
    const applyMotion = () => { controls.autoRotate = !reducedMotion.matches && this.hasAttribute('autorotate'); };
    applyPointerMode();
    applyMotion();
    coarsePointer.addEventListener('change', applyPointerMode);
    reducedMotion.addEventListener('change', applyMotion);

    const model = await build();
    const box = new THREE.Box3().setFromObject(model);
    ground.position.y = box.min.y;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const dist = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.35;
    camera.position.copy(sphere.center).add(new THREE.Vector3(1, 0.55, 1.25).normalize().multiplyScalar(dist));
    camera.near = Math.max(dist / 100, 0.01);
    camera.far = dist * 100;
    controls.target.copy(sphere.center);
    const span = sphere.radius * 3;
    Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span });
    key.shadow.camera.updateProjectionMatrix();
    scene.add(model);

    const fit = () => {
      const w = this.clientWidth || 1;
      const h = this.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();
    new ResizeObserver(fit).observe(this);

    const loop = () => { controls.update(); renderer.render(scene, camera); };
    let onScreen = false;
    const run = () => renderer.setAnimationLoop(onScreen && !document.hidden ? loop : null);
    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      run();
    }).observe(this);
    document.addEventListener('visibilitychange', run);
    controls.update();
    renderer.render(scene, camera);
    this.dataset.state = 'ready';
  }
}

if (!customElements.get('three-d-stage')) customElements.define('three-d-stage', ThreeDStage);
