import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock } from 'three';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const contactForm = document.getElementById('contactForm');

// Custom cursor
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

// Custom cursor ripple
const cursorRipple = document.createElement('div');
cursorRipple.classList.add('cursor-ripple');
document.body.appendChild(cursorRipple);

// Custom cursor follow logic
document.addEventListener('mousemove', (e) => {
  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.2,
    ease: 'power2.out'
  });
});

// Cursor effects for interactive elements
document.querySelectorAll('a, button, .card, .theme-toggle, .filter-btn, .back-to-top, .mobile-nav-toggle, .mobile-menu a').forEach(element => {
  element.addEventListener('mouseenter', () => {
    cursor.classList.add('cursor-hover');
    
    // Create ripple effect
    cursorRipple.style.left = cursor.style.left;
    cursorRipple.style.top = cursor.style.top;
    cursorRipple.classList.add('active');
    
    setTimeout(() => {
      cursorRipple.classList.remove('active');
    }, 500);
  });
  
  element.addEventListener('mouseleave', () => {
    cursor.classList.remove('cursor-hover');
  });
  
  // Fix cursor click accuracy by making the hover area work for the entire cursor
  element.addEventListener('mousedown', (e) => {
    if (!e.isTrusted) return; // Skip synthetic events
    
    const rect = element.getBoundingClientRect();
    const cursorRect = cursor.getBoundingClientRect();
    
    // Check if any part of the cursor overlaps with the element
    if (!(cursorRect.right < rect.left || 
          cursorRect.left > rect.right || 
          cursorRect.bottom < rect.top || 
          cursorRect.top > rect.bottom)) {
      // If overlapping, trigger a click
      element.click();
    }
  });
});

// Achievement system
let achievements = {
  scrollToBottom: false,
  clickDNA: false,
  toggleTheme: false,
  viewAllProjects: false,
  submitForm: false,
  asteroidDestroyed: false
};

// Achievement notifications
function showAchievement(title, description) {
  const achievementElement = document.createElement('div');
  achievementElement.classList.add('achievement');
  achievementElement.innerHTML = `
    <div class="achievement-icon">🏆</div>
    <div class="achievement-content">
      <h4>${title}</h4>
      <p>${description}</p>
    </div>
  `;
  
  document.body.appendChild(achievementElement);
  
  // Animate in
  gsap.fromTo(achievementElement, 
    { x: 300, opacity: 0 }, 
    { x: 0, opacity: 1, duration: 0.5, ease: 'back.out' }
  );
  
  // Animate out after delay
  setTimeout(() => {
    gsap.to(achievementElement, {
      x: 300, 
      opacity: 0, 
      duration: 0.5, 
      ease: 'back.in',
      onComplete: () => achievementElement.remove()
    });
  }, 5000);
}

// Theme Toggle
let isDarkMode = true;

themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  
  if (isDarkMode) {
    document.body.classList.remove('light-mode');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    scene.background = new THREE.Color(0x0f0f1e);
  } else {
    document.body.classList.add('light-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    scene.background = new THREE.Color(0xf8f9fa);
  }
  
  // Achievement for toggling theme
  if (!achievements.toggleTheme) {
    achievements.toggleTheme = true;
    showAchievement('Theme Switcher', 'You discovered the theme toggle option!');
  }
});

// Contact Form
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! This form is not connected to a backend yet.');
    contactForm.reset();
    
    // Achievement for submitting form
    if (!achievements.submitForm) {
      achievements.submitForm = true;
      showAchievement('Get In Touch', 'Thanks for reaching out to Neal!');
    }
  });
}

