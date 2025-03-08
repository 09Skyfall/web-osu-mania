import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

import resize from "./directives/resize";
import { router } from "./plugins/router";

import "vue3-toastify/dist/index.css";
import "../assets/defaults.css";

import Vue3Toastify, { ToastContainerOptions } from "vue3-toastify";

const pinia = createPinia();
const app = createApp(App);
app.directive("resize", resize);
app.use(pinia);
app.use(router);

const toastContainerOptions: ToastContainerOptions = {
  position: "bottom-right",
  style: { right: "125px" },
  theme: "colored",
};

app.use(Vue3Toastify, toastContainerOptions);

app.mount("#app");
