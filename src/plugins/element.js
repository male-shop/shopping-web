import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, Notification } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
Vue.prototype.$notify = Notification