// Progress tracker
const progressBar = document.createElement('div');
progressBar.classList.add('progress-bar');
document.body.appendChild(progressBar);

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Raycaster for interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event for object interaction
window.addEventListener('click', (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // Check for DNA helix click
  if (intersects.length > 0) {
    const object = findParentObject(intersects[0].object);
    
    if (object === dnaHelix) {
      // DNA Helix animation on click
      gsap.to(dnaHelix.rotation, {
        y: dnaHelix.rotation.y + Math.PI * 2,
        duration: 2,
        ease: 'elastic.out(1, 0.3)'
      });
      
      // Achievement for interacting with DNA
      if (!achievements.clickDNA) {
        achievements.clickDNA = true;
        showAchievement('DNA Explorer', 'You discovered the interactive DNA model!');
      }
    } else if (techIcons.some(item => item.icon === object)) {
      // Tech icon animation on click
      gsap.to(object.scale, {
        x: 1.5, y: 1.5, z: 1.5,
        duration: 0.5,
        ease: 'back.out',
        yoyo: true,
        repeat: 1
      });
      
      // Create a pulsing ring effect
      createPulseEffect(object.position);
    }
  }
});

// Helper to find parent object
function findParentObject(object) {
  if (object.parent === scene) {
    return object;
  }
  if (object.parent) {
    return findParentObject(object.parent);
  }
  return null;
}

// Create pulse effect
function createPulseEffect(position) {
  const geometry = new THREE.RingGeometry(0, 2, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1
  });
  
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  ring.lookAt(camera.position);
  scene.add(ring);
  
  // Animate the ring
  gsap.to(ring.scale, {
    x: 3, y: 3, z: 3,
    duration: 1,
    ease: 'power2.out'
  });
  
  gsap.to(material, {
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
    onComplete: () => {
      scene.remove(ring);
      ring.geometry.dispose();
      material.dispose();
    }
  });
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Background
scene.background = new THREE.Color(0x0f0f1e);

// Add floating particles
function addParticles() {
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 12000;
  
  const posArray = new Float32Array(particlesCount * 3);
  
  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 1200;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0x3498db,
    transparent: true,
    opacity: 0.8,
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  return particlesMesh;
}

// Add galaxy clouds
function addGalaxies() {
  const galaxyCount = 15;
  const galaxies = [];
  
  for(let i = 0; i < galaxyCount; i++) {
    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyParticles = 3000;
    const positions = new Float32Array(galaxyParticles * 3);
    const colors = new Float32Array(galaxyParticles * 3);
    
    const centerX = (Math.random() - 0.5) * 1000;
    const centerY = (Math.random() - 0.5) * 1000;
    const centerZ = (Math.random() - 0.5) * 1000;
    
    for(let j = 0; j < galaxyParticles; j++) {
      const radius = Math.random() * 80;
      const angle = Math.random() * Math.PI * 2;
      const spiralAngle = angle + (radius * 0.2);
      
      positions[j * 3] = centerX + Math.cos(spiralAngle) * radius;
      positions[j * 3 + 1] = centerY + (Math.random() - 0.5) * 20;
      positions[j * 3 + 2] = centerZ + Math.sin(spiralAngle) * radius;
      
      const hue = Math.random() * 0.2 + 0.5;
      const saturation = 0.8 + Math.random() * 0.2;
      const lightness = 0.4 + Math.random() * 0.2;
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[j * 3] = color.r;
      colors[j * 3 + 1] = color.g;
      colors[j * 3 + 2] = color.b;
    }
    
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);
    galaxies.push(galaxy);
  }
  
  return galaxies;
}

const particles = addParticles();
const galaxies = addGalaxies();

// Function to add images to the Three.js scene
function addImageToScene(imagePath, position, scale = 1, rotation = { x: 0, y: 0, z: 0 }) {
  // Create a texture loader
  const textureLoader = new THREE.TextureLoader(loadingManager);
  
  // Load the texture
  const texture = textureLoader.load(imagePath);
  
  // Create material with the texture
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  // Create a plane geometry
  const geometry = new THREE.PlaneGeometry(scale, scale * (texture.image ? texture.image.height / texture.image.width : 1));
  
  // Create the mesh
  const imageMesh = new THREE.Mesh(geometry, material);
  
  // Set position and rotation
  imageMesh.position.set(position.x, position.y, position.z);
  imageMesh.rotation.set(rotation.x, rotation.y, rotation.z);
  
  // Add to the scene
  scene.add(imageMesh);
  
  return imageMesh;
}

