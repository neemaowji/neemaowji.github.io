import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(100,100,100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);

const controls = new OrbitControls( camera, renderer.domElement );

const light = new THREE.PointLight(0xffffff, 50, 0, 1);
light.position.set(80,0,80);

const ambientLight = new THREE.AmbientLight(0xaaaaaa)
scene.add(light, ambientLight);

const geometry = new THREE.SphereGeometry( 50, 10, 10 ); 
const material = new THREE.MeshStandardMaterial( { color: 0x00FFA1, wireframe:false} ); 
const planet = new THREE.Mesh( geometry, material ); 
scene.add( planet );
planet.rotateZ(6);

function addPinToSphere(radius, height, radiusTop, radiusBottom, division, num) {
  const cylGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
  const cylMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cylinder = new THREE.Mesh(cylGeometry, cylMaterial);

  const sphGeometry = new THREE.SphereGeometry(2, 10, 10);
  const sphMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
  const sphere = new THREE.Mesh(sphGeometry, sphMaterial);
  

  const theta = (num/division) * Math.PI * 2;
  const phi = ((Math.random() *0.5) + 0.3) * Math.PI;

  sphere.position.set(0, height / 2, 0);
  cylinder.position.set(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );

  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3().subVectors(cylinder.position, sphere.position).normalize();
  cylinder.quaternion.setFromUnitVectors(up, direction);

  cylinder.add(sphere);
  planet.add(cylinder);
}

for (let i = 0; i < 3; i++) {
  addPinToSphere(50, 10, 1, 1, 3, i);
}




function addBasicStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(500));
  star.position.set(x, y, z);
  scene.add(star);
}

const pulsingStars = [];
function addPulsingStar() {
  const geometry = new THREE.SphereGeometry(0.5, 24, 24);
  const material = new THREE.MeshBasicMaterial({color: 0xffff00});
  const star = new THREE.Mesh(geometry, material);
  
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(500));
  star.position.set(x, y, z);
  
  star.userData.phase = Math.random() * Math.PI * 2;
  star.userData.speed = 0.02 + Math.random() * 0.01;
  star.userData.baseScale = 1;
  star.userData.pulseScale = 0.5;
  
  scene.add(star);
  pulsingStars.push(star);
}

Array(200).fill().forEach(addBasicStar);
Array(20).fill().forEach(addPulsingStar);

function animate() {
  pulsingStars.forEach(star => {
    star.userData.phase += star.userData.speed;
    const scale = star.userData.baseScale + Math.sin(star.userData.phase) * star.userData.pulseScale;
    star.scale.set(scale, scale, scale);
  });

  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  planet.rotateY(0.005);
}

animate()




