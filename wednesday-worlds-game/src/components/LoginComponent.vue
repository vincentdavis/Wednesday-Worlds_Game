<template>
    <div class="login-container">
      <h2>Enter your username</h2>
      <input v-model="username" placeholder="Username" />
      <button @click="login">Login</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginComponent',
    data() {
      return {
        username: '',
      };
    },
    methods: {
      login() {
        if (this.username.trim()) {
          this.$router.push({ name: 'Game', params: { username: this.username } });
        } else {
          alert('Please enter a valid username');
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  
  input {
    margin: 10px 0;
    padding: 8px;
    font-size: 16px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  