// Interactive mouse trail in 3D space
const mouseTrailPoints = [];
const mouseTrailGeometry = new THREE.BufferGeometry();
const mouseTrailMaterial = new THREE.LineBasicMaterial({
  color: 0x9b59b6,
  transparent: true,
  opacity: 0.5
});

// Initialize positions for mouse trail
const mouseTrailPositions = new Float32Array(50 * 3); // 50 points, 3 coordinates each
mouseTrailGeometry.setAttribute('position', new THREE.BufferAttribute(mouseTrailPositions, 3));

const mouseTrail = new THREE.Line(mouseTrailGeometry, mouseTrailMaterial);
scene.add(mouseTrail);

// DNA Double Helix - representing Neal's interest in biology and technology
function createDNAHelix() {
  const group = new THREE.Group();
  
  const radius = 8;
  const height = 40;
  const turns = 3;
  const pointsPerTurn = 20;
  const totalPoints = turns * pointsPerTurn;
  
  // Create the two strands
  for (let strand = 0; strand < 2; strand++) {
    const points = [];
    const strandOffset = Math.PI * strand; // Offset second strand by 180 degrees
    
    // Generate points along the helix
    for (let i = 0; i < totalPoints; i++) {
      const angle = (i / pointsPerTurn) * Math.PI * 2;
      const x = radius * Math.cos(angle + strandOffset);
      const y = (i / totalPoints) * height - height / 2;
      const z = radius * Math.sin(angle + strandOffset);
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    // Create the strand
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 200, 0.3, 8, false);
    const material = new THREE.MeshStandardMaterial({ 
      color: strand === 0 ? 0x3498db : 0x9b59b6,
      roughness: 0.4,
      metalness: 0.3,
      emissive: strand === 0 ? 0x3498db : 0x9b59b6,
      emissiveIntensity: 0.2
    });
    
    const strand_mesh = new THREE.Mesh(geometry, material);
    strand_mesh.userData = { type: 'dna' };
    group.add(strand_mesh);
    
    // Add "base pairs" connecting the strands
    for (let i = 0; i < totalPoints; i += 4) {
      if (i + 1 >= totalPoints) continue;
      
      const angle1 = (i / pointsPerTurn) * Math.PI * 2 + strandOffset;
      const x1 = radius * Math.cos(angle1);
      const y1 = (i / totalPoints) * height - height / 2;
      const z1 = radius * Math.sin(angle1);
      
      const angle2 = (i / pointsPerTurn) * Math.PI * 2 + Math.PI + strandOffset;
      const x2 = radius * Math.cos(angle2);
      const y2 = y1;
      const z2 = radius * Math.sin(angle2);
      
      const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2)), 8);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2ecc71,
        roughness: 0.5,
        metalness: 0.2,
        emissive: 0x2ecc71,
        emissiveIntensity: 0.2
      });
      
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.userData = { type: 'dna' };
      
      // Position and rotate the cylinder to connect the strands
      baseMesh.position.set((x1 + x2) / 2, y1, (z1 + z2) / 2);
      baseMesh.lookAt(new THREE.Vector3(x2, y2, z2));
      baseMesh.rotateZ(Math.PI / 2);
      
      group.add(baseMesh);
    }
  }
  
  // Position the DNA structure
  group.position.set(-15, 0, -10);
  group.rotation.set(0, Math.PI / 4, 0);
  group.userData = { type: 'dna' };
  
  return group;
}

const dnaHelix = createDNAHelix();
scene.add(dnaHelix);

