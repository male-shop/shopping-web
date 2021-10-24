import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import TreeTables from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入nprogress包对应的js和css
// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

import '@/common/webClick'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后，必须return config
  return config
})
// 在response拦截器中隐藏进度条 NProgress.done()
axios.interceptors.request.use(config => {
  // NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTables)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originValue) {
  const date = new Date(originValue)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDate() + '').padStart(2, '0')
  const hour = (date.getHours() + '').padStart(2, '0')
  const minute = (date.getMinutes() + '').padStart(2, '0')
  const second = (date.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
