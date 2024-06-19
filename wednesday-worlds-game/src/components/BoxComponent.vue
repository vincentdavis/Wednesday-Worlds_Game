
<template>
  <div>
    <div class="controls" style="position: absolute; bottom: 10px;">
      <button @touchstart="onButtonDown('w')" @touchend="onButtonUp('w')">W</button>
      <button @touchstart="onButtonDown('a')" @touchend="onButtonUp('a')">A</button>
      <button @touchstart="onButtonDown('s')" @touchend="onButtonUp('s')">S</button>
      <button @touchstart="onButtonDown('d')" @touchend="onButtonUp('d')">D</button>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { io } from 'socket.io-client';

export default {
  name: 'BoxComponent',
  props: ['username'],
  data() {
    return {
      socket: null,
      scene: null,
      camera: null,
      renderer: null,
      box: null,
      ground: null,
      keys: {
        a: { pressed: false },
        d: { pressed: false },
        s: { pressed: false },
        w: { pressed: false },
      },
      players: {}, // To keep track of other players
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
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 2.74, 8);

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.shadowMap.enabled = true;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: '#00ff00' });
      this.box = new THREE.Mesh(geometry, material);
      this.box.castShadow = true;
      this.box.velocity = { x: 0, y: -0.01, z: 0 };
      this.box.gravity = -0.002;

      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(this.username, {
          font: font,
          size: 0.2,
          height: 0.02,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-0.5, 0.5, 0.5);
        this.box.add(textMesh);
      });

      this.scene.add(this.box);

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
      // Remove boxes for players who have disconnected
      for (const id in this.players) {
        if (!players[id]) {
          this.scene.remove(this.players[id].box);
          delete this.players[id];
        }
      }

      // Add or update boxes for current players
      for (const id in players) {
        if (id !== this.socket.id) {
          if (!this.players[id]) {
            // Add new player box
            const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
            const playerMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000' });
            const playerBox = new THREE.Mesh(playerGeometry, playerMaterial);
            playerBox.position.set(players[id].position.x, players[id].position.y, players[id].position.z);

            const loader = new FontLoader();
            loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
              const textGeometry = new TextGeometry(players[id].username, {
                font: font,
                size: 0.2,
                height: 0.02,
              });
              const textMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
              textMesh.position.set(-0.5, 0.5, 0.5);
              playerBox.add(textMesh);
            });

            this.scene.add(playerBox);
            this.players[id] = { box: playerBox };
          } else {
            // Update existing player box position
            this.players[id].box.position.set(players[id].position.x, players[id].position.y, players[id].position.z);
          }
        }
      }
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);

      let dx = 0;
      let dz = 0;

      if (this.keys.a.pressed) dx = -0.05;
      else if (this.keys.d.pressed) dx = 0.05;

      if (this.keys.s.pressed) dz = 0.05;
      else if (this.keys.w.pressed) dz = -0.05;

      // Move the ground and all other objects except the main box
      this.ground.position.x -= dx;
      this.ground.position.z -= dz;

      for (const id in this.players) {
        if (id !== this.socket.id) {
          this.players[id].box.position.x -= dx;
          this.players[id].box.position.z -= dz;
        }
      }

      this.applyGravity(this.box, this.ground);

      // Emit the updated position to the server
      this.socket.emit('move', { position: this.box.position });
    },
    applyGravity(box, ground) {
      box.velocity.y += box.gravity;

      if (this.boxCollision(box, ground)) {
        box.velocity.y *= -0.5;
        box.position.y = ground.position.y + 0.5;
      } else {
        box.position.y += box.velocity.y;
      }
    },
    boxCollision(box1, box2) {
      const xCollision = box1.position.x + 0.5 >= box2.position.x - 5 && box1.position.x - 0.5 <= box2.position.x + 5;
      const yCollision = box1.position.y - 0.5 + box1.velocity.y <= box2.position.y + 0.25 && box1.position.y + 0.5 >= box2.position.y - 0.25;
      const zCollision = box1.position.z + 0.5 >= box2.position.z - 25 && box1.position.z - 0.5 <= box2.position.z + 25;
      return xCollision && yCollision && zCollision;
    },
    addEventListeners() {
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
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
          this.box.velocity.y = 0.08;
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