// Create floating technology icons - more interactive with glow effects
function createTechIcon(position, size, color, iconType) {
  // Create a simple geometry to represent tech
  let geometry;
  
  switch(iconType) {
    case 'python':
      geometry = new THREE.IcosahedronGeometry(size, 0);
      break;
    case 'cpp':
      geometry = new THREE.OctahedronGeometry(size, 0);
      break;
    case 'js':
      geometry = new THREE.DodecahedronGeometry(size, 0);
      break;
    case 'django':
      geometry = new THREE.TorusKnotGeometry(size * 0.6, size * 0.2, 64, 8, 2, 3);
      break;
    case 'react':
      geometry = new THREE.TorusGeometry(size, size * 0.3, 16, 32);
      break;
    default:
      geometry = new THREE.SphereGeometry(size, 16, 16);
  }
  
  // Create glow effect
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      viewVector: { value: new THREE.Vector3(0, 0, 0) }
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float intensity;
      void main() {
        vec3 glow = color * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    metalness: 0.7,
    roughness: 0.3,
    emissive: color,
    emissiveIntensity: 0.3
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  
  // Add glow effect
  const glowMesh = new THREE.Mesh(geometry.clone(), glowMaterial);
  glowMesh.position.copy(mesh.position);
  glowMesh.scale.multiplyScalar(1.2);
  scene.add(glowMesh);
  
  // Add small particle system around the icon
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 30;
  const posArray = new Float32Array(particlesCount * 3);
  
  for(let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = position.x + (Math.random() - 0.5) * 5;
    posArray[i+1] = position.y + (Math.random() - 0.5) * 5;
    posArray[i+2] = position.z + (Math.random() - 0.5) * 5;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: color,
    transparent: true,
    opacity: 0.8,
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  return { icon: mesh, particles: particlesMesh, glow: glowMesh, type: iconType };
}

// Add various tech icons
const techIcons = [
  createTechIcon(new THREE.Vector3(15, 8, -5), 1.5, 0x3498db, 'python'),  // Python
  createTechIcon(new THREE.Vector3(18, -5, -8), 1.2, 0xe74c3c, 'cpp'), // C++
  createTechIcon(new THREE.Vector3(12, -10, 0), 1.0, 0xf1c40f, 'js'), // JavaScript
  createTechIcon(new THREE.Vector3(10, 12, -10), 1.3, 0x2ecc71, 'django'), // Django
  createTechIcon(new THREE.Vector3(5, -8, -15), 1.4, 0x9b59b6, 'react'),  // React
];

techIcons.forEach(obj => scene.add(obj.icon));

// Create a torus to represent circular connectivity
const torus = new THREE.Mesh(
  new THREE.TorusGeometry(30, 1, 16, 50),
  new THREE.MeshStandardMaterial({ 
    color: 0x3498db,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x3498db,
    emissiveIntensity: 0.2
  })
);
torus.position.z = -30;
torus.position.x = 20;
torus.rotation.x = Math.PI / 3;
scene.add(torus);

// Controls - limit for better performance
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loading screen
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.createElement('div');
loadingScreen.classList.add('loading-screen');
loadingScreen.innerHTML = `
  <div class="loading-content">
    <h2>Neal Kapadia</h2>
    <div class="loading-bar-container">
      <div class="loading-bar"></div>
    </div>
    <p class="loading-text">Loading Experience...</p>
  </div>
`;
document.body.appendChild(loadingScreen);

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progressPercent = (itemsLoaded / itemsTotal) * 100;
  document.querySelector('.loading-bar').style.width = `${progressPercent}%`;
};

loadingManager.onLoad = () => {
  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      loadingScreen.style.display = 'none';
    }
  });
};

// After defining onLoad, manually trigger it to hide the loading screen
loadingManager.onLoad();

// Update progress bar on scroll
window.addEventListener('scroll', () => {
  const totalHeight = document.body.scrollHeight - window.innerHeight;
  const progress = (window.pageYOffset / totalHeight) * 100;
  progressBar.style.width = `${progress}%`;
  
  // Show/hide back to top button
  if (window.pageYOffset > 300) {
    backToTopButton.classList.add('visible');
  } else {
    backToTopButton.classList.remove('visible');
  }
});

