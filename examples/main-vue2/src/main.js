import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import microApp from "@micro-zoe/micro-app";

microApp.start({
  lifeCycles: {
    created() {
      console.log("created 全局监听");
    },
    beforemount() {
      console.log("beforemount 全局监听");
    },
    mounted() {
      console.log("mounted 全局监听");
    },
    unmount() {
      console.log("unmount 全局监听");
    },
    error() {
      console.log("error 全局监听");
    },
  },
  plugins: {
    modules: {
      react16: [
        {
          loader(code, url) {
            if (code.indexOf("sockjs-node") > -1) {
              console.log("react16插件", url);
              code = code.replace("window.location.port", "3001");
            }
            return code;
          },
        },
      ],
      react162: [
        {
          loader(code, url) {
            if (
              process.env.NODE_ENV === "development" &&
              code.indexOf("sockjs-node") > -1
            ) {
              console.log("react16插件", url);
              code = code.replace("window.location.port", "3001");
            }
            return code;
          },
        },
      ],
      react17: [
        {
          loader(code, url) {
            if (
              process.env.NODE_ENV === "development" &&
              code.indexOf("sockjs-node") > -1
            ) {
              console.log("react17插件", url);
              code = code.replace("window.location.port", "3002");
            }
            return code;
          },
        },
      ],
      vite: [
        {
          loader(code) {
            if (process.env.NODE_ENV === "development") {
              code = code.replace(
                /(from|import)(\s*['"])(\/micro-app\/vite\/)/g,
                (all) => {
                  return all.replace(
                    "/micro-app/vite/",
                    "http://localhost:7001/micro-app/vite/"
                  );
                }
              );
            }
            return code;
          },
        },
      ],
    },
  },
  /**
   * 自定义fetch
   * @param url 静态资源地址
   * @param options fetch请求配置项
   * @returns Promise<string>
   */
  // eslint-disable-next-line no-unused-vars
  async fetch(url, options, appName) {
    if (url === "http://localhost:3001/error.js") {
      return Promise.resolve("");
    }

    let config = null;
    if (url === "http://localhost:3001/micro-app/react16/") {
      config = {
        headers: {
          "custom-head": "custom-head",
        },
      };
    }

    const res = await fetch(url, Object.assign(options, config));
    return await res.text();
  },
});
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
