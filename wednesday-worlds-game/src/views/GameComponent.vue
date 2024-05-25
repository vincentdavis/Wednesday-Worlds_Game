<template>
    <div>
      <BoxComponent v-if="username" :username="username" />
      <div v-else>
        {{ $router.push({ name: 'Login' })}}
      </div>
    </div>
  </template>
  
  <script>
  import BoxComponent from '@/components/BoxComponent.vue';
  
  export default {
    name: 'GameComponent',
    components: {
      BoxComponent,
    },
    props: ['username'],
  };
  </script>
  
  <style scoped>
  /* Add any styles you need here */
  </style>
  