// Scroll animations
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  
  // Smoother rotation for DNA with lerp
  const targetRotationY = 0.5 + t * -0.0003;
  const targetRotationZ = t * -0.0001;
  dnaHelix.rotation.y += (targetRotationY - dnaHelix.rotation.y) * 0.05;
  dnaHelix.rotation.z += (targetRotationZ - dnaHelix.rotation.z) * 0.05;
  
  // Smoother tech icons movement
  techIcons.forEach((obj, i) => {
    const targetRotX = t * -0.0001 * (i % 3 + 1);
    const targetRotY = t * -0.0002 * (i % 2 + 1);
    obj.icon.rotation.x += (targetRotX - obj.icon.rotation.x) * 0.05;
    obj.icon.rotation.y += (targetRotY - obj.icon.rotation.y) * 0.05;
    obj.icon.position.y = obj.baseY + Math.sin(t * 0.001 + i) * 0.01;
    
    obj.glow.position.copy(obj.icon.position);
    obj.glow.rotation.copy(obj.icon.rotation);
  });
  
  // Smoother torus movement
  const targetTorusX = t * -0.0002;
  const targetTorusY = t * -0.0001;
  torus.rotation.x += (targetTorusX - torus.rotation.x) * 0.05;
  torus.rotation.y += (targetTorusY - torus.rotation.y) * 0.05;
  
  // Modified camera movement to come closer while scrolling
  const targetZ = 30 - t * 0.01;  // Changed from + to - to reverse the direction
  const targetX = t * -0.001;
  const targetY = t * -0.001;
  camera.position.z += (targetZ - camera.position.z) * 0.05;
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;
  
  // Smoother particles rotation
  particles.rotation.y += (t * -0.00005 - particles.rotation.y) * 0.05;
}

document.body.onscroll = moveCamera;
moveCamera();

// Update mouse trail in 3D space
document.addEventListener('mousemove', (event) => {
  // Convert mouse position to 3D space
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Project mouse position to 3D space
  const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
  vector.unproject(camera);
  
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  
  // Add point to mouse trail
  mouseTrailPoints.push({
    position: pos.clone(),
    time: Date.now()
  });
  
  // Keep trail at 50 points max
  if (mouseTrailPoints.length > 50) {
    mouseTrailPoints.shift();
  }
});

// Interactive Modal System for project details
const modalSystem = {
  openModal: (content) => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        ${content}
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation
    gsap.fromTo(modal.querySelector('.modal-content'),
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'back.out' }
    );
    
    // Close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
      gsap.to(modal.querySelector('.modal-content'), {
        y: -50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => modal.remove()
      });
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        gsap.to(modal.querySelector('.modal-content'), {
          y: -50,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => modal.remove()
        });
      }
    });
  }
};

// Add project modal functionality
document.querySelectorAll('.card .btn-primary').forEach(button => {
  const card = button.closest('.card');
  const title = card.querySelector('.card-title').textContent;
  const subtitle = card.querySelector('.card-subtitle').textContent;
  const content = card.querySelector('.card-content').textContent;
  
  // Replace default link behavior with modal
  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    modalSystem.openModal(`
      <h3>${title}</h3>
      <p class="modal-subtitle">${subtitle}</p>
      <div class="modal-body">
        <p>${content}</p>
        <p>This project showcases Neal's skills in programming and problem-solving, integrating his unique perspective on technology and healthcare.</p>
      </div>
      <div class="modal-footer">
        <a href="${button.href}" class="btn btn-primary" target="_blank">View on GitHub</a>
      </div>
    `);
    
    // Achievement for viewing project details
    if (!achievements.viewAllProjects) {
      setTimeout(() => {
        achievements.viewAllProjects = true;
        showAchievement('Project Explorer', 'You\'re diving deep into Neal\'s work!');
      }, 1000);
    }
  });
});

// Animations
function animateDNA() {
  dnaHelix.rotation.y += 0.002;
}

