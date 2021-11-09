<template>
  <div id="app">
    <div id="nav">
      000000000000000=={{ microDataStr }}===<button
        @click="handleResultDataChange"
      >
        发送数据给基座
      </button>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>
<script>
import Vue from "vue";

export default {
  name: "Page1",
  data() {
    return {
      version: Vue.version,
      centerDialogVisible: false,
      microDataStr: "",
    };
  },
  created() {
    window.microApp &&
      window.microApp.addDataListener(this.handleDataChange, true);
  },
  beforeDestroy() {
    window.microApp &&
      window.microApp.removeDataListener(this.handleDataChange);
  },

  methods: {
    handleDataChange(data) {
      console.log("vue2 来自基座应用的数据", data);
      this.centerDialogVisible = true;
      this.microDataStr = JSON.stringify(data);
    },
    handleResultDataChange() {
      window.microApp?.dispatch({
        type: "子应用发送的数据" + new Date().getTime(),
      });
    },
  },
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
