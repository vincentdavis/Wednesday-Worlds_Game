<template>
    <div ref="threeContainer" class="three-container"></div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import Box from './Box.vue';
  import Ground from './Ground.vue';
  import Lights from './Lights.vue';
  
  export default {
    name: 'ThreeScene',
    components: {
    //   Box,
    //   Ground,
    //   Lights,
    },
    setup() {
      const threeContainer = ref(null);
      let scene, camera, renderer, controls;
      let cube, ground;
  
      const keys = {
        a: { pressed: false },
        d: { pressed: false },
        s: { pressed: false },
        w: { pressed: false }
      };
  
      const initScene = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2.74, 8);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.setSize(window.innerWidth, window.innerHeight);
        threeContainer.value.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);
      };
  
      const addObjectsToScene = () => {
        cube = Box.methods.createBox();
        scene.add(cube);
  
        ground = Ground.methods.createMesh();
        scene.add(ground);
  
        const lights = Lights.methods.createLights();
        scene.add(lights.directionalLight);
        scene.add(lights.ambientLight);
      };
  
      const animate = () => {
        requestAnimationFrame(animate);
        cube.update(ground, keys); // Update the cube's movement and physics
        renderer.render(scene, camera);
        controls.update();
      };
  
      onMounted(() => {
        initScene();
        addObjectsToScene();
        animate();
      });
  
      window.addEventListener('keydown', (event) => {
        switch (event.code) {
          case 'KeyA':
            keys.a.pressed = true;
            break;
          case 'KeyD':
            keys.d.pressed = true;
            break;
          case 'KeyS':
            keys.s.pressed = true;
            break;
          case 'KeyW':
            keys.w.pressed = true;
            break;
          case 'Space':
            cube.jump();
            break;
        }
      });
  
      window.addEventListener('keyup', (event) => {
        switch (event.code) {
          case 'KeyA':
            keys.a.pressed = false;
            break;
          case 'KeyD':
            keys.d.pressed = false;
            break;
          case 'KeyS':
            keys.s.pressed = false;
            break;
          case 'KeyW':
            keys.w.pressed = false;
            break;
        }
      });
  
      return { threeContainer };
    },
  };
  </script>
  
  <style scoped>
  .three-container {
    width: 100%;
    height: 100%;
    background-color: #9cbccf;
  }
  </style>
  