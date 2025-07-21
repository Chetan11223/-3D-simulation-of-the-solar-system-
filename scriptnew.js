// Global variables for control states
let paused = false;
let darkMode = true;

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 60;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Function to create lighting in the scene
function createLight() {
  const light = new THREE.PointLight(0xffffff, 2, 500);
  scene.add(light);
}

// Function to create background stars
function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starPositions = [];

  for (let i = 0; i < starCount; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// Function to create the sun
function createSun() {
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
}

// Function to create planets and their UI controls
function createPlanets(planetsData) {
  const planets = [];
  const angles = [];
  const labels = [];

  planetsData.forEach((data, index) => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: data.color });
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    planets.push({ mesh: planet, distance: data.distance, speed: data.speed });

    angles.push(Math.random() * Math.PI * 2);
    createPlanetControls(data, index, planets);
    createPlanetLabel(data.name, planet.position, labels);
  });

  return { planets, angles, labels };
}

// Function to create UI controls for each planet
function createPlanetControls(data, index, planets) {
  const controlsDiv = document.getElementById("controls");
  const label = document.createElement("label");
  label.innerHTML = `${data.name}: `;
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0.001";
  slider.max = "0.05";
  slider.step = "0.001";
  slider.value = data.speed;
  slider.oninput = (e) => {
    planets[index].speed = parseFloat(e.target.value);
  };
  controlsDiv.appendChild(label);
  controlsDiv.appendChild(slider);
  controlsDiv.appendChild(document.createElement("br"));
}

// Function to create a label for each planet
function createPlanetLabel(name, position, labels) {
  const canvasLabel = document.createElement("div");
  canvasLabel.textContent = name;
  canvasLabel.style.position = "absolute";
  canvasLabel.style.color = "white";
  canvasLabel.style.fontSize = "12px";
  canvasLabel.style.pointerEvents = "none";
  document.body.appendChild(canvasLabel);
  labels.push(canvasLabel);
}

// Function to handle pause/resume functionality
function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Pause";
}

// Function to toggle dark/light mode
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? "black" : "white";
  document.getElementById("ui").style.color = darkMode ? "white" : "black";
}

// Function to handle zooming in on a planet when clicked
function handlePlanetClick(event, planets) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    camera.position.set(planet.position.x, planet.position.y + 5, planet.position.z + 10);
    camera.lookAt(planet.position);
  }
}

// Function to animate the scene
function animate(planets, angles, labels) {
  requestAnimationFrame(() => animate(planets, angles, labels));
  if (!paused) {
    planets.forEach((planet, i) => {
      angles[i] += planet.speed;
      const x = Math.cos(angles[i]) * planet.distance;
      const z = Math.sin(angles[i]) * planet.distance;
      planet.mesh.position.set(x, 0, z);

      // Update label position
      const vector = planet.mesh.position.clone().project(camera);
      const xScreen = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const yScreen = (-vector.y * 0.5 + 0.5) * window.innerHeight;
      labels[i].style.left = `${xScreen}px`;
      labels[i].style.top = `${yScreen}px`;
    });
  }
  renderer.render(scene, camera);
}

// Main function to initialize the scene
function init() {
  createLight();
  createStars();
  createSun();

  const planetsData = [
    { name: "Mercury", color: 0xaaaaaa, distance: 8, size: 0.5, speed: 0.04 },
    { name: "Venus",   color: 0xffa500, distance: 11, size: 0.9, speed: 0.015 },
    { name: "Earth",   color: 0x0000ff, distance: 14, size: 1,   speed: 0.01 },
    { name: "Mars",    color: 0xff0000, distance: 17, size: 0.7, speed: 0.008 },
    { name: "Jupiter", color: 0xffd700, distance: 22, size: 2,   speed: 0.006 },
    { name: "Saturn",  color: 0xf5deb3, distance: 27, size: 1.7, speed: 0.005 },
    { name: "Uranus",  color: 0x00ffff, distance: 32, size: 1.3, speed: 0.003 },
    { name: "Neptune", color: 0x00008b, distance: 37, size: 1.2, speed: 0.002 }
  ];

  const { planets, angles, labels } = createPlanets(planetsData);

  // Event listeners for controls
  document.getElementById("pauseBtn").onclick = togglePause;
  document.getElementById("toggleMode").onclick = toggleDarkMode;
  window.addEventListener('click', (event) => handlePlanetClick(event, planets));

  // Start the animation loop
  animate(planets, angles, labels);
}

// Initialize the scene
init();
