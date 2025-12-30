# 后端 API 使用说明

## 🔐 认证方式

所有需要登录的 API 都需要在请求头中携带 token：

```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

---

## 👤 用户相关 API

### 1. 用户注册
- **URL**: `/.netlify/functions/auth-register`
- **方法**: POST
- **参数**:
```json
{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

### 2. 用户登录
- **URL**: `/.netlify/functions/auth-login`
- **方法**: POST
- **参数**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```
- **返回**: 包含 token 和用户信息

---

## 📝 文章相关 API

### 1. 获取文章列表
- **URL**: `/.netlify/functions/article-list`
- **方法**: GET
- **需要认证**: 是
- **查询参数**:
  - `title`: 标题关键词（可选）
  - `category`: 分类名称（可选）
  - `status`: 状态 draft/published（可选）
  - `page`: 页码（默认 1）
  - `pageSize`: 每页数量（默认 10）

### 2. 创建文章
- **URL**: `/.netlify/functions/article-create`
- **方法**: POST
- **需要认证**: 是
- **参数**:
```json
{
  "title": "文章标题",
  "content": "文章内容",
  "summary": "文章摘要",
  "category": "分类名称",
  "tags": ["标签1", "标签2"],
  "status": "draft" // 或 "published"
}
```

### 3. 更新文章
- **URL**: `/.netlify/functions/article-update`
- **方法**: PUT
- **需要认证**: 是
- **参数**:
```json
{
  "id": 文章ID,
  "title": "新标题",
  "content": "新内容",
  "summary": "新摘要",
  "category": "新分类",
  "tags": ["新标签"],
  "status": "published"
}
```

### 4. 删除文章
- **URL**: `/.netlify/functions/article-delete?id=文章ID`
- **方法**: DELETE
- **需要认证**: 是

---

## 📁 分类相关 API

### 1. 获取分类列表
- **URL**: `/.netlify/functions/category-list`
- **方法**: GET
- **需要认证**: 是

---

## 🔧 前端调用示例

```javascript
// 获取 token
const token = localStorage.getItem('token');

// 获取文章列表
const response = await fetch('/.netlify/functions/article-list?page=1&pageSize=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.list); // 文章列表
```

---

## ⚠️ 注意事项

1. 所有文章和分类都与用户关联，每个用户只能看到和操作自己的数据
2. Token 有效期为 7 天
3. 删除文章会自动删除关联的标签
4. 分类需要先在数据库中创建（使用默认的 3 个分类）
