<template>
  <div class="container">
    <a-card title="分类管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <template #icon>
            <PlusOutlined />
          </template>
          新建分类
        </a-button>
      </template>

      <!-- 分类列表 -->
      <a-table
        :columns="columns"
        :data-source="categoryList"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个分类吗？删除后该分类下的文章将变为未分类。"
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

    <!-- 新建/编辑分类模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑分类' : '新建分类'"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item
          label="分类名称"
          name="name"
          :rules="[{ required: true, message: '请输入分类名称' }]"
        >
          <a-input
            v-model:value="formState.name"
            placeholder="请输入分类名称"
            :maxlength="20"
          />
        </a-form-item>

        <a-form-item label="分类描述" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="请输入分类描述（选填）"
            :rows="3"
            :maxlength="100"
          />
        </a-form-item>

        <a-form-item label="排序" name="sort">
          <a-input-number
            v-model:value="formState.sort"
            :min="0"
            :max="999"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { categoryApi } from "../later/api";

const loading = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);

// 表格列定义
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: "分类名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "分类描述",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "文章数量",
    dataIndex: "articleCount",
    key: "articleCount",
    width: 120,
  },
  {
    title: "排序",
    dataIndex: "sort",
    key: "sort",
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
    width: 150,
  },
];

// 分类列表数据
const categoryList = ref([]);

// 表单数据
const formState = reactive({
  id: 0,
  name: "",
  description: "",
  sort: 0,
});

// 加载分类列表
const loadCategories = async () => {
  loading.value = true;
  try {
    const data = await categoryApi.getList();
    categoryList.value = data;
  } catch (error) {
    message.error("加载分类列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 显示新建模态框
const showAddModal = () => {
  isEdit.value = false;
  formState.id = 0;
  formState.name = "";
  formState.description = "";
  formState.sort = 0;
  modalVisible.value = true;
};

// 编辑分类
const handleEdit = (record: any) => {
  isEdit.value = true;
  formState.id = record.id;
  formState.name = record.name;
  formState.description = record.description;
  formState.sort = record.sort;
  modalVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formState.name) {
    message.warning("请输入分类名称");
    return;
  }

  try {
    if (isEdit.value) {
      await categoryApi.update(formState.id, {
        name: formState.name,
        description: formState.description,
        sort: formState.sort,
      });
      message.success("修改成功");
    } else {
      await categoryApi.create({
        name: formState.name,
        description: formState.description,
        sort: formState.sort,
      });
      message.success("创建成功");
    }
    modalVisible.value = false;
    loadCategories();
  } catch (error) {
    message.error(isEdit.value ? "修改失败" : "创建失败");
    console.error(error);
  }
};

// 取消操作
const handleCancel = () => {
  modalVisible.value = false;
};

// 删除分类
const handleDelete = async (record: any) => {
  try {
    await categoryApi.delete(record.id);
    message.success("删除成功");
    loadCategories();
  } catch (error) {
    message.error("删除失败");
    console.error(error);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.container {
  padding: 20px;
  margin-bottom: 80px;
}
</style>
