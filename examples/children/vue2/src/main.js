import "./public-path";
import Vue from "vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
// 引入不同类型iconfont
import App from "./App.vue";

Vue.config.productionTip = false;
Vue.use(ElementUI);

let app = null;

// app = new Vue({
//   router,
//   render: h => h(App),
// }).$mount('#app')

// // 监听卸载
// window.addEventListener('unmount', function () {
//   console.log('微应用vue2卸载了')
//   // 卸载应用
//   app.$destroy()
// })

function mount() {
  app = new Vue({
    router,
    render: (h) => h(App),
  }).$mount("#app");
  console.timeEnd("vue2");
  console.log("微应用vue2渲染了 -- 来自umd-mount");
}

// 卸载应用
function unmount() {
  app.$destroy();
  app.$el.innerHTML = "";
  app = null;
  console.log("微应用vue2卸载了 -- 来自umd-unmount");
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount };
} else {
  // 非微前端环境直接渲染
  mount();
}
