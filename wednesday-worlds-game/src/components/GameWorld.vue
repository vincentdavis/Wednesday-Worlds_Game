<template>
  <div id="app">
    <div id="info" style="background-color: black">Time: <span id="timer">0</span> seconds</div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { io } from 'socket.io-client';
import cyclistModel from '@/assets/cyclist_model.glb'; // Import the GLB file

export default {
  name: 'CyclistComponent',
  props: ['username'],
  data() {
    return {
      socket: null,
      scene: null,
      camera: null,
      renderer: null,
      cyclist: null,
      ground: null,
      keys: {
        a: { pressed: false },
        d: { pressed: false },
        s: { pressed: false },
        w: { pressed: false },
      },
      players: {}, // To keep track of other players
      mixer: null, // To manage animations
      startTime: null, // Track the start time
      distanceToFinish: 5000, // Distance in meters (5 km)
      finished: false, // Track if race is finished
    };
  },
  mounted() {
    this.initThree();
    this.initSocket();
    this.animate();
    this.addEventListeners();
  },
  methods: {
    onButtonDown(key) {
      this.keys[key].pressed = true;
    },
    onButtonUp(key) {
      this.keys[key].pressed = false;
    },
    initThree() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 2.74, 8);
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.shadowMap.enabled = true;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;

      const loader = new GLTFLoader();
      loader.load(cyclistModel, (gltf) => {
        this.cyclist = gltf.scene;
        this.cyclist.scale.set(0.5, 0.5, 0.5);
        this.cyclist.position.set(0, 0, 0);
        this.cyclist.rotation.y = Math.PI / 2;
        this.cyclist.velocity = { x: 0, y: -0.01, z: 0 };
        this.cyclist.gravity = -0.002;

        // Optional: If the model includes animations
        this.mixer = new THREE.AnimationMixer(this.cyclist);
        gltf.animations.forEach((clip) => {
          this.mixer.clipAction(clip).play();
        });

        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
          const textGeometry = new TextGeometry(this.username, {
            font: font,
            size: 0.2,
            height: 0.02,
          });
          const textMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000' });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.rotation.y = -Math.PI / 2;
          textMesh.position.set(0, 3, 0);
          this.cyclist.add(textMesh);
        });

        this.scene.add(this.cyclist);
      });

      const groundGeometry = new THREE.BoxGeometry(10, 0.5, 500); // Increase length to 500 meters
      const groundMaterial = new THREE.MeshStandardMaterial({ color: '#0369a1' });
      this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
      this.ground.position.y = -2;
      this.scene.add(this.ground);
      this.addRoadDividers()
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.y = 3;
      light.position.z = 1;
      light.castShadow = true;
      this.scene.add(light);
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    },
    initSocket() {
      this.socket = io('http://165.232.188.93:3000');
      this.socket.emit('newPlayer', { username: this.username });
      this.socket.on('updatePlayers', (players) => {
        this.updatePlayers(players);
      });
    },
    addRoadDividers() {
    const dividerGeometry = new THREE.BoxGeometry(0.2, 0.1, 5); // Adjust dimensions of the dividers
    const dividerMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' });

    for (let i = -250; i < 250; i += 10) {  // Adjust the spacing between dividers
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      divider.position.set(0, -1.75, i);
      this.scene.add(divider);
    }
  },
    updatePlayers(players) {
      console.log(players);
      for (const id in this.players) {
        if (!players[id]) {
          this.scene.remove(this.players[id].cyclist);
          delete this.players[id];
        }
      }
      for (const id in players) {
        if (id !== this.socket.id) {
          if (!this.players[id]) {
            const loader = new GLTFLoader();
            loader.load(cyclistModel, (gltf) => {
              const playerCyclist = gltf.scene;
              playerCyclist.scale.set(0.5, 0.5, 0.5);
              playerCyclist.position.set(players[id].position.x, players[id].position.y, players[id].position.z);
              playerCyclist.rotation.y = Math.PI / 2;
              playerCyclist.velocity = { x: 0, y: -0.01, z: 0 };
              playerCyclist.gravity = -0.002;
              
              
              const fontLoader = new FontLoader();
              fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                const textGeometry = new TextGeometry(players[id].username, {
                  font: font,
                  size: 0.2,
                  height: 0.02,
                });
                const textMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' });
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.rotation.y = -Math.PI / 2;
                textMesh.position.set(0, 3, 0);
                playerCyclist.add(textMesh);
              });
              this.scene.add(playerCyclist);
              this.players[id] = { cyclist: playerCyclist };
            });
          } else {
            this.players[id].cyclist.position.set(players[id].position.x, players[id].position.y, players[id].position.z);
          }
        }
      }
    },
    animate() {
    requestAnimationFrame(this.animate);

    if (this.camera && this.cyclist) {
      this.camera.position.x = this.cyclist.position.x;
      this.camera.position.z = this.cyclist.position.z + 10; // Slightly behind the cyclist
      this.camera.lookAt(this.cyclist.position.x, this.cyclist.position.y, this.cyclist.position.z);
    }

    this.updateCyclistPosition();
    this.updateTimer()
    this.renderer.render(this.scene, this.camera);
  },
    updateCyclistPosition() {
    let dx = 0;
    let dz = 0;
    if (this.keys.a.pressed) dx = -0.05;
    else if (this.keys.d.pressed) dx = 0.05;
    if (this.keys.s.pressed) dz = 0.05;
    else if (this.keys.w.pressed) dz = -0.05;

    if (this.cyclist) {
      this.cyclist.position.x += dx;
      this.cyclist.position.z += dz;
    }

    for (const id in this.players) {
      if (id !== this.socket.id) {
        this.players[id].cyclist.position.x += dx;
        this.players[id].cyclist.position.z += dz;
        this.socket.emit('move', { position: this.cyclist.position });

      }
    }

    if (this.cyclist) {
      this.distanceToFinish -= Math.abs(dz * 100); // Adjust as per scale
      if (this.distanceToFinish <= 0 && !this.finished) {
        this.finished = true;
        console.log("Race finished!");
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        alert(`Finished! Time: ${elapsedTime.toFixed(2)} seconds`);
      }
    }
  },
    updateTimer() {
      if (!this.startTime) this.startTime = Date.now();
      const elapsedTime = (Date.now() - this.startTime) / 1000;
      document.getElementById('timer').innerText = elapsedTime.toFixed(2);
    },
    applyGravity(cyclist, ground) {
      if (!cyclist.velocity) {
        cyclist.velocity = { x: 0,y: -0.01,
        z: 0,
      };
    }
    if (cyclist.position.y > ground.position.y + ground.geometry.parameters.height / 2) {
      cyclist.velocity.y += cyclist.gravity;
    } else {
      cyclist.velocity.y = 0;
      cyclist.position.y = ground.position.y + ground.geometry.parameters.height / 2;
    }
    cyclist.position.y += cyclist.velocity.y;
  },
  addEventListeners() {
    
    window.addEventListener('keydown', (event) => {
      if (event.key === 'a' || event.key === 's' || event.key === 'd' || event.key === 'w') {
        this.onButtonDown(event.key);
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.key === 'a' || event.key === 's' || event.key === 'd' || event.key === 'w') {
        this.onButtonUp(event.key);
      }
    });
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  },
},
beforeDestroy() {
  window.removeEventListener('keydown', this.onButtonDown);
  window.removeEventListener('keyup', this.onButtonUp);
  window.removeEventListener('resize', this.onResize);

  if (this.socket) {
    this.socket.disconnect();
  }
},
};
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

#info {
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px;
  color: white;
  font-size: 20px;
  backdrop-filter: blur(10px);
}
</style>
