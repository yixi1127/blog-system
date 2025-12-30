<template>
  <div class="container">
    <a-card title="文章列表" :bordered="false">
      <!-- 搜索和筛选区域 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchTitle"
            placeholder="搜索文章标题"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterCategory"
            placeholder="选择分类"
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option value="">全部分类</a-select-option>
            <a-select-option
              v-for="cat in categories"
              :key="cat.name"
              :value="cat.name"
            >
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterStatus"
            placeholder="选择状态"
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <PlusOutlined />
            </template>
            新建文章
          </a-button>
        </a-col>
      </a-row>

      <!-- 文章列表表格 -->
      <a-table
        :columns="columns"
        :data-source="articleList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a @click="handleView(record)">{{ record.title }}</a>
          </template>
          <template v-else-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag" color="blue">
              {{ tag }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'published' ? 'green' : 'orange'">
              {{ record.status === "published" ? "已发布" : "草稿" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这篇文章吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { getArticleList, deleteArticle } from "../api/article";
import { getCategoryList } from "../api/category";

const router = useRouter();

// 搜索和筛选条件
const searchTitle = ref("");
const filterCategory = ref("");
const filterStatus = ref("");

// 分类列表
const categories = ref<Array<{ name: string }>>([]);

// 表格加载状态
const loading = ref(false);

// 表格列定义
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "分类",
    dataIndex: "category",
    key: "category",
    width: 120,
  },
  {
    title: "标签",
    dataIndex: "tags",
    key: "tags",
    width: 200,
  },
  {
    title: "作者",
    dataIndex: "author",
    key: "author",
    width: 100,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 180,
  },
  {
    title: "操作",
    key: "action",
    width: 200,
  },
];

// 文章列表数据
const articleList = ref([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
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

// 加载文章列表
const loadArticles = async () => {
  loading.value = true;
  try {
    const result = await getArticleList({
      title: searchTitle.value,
      category: filterCategory.value,
      status: filterStatus.value,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    articleList.value = result.list;
    pagination.total = result.total;
  } catch (error: any) {
    message.error(error.message || "加载文章列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  loadArticles();
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadArticles();
};

// 新建文章
const handleCreate = () => {
  router.push("/article/create");
};

// 查看文章
const handleView = (record: any) => {
  router.push(`/article/view/${record.id}`);
};

// 编辑文章
const handleEdit = (record: any) => {
  router.push(`/article/edit/${record.id}`);
};

// 删除文章
const handleDelete = async (record: any) => {
  try {
    await deleteArticle(record.id);
    message.success("删除成功");
    loadArticles();
  } catch (error: any) {
    message.error(error.message || "删除失败");
    console.error(error);
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  await loadCategories();
  loadArticles();
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}
</style>
