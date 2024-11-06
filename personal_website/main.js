import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);



const geometry = new THREE.SphereGeometry( 15, 10, 10 ); 
const material = new THREE.MeshStandardMaterial( { color: 0xffffff, wireframe:false} ); 
const sphere = new THREE.Mesh( geometry, material ); 
scene.add( sphere );
sphere.rotateZ(6);


const light = new THREE.PointLight(0xffffff, 50, 100, 1);
light.position.set(20,0,20);

const ambientLight = new THREE.AmbientLight(0xaaaaaa)
scene.add(light, ambientLight);

//scene.add( camera );

const controls = new OrbitControls( camera, renderer.domElement );

function addBasicStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloat(-100,100));
  star.position.set(x, y, z);
  scene.add(star);
}

// function addPulseStar(){
//   const geometry = new THREE.SphereGeometry(0.25, 24, 24);
//   const material = new THREE.MeshStandardMaterial({color: 0xffffff});
//   const star = new THREE.Mesh(geometry, material);
//   const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloat(-100,100));
//   star.position.set(x, y, z);
//   scene.add(star);
// }
const pulsingStars = [];

function addPulsingStar() {
  const geometry = new THREE.SphereGeometry(0.5, 24, 24);
  const material = new THREE.MeshBasicMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);
  
  // Random position
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
  star.position.set(x, y, z);
  
  // Add custom properties for animation
  star.userData.phase = Math.random() * Math.PI * 2; // Random starting phase
  star.userData.speed = 0.02 + Math.random() * 0.01; // Random speed
  star.userData.baseScale = 1;
  star.userData.pulseScale = 0.3; // How much it will pulse
  
  scene.add(star);
  pulsingStars.push(star);
}

// Create stars
Array(20).fill().forEach(addPulsingStar);


Array(200).fill().forEach(addBasicStar);

function animate() {
  pulsingStars.forEach(star => {
    star.userData.phase += star.userData.speed;
    const scale = star.userData.baseScale + Math.sin(star.userData.phase) * star.userData.pulseScale;
    star.scale.set(scale, scale, scale);
  });

  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  sphere.rotateY(0.005);
}

animate()




