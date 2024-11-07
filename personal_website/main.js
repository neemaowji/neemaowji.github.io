import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(600,200,600);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);
const raycaster = new THREE.Raycaster();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0'; 
document.body.appendChild(labelRenderer.domElement);
labelRenderer.domElement.style.pointerEvents = 'none'

let INTERSECTED;

const planetLight = new THREE.PointLight(0xffffff, 100, 0, 1);
planetLight.position.set(70,35,70);

const moonLight = new THREE.PointLight(0xffffff, 100, 0, 1);
var orbitRadius = 70; // for example
var orbitValue = 0;

const ambientLight = new THREE.AmbientLight(0xaaaaaa)
scene.add(planetLight, moonLight, ambientLight);

const planetGeometry = new THREE.SphereGeometry(50, 20, 20); 
const planetMaterial = new THREE.MeshStandardMaterial( { color: 0x00FFA1, wireframe:false} ); 
const planet = new THREE.Mesh(planetGeometry, planetMaterial); 
scene.add( planet );
planet.rotateZ(6);

const moonGeometry = new THREE.SphereGeometry(10, 20, 20); 
const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, wireframe:false}); 
const moon = new THREE.Mesh(moonGeometry, moonMaterial); 
moon.position.set(0, 50, 50)
scene.add(moon);



const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableRotate = false;
controls.enableZoom = true;
controls.zoomSpeed = 0.5;
let isDragging = false;
const pointer = new THREE.Vector2();
let previousMousePosition = {
    x: 0,
    y: 0
};
controls.touches = {
  ONE: THREE.TOUCH.NONE,
  TWO: THREE.TOUCH.DOLLY
};

controls.minDistance = 150;
controls.maxDistance = 600;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.75;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const activePointers = new Map();

renderer.domElement.addEventListener('pointerdown', (e) => {
  activePointers.set(e.pointerId, e);
  if (activePointers.size === 1) {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
  }
  else{
    isDragging = false;
  }
  if(INTERSECTED){
    console.log(INTERSECTED.userData.name);
  }
});

renderer.domElement.addEventListener('pointerup', (e) => {
  activePointers.delete(e.pointerId);
  isDragging = false;
});

renderer.domElement.addEventListener('pointercancel', (e) => {
  activePointers.delete(e.pointerId);
  isDragging = false;
});

const rotationSpeed = 0.01;
renderer.domElement.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (isDragging && activePointers.size === 1) {
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y,
    };

    const yRotation = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      deltaMove.x * rotationSpeed
    );

    const cameraRight = new THREE.Vector3();
    camera.getWorldDirection(cameraRight).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const xRotation = new THREE.Quaternion().setFromAxisAngle(
      cameraRight,
      deltaMove.y * rotationSpeed
    );

    planet.quaternion.multiplyQuaternions(yRotation, planet.quaternion);
    planet.quaternion.multiplyQuaternions(xRotation, planet.quaternion);

    orbitValue += 0.006 * deltaMove.x;
    moon.position.set(
      Math.cos(orbitValue) * orbitRadius,
      Math.sin(orbitValue) * orbitRadius * 0.4,
      Math.sin(orbitValue) * orbitRadius
    );

    previousMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };
  }
});

const pins = [];

function addPinToSphere(radius, height, radiusTop, radiusBottom, division, num, labelText) {
  const cylGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
  const cylMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cylinder = new THREE.Mesh(cylGeometry, cylMaterial);

  const sphGeometry = new THREE.SphereGeometry(radiusTop + 1, 10, 10);
  const sphMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
  const sphere = new THREE.Mesh(sphGeometry, sphMaterial);
  const theta = (num/division) * Math.PI * 2;
  const phi = ((Math.random() *0.5) + 0.3) * Math.PI;

  sphere.position.set(0, height/2, 0);
  cylinder.position.set(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );

  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3().subVectors(cylinder.position, sphere.position).normalize();
  cylinder.quaternion.setFromUnitVectors(up, direction);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'label';
  labelDiv.textContent = labelText;
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, height/2 + 4, 0);
  cylinder.userData.name = labelText;
  sphere.userData.name = labelText;


  sphere.add(label);
  cylinder.add(sphere);
  planet.add(cylinder);
  pins.push(cylinder);
  pins.push(sphere);

}
const moonLabelDiv = document.createElement('div');
moonLabelDiv.className = 'label';
moonLabelDiv.textContent = "Resume";
const moonLabel = new CSS2DObject(moonLabelDiv);
moon.add(moonLabel);
moon.userData.name = "Resume"
pins.push(moon);

// adding pins that represent pages
addPinToSphere(50, 10, 0.5, 0.2, 3, 1, "About Me");
addPinToSphere(50, 10, 0.5, 0.2, 3, 2, "Porfolio");
addPinToSphere(50, 10, 0.5, 0.2, 3, 3, "Contact");
const axesHelper = new THREE.AxesHelper(500);
scene.add( axesHelper );




function addBasicStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(800));
  star.position.set(x, y, z);
  scene.add(star);
}

const pulsingStars = [];
function addPulsingStar() {
  const geometry = new THREE.SphereGeometry(0.5, 24, 24);
  const material = new THREE.MeshBasicMaterial({color: 0xffff00});
  const star = new THREE.Mesh(geometry, material);
  
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(800));
  star.position.set(x, y, z);
  
  star.userData.phase = Math.random() * Math.PI * 2;
  star.userData.speed = 0.02 + Math.random() * 0.01;
  star.userData.baseScale = 1;
  star.userData.pulseScale = 0.5;
  
  scene.add(star);
  pulsingStars.push(star);
}

// creates the regular and pulsing stars in the scene
Array(800).fill().forEach(addBasicStar);
Array(80).fill().forEach(addPulsingStar);

// handles window resizing
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// determines when pins are clicked and when to show labels
function render() {
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( pins, true );
  if ( intersects.length > 0 ) {
    document.body.style.cursor = 'pointer';
    if ( INTERSECTED != intersects[ 0 ].object ) {
      INTERSECTED = intersects[ 0 ].object;
      //console.log(INTERSECTED.userData.name);
    }

  } else {
    INTERSECTED = null;
    document.body.style.cursor = 'default';
  }

  planet.traverse((child) => {
    if (child instanceof CSS2DObject) {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      const distance = camera.position.distanceTo(worldPos);
      child.visible = distance < 175;
    }
  });
  moon.traverse((child) => {
    if (child instanceof CSS2DObject) {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      const distance = camera.position.distanceTo(worldPos);
      child.visible = distance < 200;
    }
  });

  labelRenderer.render(scene, camera);
  renderer.render( scene, camera );
}






function animate() {
  pulsingStars.forEach(star => {
    star.userData.phase += star.userData.speed;
    const scale = star.userData.baseScale + Math.sin(star.userData.phase) * star.userData.pulseScale;
    star.scale.set(scale, scale, scale);
  });
  if (!isDragging) {
      planet.rotateY(0.002);
      orbitValue += 0.006;
      moon.position.set(
        Math.cos(orbitValue) * orbitRadius,
        Math.sin(orbitValue) * orbitRadius * 0.4,
        Math.sin(orbitValue) * orbitRadius
      );

  }

  render();

  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera); 

}

animate()

