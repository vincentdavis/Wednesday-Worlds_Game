<template>
  <div id="app">
    <ThreeScene />
  </div>
</template>

<script>
import ThreeScene from '@/components/ThreeScene.vue';

export default {
  name: 'App',
  components: {
    ThreeScene,
  },
};
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>
