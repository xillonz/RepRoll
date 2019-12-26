import Vue from 'vue'
import App from './components/App'

Vue.prototype.$sheetKey = "RepRoll-spreadsheetId"

new Vue({
    render: createElement => createElement(App)
}).$mount('#app')