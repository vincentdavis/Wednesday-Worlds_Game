<template>
  <div class="lobby-container">
    <h2>Welcome to the Wednesday World Game</h2>
    <div class="input-container">
      <label for="username">Display Name:</label>
      <input id="username" v-model="username" placeholder="Name" @keyup.enter="joinGame" />
    </div>
    <button @click="joinGame">Join Game</button>
  </div>
</template>

<script>
export default {
  name: 'GameLobbyComponent',
  data() {
    return {
      username: '',
    };
  },
  methods: {
    joinGame() {
      if (this.username.trim()) {
        this.$router.push({ name: 'GameRoom', params: { username: this.username } });
        this.username = ''; // Clear the username field after joining
      } else {
        alert('Please enter a valid username');
      }
    },
  },
};
</script>

<style scoped>
.lobby-container {
  background-image: url('@/assets/game-lobby-bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  animation: fadeIn 2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.input-container {
  background: rgba(255, 255, 255, 0.5);
  padding: 20px;
  padding-left: 9%;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: transform 0.2s ease;
}

.input-container:hover {
  transform: scale(1.05);
}

input {
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  width: 200px;
  border: none;
  border-radius: 5px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}
</style>
