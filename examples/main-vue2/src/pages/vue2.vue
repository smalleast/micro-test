<template>
  <div class="vue2">
    <button @click="changeData">发送数据</button>
    {{ result }}
    <micro-app
      name="vue2"
      url="http://localhost:4003/micro-app/vue2"
      :data="data"
      @datachange="handleDataChange"
    >
      <!-- destroy inline scopecss  baseRoute='/vue2' -->
    </micro-app>
  </div>
</template>

<script>
export default {
  name: "vue2",
  data() {
    return {
      data: { from: "来自基座的初始化数据" },
      result: "",
    };
  },
  methods: {
    changeData() {
      this.data = { from: "来自基座的数据" + +new Date() };
    },
    handleDataChange(res) {
      this.result = res.detail.data;
      console.log("result:", res);
    },
  },
};
</script>

<style>
</style>
