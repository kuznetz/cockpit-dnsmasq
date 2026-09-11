import "@/styles/index.scss";
import { createApp } from 'vue'
import App from './App.vue'
import CockpitStyle from './ui/CockpitStyle.mjs'

let cockpitStyle = new CockpitStyle()
createApp(App).mount('#cockpit-dnsmasq')