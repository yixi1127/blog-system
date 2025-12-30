<template>
  <div class="container">
    <a-card title="草稿箱" :bordered="false">
      <!-- 搜索区域 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchTitle"
            placeholder="搜索草稿标题"
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
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <PlusOutlined />
            </template>
            新建文章
          </a-button>
        </a-col>
      </a-row>

      <!-- 草稿列表表格 -->
      <a-table
        :columns="columns"
        :data-source="draftList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a @click="handleEdit(record)">{{ record.title }}</a>
          </template>
          <template v-else-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag" color="blue">
              {{ tag }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                继续编辑
              </a-button>
              <a-popconfirm
                title="确定要发布这篇草稿吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handlePublish(record)"
              >
                <a-button type="link" size="small">发布</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要删除这篇草稿吗？"
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
import { articleApi, categoryApi } from "../later/api";

const router = useRouter();

// 搜索和筛选条件
const searchTitle = ref("");
const filterCategory = ref("");

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
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 180,
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    key: "updateTime",
    width: 180,
  },
  {
    title: "操作",
    key: "action",
    width: 220,
  },
];

// 草稿列表数据
const draftList = ref([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条草稿`,
});

// 加载分类列表
const loadCategories = async () => {
  try {
    const data = await categoryApi.getList();
    categories.value = data;
  } catch (error) {
    console.error("加载分类失败", error);
  }
};

// 加载草稿列表
const loadDrafts = async () => {
  loading.value = true;
  try {
    const result = await articleApi.getList({
      title: searchTitle.value,
      category: filterCategory.value,
      status: "draft", // 只获取草稿
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    draftList.value = result.list;
    pagination.total = result.total;
  } catch (error) {
    message.error("加载草稿列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  loadDrafts();
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadDrafts();
};

// 新建文章
const handleCreate = () => {
  router.push("/article/create");
};

// 编辑草稿
const handleEdit = (record: any) => {
  router.push(`/article/edit/${record.id}`);
};

// 发布草稿
const handlePublish = async (record: any) => {
  try {
    await articleApi.update(record.id, { status: "published" });
    message.success("发布成功");
    loadDrafts();
  } catch (error) {
    message.error("发布失败");
    console.error(error);
  }
};

// 删除草稿
const handleDelete = async (record: any) => {
  try {
    await articleApi.delete(record.id);
    message.success("删除成功");
    loadDrafts();
  } catch (error) {
    message.error("删除失败");
    console.error(error);
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  await loadCategories();
  loadDrafts();
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}
</style>
