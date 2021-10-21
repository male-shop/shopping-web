<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="logo">
      </div>
      <!-- 登录表单区域 -->
      <el-form  label-width="0px"
                class="login_form"
                :model="loginForm"
                :rules="loginFormRules"
                ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user"
                    v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password"
                    prefix-icon="iconfont icon-3702mima"
                    v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" plain @click="login">登录</el-button>
          <el-button type="info" plain @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data () {
      return {
        // 这是登录表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 这是表单的验证规则对象
        loginFormRules: {
          // 验证用户名是否合法
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '用户名长度在3到10位之间', trigger: 'blur' }
          ],
          // 验证密码是否合法
          password: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { min: 6, max: 20, message: '密码必须在6到20位之间', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 点击重置按钮重置登录表单
      resetLoginForm () {
        this.$refs.loginFormRef.resetFields()
      },
      // 登录的预验证
      login () {
        this.$refs.loginFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg || '登录失败')
          }
          this.$message.success('登录成功')
          // 1.将登录成功之后的token，保存到客户端的sessionStorage中
          console.log(res)
          window.sessionStorage.setItem('token', res.data.token)
          window.localStorage.setItem('id', res.data.id)
          window.localStorage.setItem('mobile', res.data.mobile)
          window.localStorage.setItem('email', res.data.email)
          window.localStorage.setItem('rid', res.data.rid)
          window.localStorage.setItem('username', res.data.username)
          // 2.通过编程式导航跳转到后台主页，路由地址是 /home
          await this.$router.push('/home')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
// 登录组件的背景
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}

// 登录框的容器
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius:3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

// 上方logo框的样式
.avatar_box{
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  // 外边框与logo之间的距离
  padding: 10px;
  // 外边框的阴影部分
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: #fff;
  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login_form{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns{
  display: flex;
  justify-content: flex-end;
}

</style>
