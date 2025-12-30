<template>
  <div class="container">
    <a-card :title="isEdit ? '编辑文章' : '新建文章'" :bordered="false">
      <a-form
        :model="formState"
        :label-col="{ span: 2 }"
        :wrapper-col="{ span: 20 }"
        @finish="handleSubmit"
      >
        <a-form-item
          label="文章标题"
          name="title"
          :rules="[{ required: true, message: '请输入文章标题' }]"
        >
          <a-input
            v-model:value="formState.title"
            placeholder="请输入文章标题"
            :maxlength="100"
            show-count
          />
        </a-form-item>

        <a-form-item
          label="文章分类"
          name="category"
          :rules="[{ required: true, message: '请选择文章分类' }]"
        >
          <a-select
            v-model:value="formState.category"
            placeholder="请选择文章分类"
          >
            <a-select-option
              v-for="cat in categories"
              :key="cat.name"
              :value="cat.name"
            >
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="文章标签" name="tags">
          <a-select
            v-model:value="formState.tags"
            mode="tags"
            placeholder="请输入标签，按回车添加"
            :max-tag-count="5"
          >
            <a-select-option value="Vue3">Vue3</a-select-option>
            <a-select-option value="TypeScript">TypeScript</a-select-option>
            <a-select-option value="JavaScript">JavaScript</a-select-option>
            <a-select-option value="前端">前端</a-select-option>
            <a-select-option value="学习">学习</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="文章内容"
          name="content"
          :rules="[{ required: true, message: '请输入文章内容' }]"
        >
          <a-textarea
            v-model:value="formState.content"
            placeholder="请输入文章内容（支持Markdown格式）"
            :rows="15"
            show-count
            :maxlength="10000"
          />
        </a-form-item>

        <a-form-item label="文章摘要" name="summary">
          <a-textarea
            v-model:value="formState.summary"
            placeholder="请输入文章摘要（选填）"
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>

        <a-form-item label="发布状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio value="draft">保存为草稿</a-radio>
            <a-radio value="published">立即发布</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 2, span: 20 }">
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              {{ isEdit ? "保存修改" : "发布文章" }}
            </a-button>
            <a-button @click="handlePreview">预览</a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 预览模态框 -->
    <a-modal
      v-model:open="previewVisible"
      title="文章预览"
      width="800px"
      :footer="null"
    >
      <div class="preview-content">
        <h1>{{ formState.title }}</h1>
        <div class="meta-info">
          <a-space>
            <span>分类：{{ formState.category }}</span>
            <span>标签：{{ formState.tags.join(", ") }}</span>
          </a-space>
        </div>
        <a-divider />
        <div class="content">{{ formState.content }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { createArticle, updateArticle, getArticleDetail } from "../api/article";
import { getCategoryList } from "../api/category";

const router = useRouter();
const route = useRoute();

// 是否为编辑模式
const isEdit = ref(false);
const submitting = ref(false);
const previewVisible = ref(false);

// 分类列表
const categories = ref<Array<{ name: string }>>([]);

// 表单数据
const formState = reactive({
  title: "",
  category: "",
  tags: [] as string[],
  content: "",
  summary: "",
  status: "draft" as "draft" | "published",
});

// 加载分类列表
const loadCategories = async () => {
  try {
    const data = await getCategoryList();
    categories.value = data.list || [];
  } catch (error) {
    console.error("加载分类失败", error);
  }
};

// 加载文章数据（编辑模式）
const loadArticle = async (id: string) => {
  try {
    const result = await getArticleDetail(Number(id));
    const article = result.article;
    Object.assign(formState, {
      title: article.title,
      category: article.category,
      tags: article.tags,
      content: article.content,
      summary: article.summary,
      status: article.status,
    });
  } catch (error: any) {
    message.error(error.message || "加载文章失败");
    console.error(error);
  }
};

// 提交表单
const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value) {
      // 更新文章
      const articleId = Number(route.params.id);
      await updateArticle({
        id: articleId,
        ...formState
      });
      message.success("修改成功");
    } else {
      // 创建文章
      await createArticle(formState);
      message.success("发布成功");
    }
    router.push("/article/list");
  } catch (error: any) {
    message.error(error.message || (isEdit.value ? "修改失败" : "发布失败"));
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

// 预览文章
const handlePreview = () => {
  if (!formState.title || !formState.content) {
    message.warning("请先填写标题和内容");
    return;
  }
  previewVisible.value = true;
};

// 取消操作
const handleCancel = () => {
  router.back();
};

// 组件挂载时检查是否为编辑模式
onMounted(async () => {
  await loadCategories();

  const articleId = route.params.id as string;
  if (articleId) {
    isEdit.value = true;
    loadArticle(articleId);
  }
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}

.preview-content {
  padding: 20px;
}

.preview-content h1 {
  font-size: 28px;
  margin-bottom: 16px;
}

.meta-info {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.content {
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
