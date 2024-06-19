<template>
    <div>
      <GameWorld v-if="username" :username="username" />
      <div v-else>
        {{ $router.push({ name: 'Login' })}}
      </div>
    </div>
  </template>
  
  <script>
  import GameWorld from '@/components/GameWorld.vue';
  
  export default {
    name: 'GameComponent',
    components: {
      GameWorld,
    },
    props: ['username'],
  };
  </script>
  
  <style scoped>
  /* Add any styles you need here */
  </style>
  