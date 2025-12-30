<template>
  <div id="globalHeader">
    <a-row :wrap="false" align="middle">
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="light"
          mode="horizontal"
          :style="{ lineHeight: '64px' }"
          @click="handleMenuClick"
        >
          <a-menu-item key="/">
            <template #icon>
              <HomeOutlined />
            </template>
            首页
          </a-menu-item>
          <a-menu-item key="/article/list">
            <template #icon>
              <FileTextOutlined />
            </template>
            文章管理
          </a-menu-item>
          <a-menu-item key="/article/drafts">
            <template #icon>
              <EditOutlined />
            </template>
            草稿箱
          </a-menu-item>
          <a-menu-item key="/category/manage">
            <template #icon>
              <FolderOutlined />
            </template>
            分类管理
          </a-menu-item>
        </a-menu>
      </a-col>
      <a-col flex="200px">
        <div class="user-info">
          <a-dropdown v-if="isLoggedIn">
            <a class="ant-dropdown-link" @click.prevent>
              <a-space>
                <UserOutlined />
                {{ userInfo.username }}
                <DownOutlined />
              </a-space>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="goToProfile">
                  <UserOutlined />
                  个人信息
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-space v-else>
            <a-button type="link" @click="goToLogin">登录</a-button>
            <a-button type="primary" size="small" @click="goToRegister">
              注册
            </a-button>
          </a-space>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed, ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  HomeOutlined,
  FileTextOutlined,
  EditOutlined,
  FolderOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const selectedKeys = ref(["/"]);

// 用户信息
const userInfo = ref({
  username: "",
  email: "",
});

// 是否已登录
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token');
  return !!token && !!userInfo.value.username;
});

// 菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key);
};

// 跳转到个人信息
const goToProfile = () => {
  router.push("/user/profile");
};

// 跳转到登录
const goToLogin = () => {
  router.push("/user/login");
};

// 跳转到注册
const goToRegister = () => {
  router.push("/user/register");
};

// 退出登录
const handleLogout = () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
  userInfo.value = { username: "", email: "" };
  message.success("退出登录成功");
  router.push("/user/login");
};

// 路由跳转后更新选中的菜单项
router.afterEach((to) => {
  selectedKeys.value = [to.path];
});

// 组件挂载时检查登录状态
onMounted(() => {
  const savedUserInfo = localStorage.getItem("userInfo");
  if (savedUserInfo) {
    try {
      userInfo.value = JSON.parse(savedUserInfo);
    } catch (e) {
      console.error("解析用户信息失败", e);
    }
  }
  selectedKeys.value = [route.path];
});
</script>

<style scoped>
.user-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}

.ant-dropdown-link {
  color: rgba(0, 0, 0, 0.85);
}

.ant-dropdown-link:hover {
  color: #1890ff;
}
</style>
