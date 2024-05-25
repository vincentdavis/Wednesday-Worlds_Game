<template>
    <div></div>
  </template>
  
  <script>
  import * as THREE from 'three';
  import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
  import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
  
  export default {
    name: 'BoxComponent',
    methods: {
      createBox() {
        // Box geometry and material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: '#00ff00' });
        const boxMesh = new THREE.Mesh(geometry, material);
        boxMesh.castShadow = true;
        
        // Box physics properties
        boxMesh.velocity = { x: 0, y: -0.01, z: 0 };
        boxMesh.gravity = -0.002;
  
        boxMesh.updateSides = function() {
          this.right = this.position.x + 0.5;
          this.left = this.position.x - 0.5;
          this.bottom = this.position.y - 0.5;
          this.top = this.position.y + 0.5;
          this.front = this.position.z + 0.5;
          this.back = this.position.z - 0.5;
        };
  
        boxMesh.update = function(ground, keys) {
          this.updateSides();
  
          this.velocity.x = 0;
          this.velocity.z = 0;
          
          if (keys.a.pressed) this.velocity.x = -0.05;
          else if (keys.d.pressed) this.velocity.x = 0.05;
          
          if (keys.s.pressed) this.velocity.z = 0.05;
          else if (keys.w.pressed) this.velocity.z = -0.05;
  
          this.position.x += this.velocity.x;
          this.position.z += this.velocity.z;
          
          this.applyGravity(ground);
        };
  
        boxMesh.applyGravity = function(ground) {
          this.velocity.y += this.gravity;
          
          if (boxCollision(this, ground)) {
            this.velocity.y *= -0.5;
            this.position.y = ground.top + 0.5;
          } else {
            this.position.y += this.velocity.y;
          }
        };
  
        boxMesh.jump = function() {
          this.velocity.y = 0.08;
        };
  
        // Load font and create text
        const loader = new FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
          const textGeometry = new TextGeometry('Box 1', {
            font: font,
            size: 0.2,
            height: 0.02,
          });
          const textMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  
          textMesh.position.set(-0.5, 0.5, 0.5); // Adjust text position relative to the box
          boxMesh.add(textMesh); // Attach text to the box
        });
  
        return boxMesh;
      },
    },
  };
  
  function boxCollision(box1, box2) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right;
    const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
    const zCollision = box1.front >= box2.back && box1.back <= box2.front;
  
    return xCollision && yCollision && zCollision;
  }
  </script>
  
  <style scoped>
  </style>
  