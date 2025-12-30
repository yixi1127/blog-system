<template>
  <div class="login-container">
    <a-card class="login-card" title="用户登录" :bordered="false">
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        @finish="handleLogin"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
          <a-checkbox v-model:checked="formState.remember"> 记住我 </a-checkbox>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
          <a-space>
            <span>还没有账号？</span>
            <a @click="goToRegister">立即注册</a>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const loading = ref(false);

// 表单数据
const formState = reactive({
  username: "",
  password: "",
  remember: true,
});

// 登录处理
const handleLogin = async () => {
  loading.value = true;
  try {
    // 模拟登录API
    setTimeout(() => {
      // 简单验证
      if (formState.username === "admin" && formState.password === "123456") {
        message.success("登录成功");
        // 保存登录状态到localStorage
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            username: formState.username,
            token: "mock-token-" + Date.now(),
          })
        );
        // 跳转到首页
        router.push("/");
      } else {
        message.error("用户名或密码错误");
      }
      loading.value = false;
    }, 1000);
  } catch (error) {
    message.error("登录失败，请稍后重试");
    loading.value = false;
  }
};

// 跳转到注册页
const goToRegister = () => {
  router.push("/user/register");
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-card :deep(.ant-card-head) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}
</style>
