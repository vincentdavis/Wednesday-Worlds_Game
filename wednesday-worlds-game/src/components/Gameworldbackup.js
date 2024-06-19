<template>
    <div id="info" >Time: <span id="timer">{{timer}}</span> seconds</div>
</template>

<template>
  <div></div>
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
      timer: 0,
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
      controls.enableDamping = true; // Optional, but this gives a nice inertia feel

      const loader = new GLTFLoader();
      loader.load(cyclistModel, (gltf) => {
        this.cyclist = gltf.scene;
        this.cyclist.scale.set(0.5, 0.5, 0.5);
        this.cyclist.position.set(0, 0, 0);

        // Adjust orientation if needed (e.g., rotate around Y-axis)
        this.cyclist.rotation.y = Math.PI / 2; // Adjust the angle as necessary

        // Initialize velocity and gravity properties
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
          const textMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000' }); // Color changed to red
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.rotation.y = -Math.PI / 2; // Rotate the text to face right
          textMesh.position.set(0, 3, 0); // Set the textMesh to appear above the cyclist
          this.cyclist.add(textMesh);
        });

        this.scene.add(this.cyclist);
      });

      const groundGeometry = new THREE.BoxGeometry(10, 0.5, 50);
      const groundMaterial = new THREE.MeshStandardMaterial({ color: '#0369a1' });
      this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
      this.ground.position.y = -2;
      this.scene.add(this.ground);



      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.y = 3;
      light.position.z = 1;
      light.castShadow = true;
      this.scene.add(light);

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    },
    initSocket() {
      this.socket = io('http://165.232.188.93:3000'); // Ensure this URL matches your server's address
      this.socket.emit('newPlayer', { username: this.username });

      this.socket.on('updatePlayers', (players) => {
        this.updatePlayers(players);
      });
    },
    updatePlayers(players) {
      console.log(players);
      // Remove models for players who have disconnected
      for (const id in this.players) {
        if (!players[id]) {
          this.scene.remove(this.players[id].cyclist);
          delete this.players[id];
        }
      }

      // Add or update models for current players
      for (const id in players) {
        if (id !== this.socket.id) {
          if (!this.players[id]) {
            // Add new player model
            const loader = new GLTFLoader();
            loader.load(cyclistModel, (gltf) => {
              const playerCyclist = gltf.scene;
              playerCyclist.scale.set(0.5, 0.5, 0.5);
              playerCyclist.position.set(players[id].position.x, players[id].position.y, players[id].position.z);

              // Adjust orientation if needed
              playerCyclist.rotation.y = Math.PI / 2; // Adjust the angle as necessary

              // Initialize velocity and gravity properties
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
                textMesh.position.set(-0.5, 1, 0);
                playerCyclist.add(textMesh);
              });

              this.scene.add(playerCyclist);
              this.players[id] = { cyclist: playerCyclist };
            });
          } else {
            // Update existing player model position
            this.players[id].cyclist.position.set(players[id].position.x, players[id].position.y, players[id].position.z);
          }
        }
      }
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.renderer.render(this.scene, this.camera);

      if (this.mixer) {
        this.mixer.update(0.01);
      }

      this.updateCyclistPosition();

      this.updateTimer();

      let dx = 0;
      let dz = 0;

      if (this.keys.a.pressed) dx = -0.05;
      else if (this.keys.d.pressed) dx = 0.05;

      if (this.keys.s.pressed) dz = 0.05;
      else if (this.keys.w.pressed) dz = -0.05;

      // Move the ground and all other objects except the main cyclist
      if (this.ground) {
        this.ground.position.x -= dx;
        this.ground.position.z -= dz;
      }

      for (const id in this.players) {
        if (id !== this.socket.id) {
          this.players[id].cyclist.position.x -= dx;
          this.players[id].cyclist.position.z -= dz;
        }
      }

      if (this.cyclist) {
        this.applyGravity(this.cyclist, this.ground);

        // Emit the updated position to the server
        this.socket.emit('move', { position: this.cyclist.position });
      }
    },
    updateCyclistPosition() {
      let dx = 0;
      let dz = 0;
      if (this.keys.a.pressed) dx = -0.05;
      else if (this.keys.d.pressed) dx = 0.05;
      if (this.keys.s.pressed) dz = 0.05;
      else if (this.keys.w.pressed) dz = -0.05;

      if (this.ground) {
        this.ground.position.x -= dx;
        this.ground.position.z -= dz;
      }
      for (const id in this.players) {
        if (id !== this.socket.id) {
          this.players[id].cyclist.position.x -= dx;
          this.players[id].cyclist.position.z -= dz;
        }
      }

      if (this.cyclist) {
        this.distanceToFinish -= Math.abs(dz * 100); // Adjust as per scale
        if (this.distanceToFinish <= 0 && !this.finished) {
          this.finished = true;
          console.log("Race finished!");
          // const elapsedTime = (Date.now() - this.startTime) / 1000;
          // document.getElementById('info').innerText = `Finished! Time: ${elapsedTime.toFixed(2)} seconds`;
        }
      }
    },
    updateTimer() {

      if (!this.startTime) this.startTime = Date.now();

      const elapsedTime = (Date.now() - this.startTime) / 1000;

      this.timer = elapsedTime.toFixed(2);

    },
    applyGravity(cyclist, ground) {
      if (!cyclist.velocity) {
        cyclist.velocity = { x: 0, y: -0.01, z: 0 };
      }
      if (!cyclist.gravity) {
        cyclist.gravity = -0.002;
      }

      cyclist.velocity.y += cyclist.gravity;

      if (this.boxCollision(cyclist, ground)) {
        cyclist.velocity.y *= -0.5;
        cyclist.position.y = ground.position.y + 0.5;
      } else {
        cyclist.position.y += cyclist.velocity.y;
      }
    },
    boxCollision(cyclist, ground) {
      const xCollision = cyclist.position.x + 0.5 >= ground.position.x - 5 && cyclist.position.x - 0.5 <= ground.position.x + 5;
      const yCollision = cyclist.position.y - 0.5 + cyclist.velocity.y <= ground.position.y + 0.25 && cyclist.position.y + 0.5 >= ground.position.y - 0.25;
      const zCollision = cyclist.position.z + 0.5 >= ground.position.z - 25 && cyclist.position.z - 0.5 <= ground.position.z + 25;
      return xCollision && yCollision && zCollision;
    },
    addEventListeners() {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
      window.addEventListener('keyup', this.onKeyUp.bind(this));
    },
    onKeyDown(event) {
      switch (event.code) {
        case 'KeyA':
          this.keys.a.pressed = true;
          break;
        case 'KeyD':
          this.keys.d.pressed = true;
          break;
        case 'KeyS':
          this.keys.s.pressed = true;
          break;
        case 'KeyW':
          this.keys.w.pressed = true;
          break;
        case 'Space':
          if (this.cyclist) {
            this.cyclist.velocity.y = 0.08;
          }
          break;
      }
    },
    onKeyUp(event) {
      switch (event.code) {
        case 'KeyA':
          this.keys.a.pressed = false;
          break;
        case 'KeyD':
          this.keys.d.pressed = false;
          break;
        case 'KeyS':
          this.keys.s.pressed = false;
          break;
        case 'KeyW':
          this.keys.w.pressed = false;
          break;
      }
    },
  },
};

</script>


<style >
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
  color: rgb(8, 8, 8);
  font-size: 20px;
  backdrop-filter: blur(10px);
}
</style>
