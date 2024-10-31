import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

import resize from "./directives/resize";
import { router } from "./plugins/router";

const pinia = createPinia();
const app = createApp(App);
app.directive("resize", resize);
app.use(pinia);
app.use(router);
app.mount("#app");
