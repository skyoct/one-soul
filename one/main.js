import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

Vue.prototype.server = "https://one.undefinition.cn";

const app = new Vue({
    ...App
})
app.$mount()
