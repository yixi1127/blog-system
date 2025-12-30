# 博客系统数据存储模块

## 概述

本模块实现了博客文章管理系统的真实数据存储功能，使用浏览器的 localStorage 作为持久化存储方案。

## 文件说明

### storage.ts
数据存储服务层，负责与 localStorage 交互：
- **Article 接口**：文章数据模型
- **Category 接口**：分类数据模型
- **User 接口**：用户数据模型
- **StorageService 类**：提供数据的增删改查操作

主要功能：
- 文章管理：增加、删除、更新、查询文章
- 分类管理：增加、删除、更新、查询分类
- 用户管理：保存和获取当前用户信息
- 自动维护分类文章数量统计
- 初始化默认数据

### api.ts
API 服务层，模拟后端 API 调用：
- **articleApi**：文章相关 API
  - getList：获取文章列表（支持筛选、分页）
  - getDetail：获取文章详情
  - create：创建文章
  - update：更新文章
  - delete：删除文章

- **categoryApi**：分类相关 API
  - getList：获取分类列表
  - getDetail：获取分类详情
  - create：创建分类
  - update：更新分类
  - delete：删除分类

- **userApi**：用户相关 API
  - getCurrentUser：获取当前用户
  - updateProfile：更新用户信息
  - login：用户登录
  - register：用户注册
  - logout：用户登出

## 数据存储方案

### localStorage 键名
- `blog_articles`：存储所有文章数据
- `blog_categories`：存储所有分类数据
- `blog_user`：存储当前用户信息
- `blog_article_id`：文章 ID 计数器
- `blog_category_id`：分类 ID 计数器

### 数据持久化
所有数据保存在浏览器的 localStorage 中，具有以下特点：
- ✅ 数据持久化，刷新页面不丢失
- ✅ 真实的增删改查操作
- ✅ 支持复杂的筛选和分页
- ✅ 自动维护数据关联（如分类文章数）
- ⚠️ 数据仅存储在本地浏览器
- ⚠️ 清除浏览器缓存会丢失数据

## 使用方法

### 1. 初始化数据
在 `main.ts` 中已自动调用初始化：
```typescript
import { initData } from './later/api';
initData();
```

### 2. 在组件中使用
```typescript
import { articleApi, categoryApi } from '../later/api';

// 获取文章列表
const articles = await articleApi.getList({
  title: '搜索关键词',
  category: '技术文章',
  status: 'published',
  page: 1,
  pageSize: 10,
});

// 创建文章
const newArticle = await articleApi.create({
  title: '文章标题',
  content: '文章内容',
  category: '技术文章',
  tags: ['Vue3', '前端'],
  summary: '文章摘要',
  status: 'published',
});

// 更新文章
await articleApi.update(articleId, {
  title: '新标题',
  content: '新内容',
});

// 删除文章
await articleApi.delete(articleId);
```

## 数据流程

```
用户操作 → Vue组件 → API层(api.ts) → 存储层(storage.ts) → localStorage
                                                              ↓
                                                          持久化存储
```

## 特性

1. **真实数据存储**：所有操作都会真实保存到 localStorage
2. **模拟网络延迟**：API 调用有 300ms 延迟，模拟真实网络请求
3. **数据验证**：创建和更新时会验证数据完整性
4. **自动时间戳**：自动记录创建和更新时间
5. **关联维护**：自动维护分类与文章的关联关系

## 后续扩展

如需对接真实后端 API，只需修改 `api.ts` 文件：
1. 将模拟的 API 调用替换为真实的 HTTP 请求（使用 axios）
2. 保持接口签名不变
3. 组件代码无需修改

示例：
```typescript
// 替换前（模拟）
async getList() {
  await delay();
  return storageService.getArticles();
}

// 替换后（真实API）
async getList() {
  const response = await axios.get('/api/articles');
  return response.data;
}
```

## 注意事项

1. localStorage 有存储大小限制（通常 5-10MB）
2. 数据仅存储在当前浏览器，不同浏览器/设备无法共享
3. 用户清除浏览器数据会导致所有内容丢失
4. 生产环境建议使用真实后端 API + 数据库
