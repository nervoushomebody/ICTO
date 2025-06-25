import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    document.querySelector("#container").appendChild(renderer.domElement);

    // --- LIGHTING ---
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // --- CONTENT GROUP ---
    const contentGroup = new THREE.Group();
    contentGroup.visible = false;
    contentGroup.scale.set(0.05, 0.05, 0.05); // ЗМЕНШЕНО масштаб

    // --- GROUND PLANE (optional visual reference) ---
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: "#7BC8A4", transparent: true, opacity: 0.5 });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    contentGroup.add(floorMesh);

    // --- LOAD TEXTURES ---
    const loader = new THREE.TextureLoader();
    const bump = loader.load('brick_bump.jpg');
    const diffuse = loader.load('brick_diffuse.jpg');
    const rough = loader.load('brick_roughness.jpg');

    // --- PYRAMID MODELS ---
    // Khufu
    const khufu = new THREE.Mesh(
        new THREE.ConeGeometry(1.63, 1.45, 4),
        new THREE.MeshStandardMaterial({ map: bump })
    );
    khufu.position.set(-6, 1.45 / 2, -6);
    const khufuTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.1, 4),
        new THREE.MeshStandardMaterial({ color: 'gold' })
    );
    khufuTop.position.set(-6, 1.45, -6);
    contentGroup.add(khufu, khufuTop);

    // Khafre
    const khafre = new THREE.Mesh(
        new THREE.ConeGeometry(1.48, 1.35, 4),
        new THREE.MeshStandardMaterial({ map: diffuse })
    );
    khafre.position.set(0, 1.35 / 2, 0);
    const khafreTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.1, 4),
        new THREE.MeshStandardMaterial({ color: 'gold' })
    );
    khafreTop.position.set(0, 1.35, 0);
    contentGroup.add(khafre, khafreTop);

    // Menkaure
    const menkaure = new THREE.Mesh(
        new THREE.ConeGeometry(0.71, 0.65, 4),
        new THREE.MeshStandardMaterial({ map: rough })
    );
    menkaure.position.set(6, 0.65 / 2, 6);
    const menkaureTop = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.05, 4),
        new THREE.MeshStandardMaterial({ color: 'gold' })
    );
    menkaureTop.position.set(6, 0.65, 6);
    contentGroup.add(menkaure, menkaureTop);

    scene.add(contentGroup);

    // --- AR BUTTON ---
    const button = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
    });
    button.id = 'ar-button';
    document.body.appendChild(button);

    // --- RETICLE ---
    const reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.07, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // --- PLACE CONTENT ON TAP ---
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
        if (!contentGroup.visible && reticle.visible) {
            contentGroup.position.setFromMatrixPosition(reticle.matrix);
            contentGroup.visible = true;
        }
    });
    scene.add(controller);

    // --- HIT TEST SUPPORT ---
    let hitTestSource = null;
    let hitTestSourceRequested = false;

    const clock = new THREE.Clock();

    renderer.setAnimationLoop((timestamp, frame) => {
        const deltaTime = clock.getDelta();

        if (frame) {
            const session = renderer.xr.getSession();
            if (!hitTestSourceRequested) {
                session.requestReferenceSpace('viewer').then((referenceSpace) => {
                    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                        hitTestSource = source;
                    });
                });
                session.addEventListener('end', () => {
                    hitTestSource = null;
                    hitTestSourceRequested = false;
                });
                hitTestSourceRequested = true;
            }

            if (hitTestSource) {
                const hitTestResults = frame.getHitTestResults(hitTestSource);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(renderer.xr.getReferenceSpace());
                    reticle.visible = true;
                    reticle.matrix.fromArray(pose.transform.matrix);
                } else {
                    reticle.visible = false;
                }
            }
        }

        renderer.render(scene, camera);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
