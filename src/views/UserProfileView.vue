<template>
  <div class="container">
    <a-row :gutter="16">
      <!-- 个人信息卡片 -->
      <a-col :xs="24" :md="8">
        <a-card title="个人信息" :bordered="false">
          <div class="profile-info">
            <a-avatar :size="100" style="margin-bottom: 16px">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
            <h2>{{ userInfo.username }}</h2>
            <p class="user-email">{{ userInfo.email }}</p>
            <a-divider />
            <div class="info-item">
              <span class="label">注册时间：</span>
              <span>{{ userInfo.registerTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录：</span>
              <span>{{ userInfo.lastLoginTime }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 修改信息表单 -->
      <a-col :xs="24" :md="16">
        <a-card title="修改个人信息" :bordered="false">
          <a-form
            :model="formState"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
            @finish="handleUpdateInfo"
          >
            <a-form-item
              label="用户名"
              name="username"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <a-input
                v-model:value="formState.username"
                placeholder="请输入用户名"
                disabled
              />
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
              />
            </a-form-item>

            <a-form-item label="个人简介" name="bio">
              <a-textarea
                v-model:value="formState.bio"
                placeholder="请输入个人简介"
                :rows="4"
                :maxlength="200"
                show-count
              />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 4, span: 20 }">
              <a-button type="primary" html-type="submit" :loading="updating">
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 修改密码 -->
        <a-card title="修改密码" :bordered="false" style="margin-top: 16px">
          <a-form
            :model="passwordForm"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
            @finish="handleChangePassword"
          >
            <a-form-item
              label="原密码"
              name="oldPassword"
              :rules="[{ required: true, message: '请输入原密码' }]"
            >
              <a-input-password
                v-model:value="passwordForm.oldPassword"
                placeholder="请输入原密码"
              />
            </a-form-item>

            <a-form-item
              label="新密码"
              name="newPassword"
              :rules="[
                { required: true, message: '请输入新密码' },
                { min: 6, max: 20, message: '密码长度为6-20个字符' },
              ]"
            >
              <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码（6-20个字符）"
              />
            </a-form-item>

            <a-form-item
              label="确认密码"
              name="confirmPassword"
              :rules="[
                { required: true, message: '请再次输入新密码' },
                { validator: validatePassword },
              ]"
            >
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
              />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 4, span: 20 }">
              <a-button
                type="primary"
                html-type="submit"
                :loading="changingPassword"
              >
                修改密码
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { UserOutlined } from "@ant-design/icons-vue";

const updating = ref(false);
const changingPassword = ref(false);

// 用户信息
const userInfo = ref({
  username: "admin",
  email: "admin@example.com",
  bio: "这是一段个人简介",
  registerTime: "2025-12-01 10:00:00",
  lastLoginTime: "2025-12-30 09:30:00",
});

// 修改信息表单
const formState = reactive({
  username: "",
  email: "",
  bio: "",
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 验证密码一致性
const validatePassword = async (_rule: any, value: string) => {
  if (value === "") {
    return Promise.reject("请再次输入新密码");
  } else if (value !== passwordForm.newPassword) {
    return Promise.reject("两次输入的密码不一致");
  } else {
    return Promise.resolve();
  }
};

// 更新个人信息
const handleUpdateInfo = async () => {
  updating.value = true;
  try {
    // 模拟API请求
    setTimeout(() => {
      message.success("修改成功");
      userInfo.value.email = formState.email;
      userInfo.value.bio = formState.bio;
      updating.value = false;
    }, 1000);
  } catch (error) {
    message.error("修改失败");
    updating.value = false;
  }
};

// 修改密码
const handleChangePassword = async () => {
  changingPassword.value = true;
  try {
    // 模拟API请求
    setTimeout(() => {
      message.success("密码修改成功，请重新登录");
      // 清空表单
      passwordForm.oldPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
      changingPassword.value = false;
    }, 1000);
  } catch (error) {
    message.error("密码修改失败");
    changingPassword.value = false;
  }
};

// 加载用户信息
onMounted(() => {
  // 从localStorage获取用户信息
  const savedUserInfo = localStorage.getItem("userInfo");
  if (savedUserInfo) {
    try {
      const parsed = JSON.parse(savedUserInfo);
      userInfo.value.username = parsed.username;
    } catch (e) {
      console.error("解析用户信息失败", e);
    }
  }

  // 初始化表单
  formState.username = userInfo.value.username;
  formState.email = userInfo.value.email;
  formState.bio = userInfo.value.bio;
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}

.profile-info {
  text-align: center;
}

.profile-info h2 {
  margin: 8px 0;
  font-size: 24px;
}

.user-email {
  color: #666;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}
</style>
