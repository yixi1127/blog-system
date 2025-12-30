<template>
  <div class="container">
    <a-row :gutter="16">
      <!-- 欢迎卡片 -->
      <a-col :span="24">
        <a-card class="welcome-card" :bordered="false">
          <h1>欢迎来到博客文章管理系统</h1>
          <p>
            基于 Vue3 + TypeScript + Ant Design Vue 开发的现代化博客管理平台
          </p>
        </a-card>
      </a-col>

      <!-- 统计卡片 -->
      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="文章总数"
            :value="statistics.totalArticles"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="已发布"
            :value="statistics.publishedArticles"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card
          :bordered="false"
          class="stat-card"
          style="cursor: pointer"
          @click="goToDrafts"
        >
          <a-statistic
            title="草稿箱"
            :value="statistics.draftArticles"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <EditOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="分类数量"
            :value="statistics.totalCategories"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <FolderOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <!-- 快捷操作 -->
      <a-col :span="24">
        <a-card title="快捷操作" :bordered="false">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12" :md="6">
              <a-button type="primary" size="large" block @click="goToCreate">
                <template #icon>
                  <PlusOutlined />
                </template>
                新建文章
              </a-button>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-button size="large" block @click="goToList">
                <template #icon>
                  <UnorderedListOutlined />
                </template>
                文章列表
              </a-button>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-button size="large" block @click="goToDrafts">
                <template #icon>
                  <EditOutlined />
                </template>
                草稿箱
              </a-button>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-button size="large" block @click="goToCategory">
                <template #icon>
                  <FolderOutlined />
                </template>
                分类管理
              </a-button>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 最近文章 -->
      <a-col :span="24">
        <a-card title="最近文章" :bordered="false">
          <a-list :data-source="recentArticles" :loading="loading">
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a @click="viewArticle(item)">查看</a>
                  <a @click="editArticle(item)">编辑</a>
                </template>
                <a-list-item-meta>
                  <template #title>
                    <a @click="viewArticle(item)">{{ item.title }}</a>
                  </template>
                  <template #description>
                    <a-space>
                      <span>{{ item.category }}</span>
                      <a-divider type="vertical" />
                      <span>{{ item.createTime }}</span>
                      <a-divider type="vertical" />
                      <a-tag
                        :color="
                          item.status === 'published' ? 'green' : 'orange'
                        "
                      >
                        {{ item.status === "published" ? "已发布" : "草稿" }}
                      </a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FolderOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import { articleApi, categoryApi } from "../later/api";

const router = useRouter();
const loading = ref(false);

// 统计数据
const statistics = ref({
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  totalCategories: 0,
});

// 最近文章
const recentArticles = ref<any[]>([]);

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 获取所有文章
    const articlesResult = await articleApi.getList({ pageSize: 9999 });
    const articles = articlesResult.list;

    // 计算统计数据
    statistics.value.totalArticles = articles.length;
    statistics.value.publishedArticles = articles.filter(
      (a) => a.status === "published"
    ).length;
    statistics.value.draftArticles = articles.filter(
      (a) => a.status === "draft"
    ).length;

    // 获取分类数量
    const categories = await categoryApi.getList();
    statistics.value.totalCategories = categories.length;

    // 获取最近3篇文章
    recentArticles.value = articles.slice(0, 3);
  } catch (error) {
    console.error("加载统计数据失败", error);
  }
};

// 快捷操作
const goToCreate = () => router.push("/article/create");
const goToList = () => router.push("/article/list");
const goToDrafts = () => router.push("/article/drafts");
const goToCategory = () => router.push("/category/manage");
const goToProfile = () => router.push("/user/profile");

// 查看文章
const viewArticle = (item: any) => {
  router.push(`/article/view/${item.id}`);
};

// 编辑文章
const editArticle = (item: any) => {
  router.push(`/article/edit/${item.id}`);
};

// 加载数据
onMounted(() => {
  loadStatistics();
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}

.welcome-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 16px;
}

.welcome-card h1 {
  color: white;
  font-size: 32px;
  margin-bottom: 8px;
}

.welcome-card p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-card :deep(.ant-statistic-title) {
  font-size: 14px;
}

.stat-card :deep(.ant-statistic-content) {
  font-size: 24px;
}
</style>
