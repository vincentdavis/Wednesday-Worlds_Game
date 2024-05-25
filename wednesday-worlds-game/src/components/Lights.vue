<template>
    <div></div>
  </template>
  
  <script>
  import * as THREE from 'three';
  
  export default {
    name: 'LightsComponent',
    methods: {
      createLights() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 3, 1);
        directionalLight.castShadow = true;
  
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        
        return { directionalLight, ambientLight };
      },
    },
  };
  </script>
  