function animateTechIcons() {
  techIcons.forEach((obj, i) => {
    obj.icon.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
    obj.icon.rotation.y += 0.01;
    
    // Pulse glow effect
    const pulseScale = 1.2 + Math.sin(Date.now() * 0.002 + i) * 0.05;
    obj.glow.scale.set(pulseScale, pulseScale, pulseScale);
    
    // Update view vector for glow shader
    if (obj.glow.material.uniforms && obj.glow.material.uniforms.viewVector) {
      const viewVector = new THREE.Vector3().subVectors(camera.position, obj.icon.position);
      obj.glow.material.uniforms.viewVector.value = viewVector;
    }
  });
}

function animateTorus() {
  torus.rotation.x += 0.003;
  torus.rotation.y += 0.002;
  torus.rotation.z += 0.001;
}

function animateParticles() {
  particles.rotation.y += 0.0005;
}

function updateMouseTrail() {
  // Remove old points
  const now = Date.now();
  while (mouseTrailPoints.length > 0 && now - mouseTrailPoints[0].time > 1000) {
    mouseTrailPoints.shift();
  }
  
  // Update trail geometry
  if (mouseTrailPoints.length > 1) {
    const positions = mouseTrailGeometry.attributes.position.array;
    
    for (let i = 0; i < mouseTrailPoints.length; i++) {
      const point = mouseTrailPoints[i].position;
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    // Fill remaining positions with last point
    for (let i = mouseTrailPoints.length; i < 50; i++) {
      const lastPoint = mouseTrailPoints[mouseTrailPoints.length - 1].position;
      positions[i * 3] = lastPoint.x;
      positions[i * 3 + 1] = lastPoint.y;
      positions[i * 3 + 2] = lastPoint.z;
    }
    
    mouseTrailGeometry.attributes.position.needsUpdate = true;
  }
}

// Scroll reveal animation
function handleScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
  
  // Activate timeline items when they're in view
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    const itemTop = item.getBoundingClientRect().top;
    if (itemTop < window.innerHeight - 150) {
      item.classList.add('active');
    }
  });
}

// Call on page load and scroll
window.addEventListener('scroll', handleScrollReveal);
window.addEventListener('load', handleScrollReveal);

// Project Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projects .card');

function filterProjects(filter) {
  projectCards.forEach(card => {
    if (filter === 'all' || card.dataset.category === filter) {
      gsap.to(card, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3, 
        ease: 'power1.out',
        clearProps: 'all' 
      });
      card.style.display = 'block';
    } else {
      gsap.to(card, { 
        opacity: 0, 
        scale: 0.8, 
        duration: 0.3, 
        ease: 'power1.in',
        onComplete: () => {
          card.style.display = 'none';
        }
      });
    }
  });
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Filter the projects
    filterProjects(filter);
  });
});

// Download resume functionality
const downloadBtn = document.querySelector('.download-btn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // In a real implementation, this would point to an actual file
    showAchievement('Resume Downloaded', 'You\'ve downloaded Neal\'s resume!');
  });
}

// Make cards clickable to show project details
document.querySelectorAll('.card').forEach(card => {
  if (!card.querySelector('.btn-primary')) return;
  
  card.addEventListener('click', (e) => {
    // Only trigger if not clicking on the button itself
    if (!e.target.closest('.btn-primary')) {
      card.querySelector('.btn-primary').click();
    }
  });
});

// Clock for animations
const clock = new Clock();

// Asteroid field
const asteroids = [];
function createAsteroids() {
  const geo = new THREE.IcosahedronGeometry(1.5, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 1, metalness: 0.2 });
  for (let i = 0; i < 20; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, -50 - Math.random() * 100);
    mesh.userData = { type: 'asteroid' };
    scene.add(mesh);
    asteroids.push(mesh);
  }
}
createAsteroids();

// Missile & Explosion System
const missiles = [];
const explosions = [];

