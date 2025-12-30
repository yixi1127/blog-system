<template>
  <div class="container">
    <a-card :loading="loading" :bordered="false">
      <template #title>
        <a-space direction="vertical" style="width: 100%">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <a-space>
              <span>作者：{{ article.author }}</span>
              <a-divider type="vertical" />
              <span>分类：{{ article.category }}</span>
              <a-divider type="vertical" />
              <span>发布时间：{{ article.createTime }}</span>
              <a-divider type="vertical" />
              <span>更新时间：{{ article.updateTime }}</span>
            </a-space>
          </div>
          <div class="article-tags">
            <a-tag v-for="tag in article.tags" :key="tag" color="blue">
              {{ tag }}
            </a-tag>
          </div>
        </a-space>
      </template>

      <template #extra>
        <a-space>
          <a-button @click="handleBack">返回</a-button>
          <a-button type="primary" @click="handleEdit">编辑</a-button>
        </a-space>
      </template>

      <a-divider />

      <!-- 文章摘要 -->
      <div v-if="article.summary" class="article-summary">
        <h3>摘要</h3>
        <p>{{ article.summary }}</p>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <pre>{{ article.content }}</pre>
      </div>

      <a-divider />

      <!-- 文章统计信息 -->
      <div class="article-stats">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic title="阅读量" :value="article.views || 0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="点赞数" :value="article.likes || 0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="评论数" :value="article.comments || 0" />
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { getArticleDetail } from "../api/article";

const router = useRouter();
const route = useRoute();

const loading = ref(false);

// 文章数据
const article = ref({
  id: 0,
  title: "",
  content: "",
  category: "",
  tags: [] as string[],
  summary: "",
  author: "",
  createTime: "",
  updateTime: "",
  status: "draft" as "draft" | "published",
  views: 0,
  likes: 0,
  comments: 0,
});

// 加载文章详情
const loadArticle = async () => {
  loading.value = true;
  try {
    const articleId = Number(route.params.id);
    const result = await getArticleDetail(articleId);
    article.value = result.article;
  } catch (error: any) {
    message.error(error.message || "加载文章失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 返回列表
const handleBack = () => {
  router.back();
};

// 编辑文章
const handleEdit = () => {
  router.push(`/article/edit/${article.value.id}`);
};

// 组件挂载时加载数据
onMounted(() => {
  loadArticle();
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}

.article-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  line-height: 1.4;
}

.article-meta {
  color: #666;
  font-size: 14px;
  margin-top: 12px;
}

.article-tags {
  margin-top: 12px;
}

.article-summary {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.article-summary h3 {
  margin-top: 0;
  font-size: 16px;
  font-weight: bold;
}

.article-summary p {
  margin: 0;
  line-height: 1.8;
  color: #666;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin: 24px 0;
}

.article-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
}

.article-stats {
  margin-top: 24px;
  padding: 24px;
  background: #fafafa;
  border-radius: 4px;
}
</style>
