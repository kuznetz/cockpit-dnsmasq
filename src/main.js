import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import "@/styles/index.scss";

import { createApp } from 'vue'
import App from './App.vue'
import VuePatternFly from '@vue-patternfly/core';

import CockpitStyle from './ui/CockpitStyle.mjs'

let cockpitStyle = new CockpitStyle();
let app = createApp(App)
app.use(VuePatternFly);
app.mount('#cockpit-dnsmasq');