// Missile geometry & material
const missileGeometry = new THREE.ConeGeometry(0.2, 1, 8);
const missileMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Update launchMissile to accept direction
function launchMissile(direction) {
  const missile = new THREE.Mesh(missileGeometry, missileMaterial);
  missile.position.copy(camera.position);
  missile.userData = { velocity: direction.clone().multiplyScalar(50), life: 0 };
  scene.add(missile);
  missiles.push(missile);
}

// Bind missile launch to click, aiming at mouse position
window.addEventListener('pointerdown', (event) => {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const direction = raycaster.ray.direction;
  launchMissile(direction);
});

// Update missiles and detect collisions with asteroids
function updateMissiles(delta) {
  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    m.position.addScaledVector(m.userData.velocity, delta);
    m.userData.life += delta;
    // Check asteroid collisions
    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const ast = asteroids[ai];
      if (m.position.distanceTo(ast.position) < 2) {
        createExplosion(ast.position.clone());
        scene.remove(ast);
        asteroids.splice(ai, 1);
        if (!achievements.asteroidDestroyed) {
          achievements.asteroidDestroyed = true;
          showAchievement('Asteroid Destroyed', 'You destroyed an asteroid!');
        }
        scene.remove(m);
        missiles.splice(i, 1);
        break;
      }
    }
    // Expire missile if no collision
    if (missiles[i] === m && m.userData.life > 2) {
      createExplosion(m.position.clone());
      scene.remove(m);
      missiles.splice(i, 1);
    }
  }
}

function createExplosion(position) {
  const count = 50;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    positions[idx] = position.x;
    positions[idx + 1] = position.y;
    positions[idx + 2] = position.z;
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(10);
    velocities[idx] = dir.x;
    velocities[idx + 1] = dir.y;
    velocities[idx + 2] = dir.z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

  const material = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.2, transparent: true });
  const points = new THREE.Points(geometry, material);
  points.userData = { life: 0 };
  scene.add(points);
  explosions.push(points);
}

function updateExplosions(delta) {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const p = explosions[i];
    const posAttr = p.geometry.attributes.position;
    const velAttr = p.geometry.attributes.velocity;
    const len = posAttr.count;

    for (let j = 0; j < len; j++) {
      const idx = j * 3;
      velAttr.array[idx + 1] -= 9.8 * delta * 0.5;
      posAttr.array[idx] += velAttr.array[idx] * delta;
      posAttr.array[idx + 1] += velAttr.array[idx + 1] * delta;
      posAttr.array[idx + 2] += velAttr.array[idx + 2] * delta;
    }
    posAttr.needsUpdate = true;
    p.userData.life += delta;
    p.material.opacity = THREE.MathUtils.lerp(1, 0, p.userData.life / 2);
    if (p.userData.life > 2) {
      scene.remove(p);
      explosions.splice(i, 1);
    }
  }
}

// Mobile menu functionality
const mobileNavToggle = document.getElementById('mobileNavToggle');
const mobileMenu = document.getElementById('mobileMenu');

mobileNavToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
  
  // Change icon based on menu state
  const icon = mobileNavToggle.querySelector('i');
  if (mobileMenu.classList.contains('active')) {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-times');
  } else {
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  }
});

// Close menu when clicking on a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    const icon = mobileNavToggle.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  });
});

// Set a simple background color instead of background image
function setupBackground() {
  // Set a plain background color
  scene.background = new THREE.Color(0x0f0f1e);
}

