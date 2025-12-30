// API服务层 - 模拟后端API调用
import { storageService, Article, Category, User } from "./storage";

// 模拟网络延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// 文章API
export const articleApi = {
  // 获取文章列表
  async getList(params?: {
    title?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    await delay();

    let articles = storageService.getArticles();

    // 筛选
    if (params?.title) {
      articles = articles.filter((a) => a.title.includes(params.title!));
    }
    if (params?.category) {
      articles = articles.filter((a) => a.category === params.category);
    }
    if (params?.status) {
      articles = articles.filter((a) => a.status === params.status);
    }

    // 排序（按创建时间倒序）
    articles.sort((a, b) => {
      return (
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      );
    });

    // 分页
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = articles.slice(start, end);

    return {
      list,
      total: articles.length,
      page,
      pageSize,
    };
  },

  // 获取文章详情
  async getDetail(id: number) {
    await delay();

    const article = storageService.getArticleById(id);
    if (!article) {
      throw new Error("文章不存在");
    }

    return article;
  },

  // 创建文章
  async create(data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    summary: string;
    status: "draft" | "published";
  }) {
    await delay();

    const user = storageService.getCurrentUser();
    const article = storageService.addArticle({
      ...data,
      author: user?.username || "匿名",
    });

    return article;
  },

  // 更新文章
  async update(id: number, data: Partial<Article>) {
    await delay();

    const success = storageService.updateArticle(id, data);
    if (!success) {
      throw new Error("文章不存在");
    }

    return storageService.getArticleById(id);
  },

  // 删除文章
  async delete(id: number) {
    await delay();

    const success = storageService.deleteArticle(id);
    if (!success) {
      throw new Error("文章不存在");
    }

    return { success: true };
  },
};

// 分类API
export const categoryApi = {
  // 获取分类列表
  async getList() {
    await delay();

    const categories = storageService.getCategories();

    // 按排序字段排序
    categories.sort((a, b) => a.sort - b.sort);

    return categories;
  },

  // 获取分类详情
  async getDetail(id: number) {
    await delay();

    const category = storageService.getCategoryById(id);
    if (!category) {
      throw new Error("分类不存在");
    }

    return category;
  },

  // 创建分类
  async create(data: { name: string; description: string; sort: number }) {
    await delay();

    const category = storageService.addCategory(data);
    return category;
  },

  // 更新分类
  async update(id: number, data: Partial<Category>) {
    await delay();

    const success = storageService.updateCategory(id, data);
    if (!success) {
      throw new Error("分类不存在");
    }

    return storageService.getCategoryById(id);
  },

  // 删除分类
  async delete(id: number) {
    await delay();

    const success = storageService.deleteCategory(id);
    if (!success) {
      throw new Error("分类不存在");
    }

    return { success: true };
  },
};

// 用户API
export const userApi = {
  // 获取当前用户信息
  async getCurrentUser() {
    await delay();

    const user = storageService.getCurrentUser();
    if (!user) {
      throw new Error("用户未登录");
    }

    return user;
  },

  // 更新用户信息
  async updateProfile(data: Partial<User>) {
    await delay();

    const user = storageService.getCurrentUser();
    if (!user) {
      throw new Error("用户未登录");
    }

    const updatedUser = { ...user, ...data };
    storageService.saveCurrentUser(updatedUser);

    return updatedUser;
  },

  // 登录
  async login(username: string, password: string) {
    await delay();

    // 简单的登录逻辑（实际应该验证密码）
    const user: User = {
      id: 1,
      username,
      email: `${username}@example.com`,
      avatar: "",
      createTime: new Date().toISOString(),
    };

    storageService.saveCurrentUser(user);
    return user;
  },

  // 注册
  async register(username: string, email: string, password: string) {
    await delay();

    const user: User = {
      id: 1,
      username,
      email,
      avatar: "",
      createTime: new Date().toISOString(),
    };

    storageService.saveCurrentUser(user);
    return user;
  },

  // 登出
  async logout() {
    await delay();

    localStorage.removeItem("blog_user");
    return { success: true };
  },
};

// 初始化数据
export const initData = () => {
  storageService.initDefaultData();
};
