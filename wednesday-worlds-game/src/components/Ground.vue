<template>
    <div></div>
  </template>
  
  <script>
  import * as THREE from 'three';
  
  export default {
    name: 'GroundComponent',
    methods: {
      createMesh() {
        const geometry = new THREE.BoxGeometry(10, 0.5, 200);
        const material = new THREE.MeshStandardMaterial({ color: '#0369a1' });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, -2, 0);
        mesh.receiveShadow = true;
        
        mesh.updateSides = function() {
          this.right = this.position.x + 5;
          this.left = this.position.x - 5;
          this.bottom = this.position.y - 0.25;
          this.top = this.position.y + 0.25;
          this.front = this.position.z + 25;
          this.back = this.position.z - 25;
        };
        
        mesh.updateSides();
        
        return mesh;
      },
    },
  };
  </script>
  