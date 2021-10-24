<template>
  <div class="welcome">
    <h2>Welcome</h2>
    <h3>欢迎登录到电商后台管理系统!</h3>
    <div class="info">
      <ul>
        <li>
          <a href="https://blog.csdn.net/qq_43990778?spm=1011.2124.3001.5343"
              target="_blank">博客</a>
          <span>CSDN博客 在学习时写的一些笔记</span>
        </li>
        <li>
          <a href="https://github.com/miniministrong" target="_blank">Github</a
          ><span>Github 项目文件等存放的地方 -- 国外</span>
        </li>
        <li>
          <a href="https://gitee.com/du-honglei" target="_blank">Gitee</a
          ><span>Gitee 项目文件等存放的地方 -- 国内</span>
        </li>
      </ul>
    </div>
    <address>纯自娱练习用</address>
  </div>
</template>

<script>
  export default {
    name: 'Welcome'
  }
</script>

<style lang="less" scoped>
.welcome {
  font-size: 20px;
  text-align: center;
  color: pink;
  h3 {
    margin: 0 auto 0;
    font-size: 30px;
  }
  .info {
    margin: 5px 0 10px;
    ul {
      margin: 5px 0 0 150px;
      li {
        margin: 5px 0 50px;
        text-align: left;
        margin: 8px;
        color: black;
        a {
          text-align: center;
          display: inline-block;
          padding: 5px;
          font-size: 18px;
          border: 3px solid pink;
        }
        a:hover {
          color: pink;
          background-color: green;
        }
        span {
          width: 100%;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
