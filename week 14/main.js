import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let reticle, pyramids;
let hitTestSource = null;
let hitTestSourceRequested = false;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 10, 5);
  scene.add(dirLight);

  // Textures
  const loader = new THREE.TextureLoader();
  const bumpMap = loader.load('brick_bump.jpg');
  const diffuseMap = loader.load('brick_diffuse.jpg');
  const roughMap = loader.load('brick_roughness.jpg');

  // Pyramids
  pyramids = createPyramids(bumpMap, diffuseMap, roughMap);
  pyramids.visible = false;
  scene.add(pyramids);

  // Reticle
  const ringGeo = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  reticle = new THREE.Mesh(ringGeo, ringMat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createPyramids(bumpMap, diffuseMap, roughMap) {
  const group = new THREE.Group();

  // Khufu
  const khufu = new THREE.Mesh(
    new THREE.ConeGeometry(1.63, 1.45, 4),
    new THREE.MeshStandardMaterial({ map: bumpMap })
  );
  khufu.position.set(-6, 1.45 / 2, -6);
  const khufuTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.1, 4),
    new THREE.MeshStandardMaterial({ color: 'gold', metalness: 0.8, roughness: 0.2 })
  );
  khufuTop.position.set(-6, 1.45, -6);
  group.add(khufu, khufuTop);

  // Khafre
  const khafre = new THREE.Mesh(
    new THREE.ConeGeometry(1.48, 1.35, 4),
    new THREE.MeshStandardMaterial({ map: diffuseMap })
  );
  khafre.position.set(0, 1.35 / 2, 0);
  const khafreTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.1, 4),
    new THREE.MeshStandardMaterial({ color: 'gold', metalness: 0.8, roughness: 0.2 })
  );
  khafreTop.position.set(0, 1.35, 0);
  group.add(khafre, khafreTop);

  // Menkaure
  const menkaure = new THREE.Mesh(
    new THREE.ConeGeometry(0.71, 0.65, 4),
    new THREE.MeshStandardMaterial({ map: roughMap })
  );
  menkaure.position.set(6, 0.65 / 2, 6);
  const menkaureTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.05, 4),
    new THREE.MeshStandardMaterial({ color: 'gold', metalness: 0.8, roughness: 0.2 })
  );
  menkaureTop.position.set(6, 0.65, 6);
  group.add(menkaure, menkaureTop);

  return group;
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((refSpace) => {
        session.requestHitTestSource({ space: refSpace }).then((source) => {
          hitTestSource = source;
        });
      });

      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);

        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);

        if (!pyramids.visible) {
          pyramids.visible = true;
          pyramids.position.setFromMatrixPosition(reticle.matrix);
          pyramids.rotation.setFromRotationMatrix(reticle.matrix);
        }
      }
    }
  }

  renderer.render(scene, camera);
}
