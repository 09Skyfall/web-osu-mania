import { createApp } from 'vue'
import App from './App.vue'
import resize from './directives/resize'

createApp(App).directive("resize", resize).mount('#app')