// Add images positioned as static interactive elements
function addStaticImages() {
  const images = [];
  const imagePoles = [];

  // Project image paths
  const projectImagePaths = [
    '/images/MockAI.png',
    '/images/Battery Life picture.png',
    '/images/ToDoList.png',
    '/images/personal_website.jpg',
    '/images/prirosystems.png',
    '/images/Sparse_matrix_calculator icon.webp',
    '/images/SummarizeIt_icon.jpg',
    '/images/Verilog.png'
  ];
  
  // Create interactive images on poles
  projectImagePaths.forEach((path, index) => {
    // Create a group for each image + pole
    const imageGroup = new THREE.Group();
    scene.add(imageGroup);
    imagePoles.push(imageGroup);
    
    // Horizontal position in a grid - 4 columns, 2 rows
    const row = Math.floor(index / 4);
    const col = index % 4;
    const spacing = 12;
    
    const x = (col - 1.5) * spacing;
    const y = row === 0 ? 8 : -8;  // Top or bottom row
    const z = -30;  // Fixed distance from camera
    
    // Position the group
    imageGroup.position.set(x, y, z);
    
    // Create a vertical pole (cylinder)
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 30, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = -15; // Position pole below the image
    imageGroup.add(pole);
    
    // Create the image
    const mesh = addImageToScene(
      path,
      { x: 0, y: 0, z: 0 },  // Center of the group
      5,
      { x: 0, y: 0, z: 0 }
    );
    
    // Remove from scene and add to group
    scene.remove(mesh);
    imageGroup.add(mesh);
    
    // Make image interactive for spinning
    mesh.userData.isInteractive = true;
    mesh.userData.group = imageGroup;
    
    images.push(mesh);
  });
  
  // Tech icons as static elements
  const techIconPaths = [
    '/images/python icon.jpeg',
    '/images/react icon.png',
    '/images/cpp icon.png',
    '/images/django_pandas icon.jpeg'
  ];
  
  // Create tech icons at bottom of screen
  techIconPaths.forEach((path, i) => {
    const spacing = 8;
    const x = (i - 1.5) * spacing;
    const y = -15;
    const z = -25;
    
    // Create a group for each icon + pole
    const iconGroup = new THREE.Group();
    scene.add(iconGroup);
    imagePoles.push(iconGroup);
    
    // Position the group
    iconGroup.position.set(x, y, z);
    
    // Create a shorter pole for tech icons
    const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 10, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = -5; // Position pole below the icon
    iconGroup.add(pole);
    
    // Create the tech icon
    const mesh = addImageToScene(
      path,
      { x: 0, y: 0, z: 0 },
      3,
      { x: 0, y: 0, z: 0 }
    );
    
    // Remove from scene and add to group
    scene.remove(mesh);
    iconGroup.add(mesh);
    
    // Make icon interactive
    mesh.userData.isInteractive = true;
    mesh.userData.group = iconGroup;
    
    images.push(mesh);
  });
  
  return { images, imagePoles };
}

// Add image interactivity for spinning
function addImageInteractivity() {
  // Event for spinning images on poles
  window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersecting objects
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      // Try to find the first interactive object
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        
        // Check if this is an interactive image
        if (object.userData.isInteractive) {
          // Get the group (image + pole)
          const group = object.userData.group;
          
          // Animate the spin
          gsap.to(group.rotation, {
            y: group.rotation.y + Math.PI * 2,
            duration: 1.5,
            ease: 'elastic.out(1, 0.3)'
          });
          
          break;
        }
      }
    }
  });
}

// Setup scene with only essential elements
setupBackground();
const { images, imagePoles } = addStaticImages();
addImageInteractivity();

// Update animation loop (simplified)
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.update();
  
  // Render
  renderer.render(scene, camera);
}

animate();

// Back to top button functionality
const backToTopButton = document.getElementById('backToTop');

backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Achievement for reaching the bottom
window.addEventListener('scroll', () => {
  const totalHeight = document.body.scrollHeight - window.innerHeight;
  const progress = (window.pageYOffset / totalHeight) * 100;
  
  if (progress > 95 && !achievements.scrollToBottom) {
    achievements.scrollToBottom = true;
    showAchievement('Journey Complete', 'You\'ve explored Neal\'s entire portfolio!');
  }
});

// Help for running the development server
console.log(`
=================================================
Running the app in PowerShell:
1. First navigate to the frontend directory:
   cd frontend
   
2. Then run the development server:
   npm run dev

NOTE: In PowerShell, you cannot use && to combine commands.
You must run them separately as shown above.
=================================================
`);