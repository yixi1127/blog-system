<template>
  <div class="register-container">
    <a-card class="register-card" title="用户注册" :bordered="false">
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        @finish="handleRegister"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[
            { required: true, message: '请输入用户名' },
            { min: 4, max: 16, message: '用户名长度为4-16个字符' },
          ]"
        >
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名（4-16个字符）"
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
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, max: 20, message: '密码长度为6-20个字符' },
          ]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码（6-20个字符）"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="确认密码"
          name="confirmPassword"
          :rules="[
            { required: true, message: '请再次输入密码' },
            { validator: validatePassword },
          ]"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="邮箱"
          name="email"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' },
          ]"
        >
          <a-input
            v-model:value="formState.email"
            placeholder="请输入邮箱"
            size="large"
          >
            <template #prefix>
              <MailOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            注册
          </a-button>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
          <a-space>
            <span>已有账号？</span>
            <a @click="goToLogin">立即登录</a>
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
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const loading = ref(false);

// 表单数据
const formState = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
});

// 验证密码一致性
const validatePassword = async (_rule: any, value: string) => {
  if (value === "") {
    return Promise.reject("请再次输入密码");
  } else if (value !== formState.password) {
    return Promise.reject("两次输入的密码不一致");
  } else {
    return Promise.resolve();
  }
};

// 注册处理
const handleRegister = async () => {
  loading.value = true;
  try {
    const response = await fetch('/.netlify/functions/auth-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formState.username,
        email: formState.email,
        password: formState.password
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      message.success('注册成功，请登录');
      router.push('/user/login');
    } else {
      message.error(data.error || '注册失败');
    }
  } catch (error) {
    message.error('注册失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页
const goToLogin = () => {
  router.push("/user/login");
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.register-card :deep(.ant-card-head) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}
</style>
