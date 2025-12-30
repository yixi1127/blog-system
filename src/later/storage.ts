// 本地存储服务 - 使用 localStorage 实现数据持久化

export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  summary: string;
  status: "draft" | "published";
  author: string;
  createTime: string;
  updateTime: string;
  views: number;
  likes: number;
  comments: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  articleCount: number;
  sort: number;
  createTime: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  createTime: string;
}

class StorageService {
  private readonly ARTICLES_KEY = "blog_articles";
  private readonly CATEGORIES_KEY = "blog_categories";
  private readonly USER_KEY = "blog_user";
  private readonly ARTICLE_ID_KEY = "blog_article_id";
  private readonly CATEGORY_ID_KEY = "blog_category_id";

  // 初始化默认数据
  initDefaultData() {
    if (!this.getArticles().length) {
      const defaultArticles: Article[] = [
        {
          id: 1,
          title: "Vue3组合式API详解",
          content: `Vue 3 引入了组合式 API（Composition API），这是一种全新的逻辑组织和复用方式。

## 为什么需要组合式API？

在 Vue 2 中，我们使用选项式 API（Options API）来组织组件逻辑。随着组件变得复杂，相关的逻辑会分散在不同的选项中（data、methods、computed等），这使得代码难以维护和复用。

## 组合式API的核心概念

### 1. setup函数
setup 是组合式 API 的入口点，在组件创建之前执行。

### 2. 响应式API
- ref：创建响应式引用
- reactive：创建响应式对象
- computed：创建计算属性
- watch：监听响应式数据变化`,
          category: "技术文章",
          tags: ["Vue3", "前端", "JavaScript"],
          summary: "深入探讨Vue3组合式API的设计理念和核心概念",
          status: "published",
          author: "张三",
          createTime: "2025-12-09 10:30:00",
          updateTime: "2025-12-09 10:30:00",
          views: 1234,
          likes: 89,
          comments: 23,
        },
        {
          id: 2,
          title: "TypeScript入门指南",
          content: "TypeScript是JavaScript的超集，提供了静态类型检查等特性...",
          category: "技术文章",
          tags: ["TypeScript", "前端"],
          summary: "TypeScript基础知识和使用指南",
          status: "published",
          author: "张三",
          createTime: "2025-12-08 15:20:00",
          updateTime: "2025-12-08 15:20:00",
          views: 856,
          likes: 45,
          comments: 12,
        },
      ];
      this.saveArticles(defaultArticles);
      localStorage.setItem(this.ARTICLE_ID_KEY, "3");
    }

    if (!this.getCategories().length) {
      const defaultCategories: Category[] = [
        {
          id: 1,
          name: "技术文章",
          description: "技术相关的文章",
          articleCount: 2,
          sort: 1,
          createTime: "2025-12-01 10:00:00",
        },
        {
          id: 2,
          name: "生活随笔",
          description: "记录生活点滴",
          articleCount: 0,
          sort: 2,
          createTime: "2025-12-01 10:05:00",
        },
        {
          id: 3,
          name: "学习笔记",
          description: "学习过程中的笔记",
          articleCount: 0,
          sort: 3,
          createTime: "2025-12-01 10:10:00",
        },
      ];
      this.saveCategories(defaultCategories);
      localStorage.setItem(this.CATEGORY_ID_KEY, "4");
    }

    if (!this.getCurrentUser()) {
      const defaultUser: User = {
        id: 1,
        username: "张三",
        email: "zhangsan@example.com",
        avatar: "",
        createTime: "2025-12-01 09:00:00",
      };
      this.saveCurrentUser(defaultUser);
    }
  }

  // ========== 文章相关 ==========

  getArticles(): Article[] {
    const data = localStorage.getItem(this.ARTICLES_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveArticles(articles: Article[]): void {
    localStorage.setItem(this.ARTICLES_KEY, JSON.stringify(articles));
  }

  getArticleById(id: number): Article | null {
    const articles = this.getArticles();
    return articles.find((a) => a.id === id) || null;
  }

  addArticle(
    article: Omit<
      Article,
      "id" | "createTime" | "updateTime" | "views" | "likes" | "comments"
    >
  ): Article {
    const articles = this.getArticles();
    const currentId = parseInt(
      localStorage.getItem(this.ARTICLE_ID_KEY) || "1"
    );
    const now = this.getCurrentTime();

    const newArticle: Article = {
      ...article,
      id: currentId,
      createTime: now,
      updateTime: now,
      views: 0,
      likes: 0,
      comments: 0,
    };

    articles.push(newArticle);
    this.saveArticles(articles);
    localStorage.setItem(this.ARTICLE_ID_KEY, (currentId + 1).toString());

    // 更新分类文章数
    this.updateCategoryCount(article.category, 1);

    return newArticle;
  }

  updateArticle(id: number, updates: Partial<Article>): boolean {
    const articles = this.getArticles();
    const index = articles.findIndex((a) => a.id === id);

    if (index === -1) return false;

    const oldCategory = articles[index].category;
    const newCategory = updates.category;

    articles[index] = {
      ...articles[index],
      ...updates,
      updateTime: this.getCurrentTime(),
    };

    this.saveArticles(articles);

    // 如果分类改变，更新分类文章数
    if (newCategory && oldCategory !== newCategory) {
      this.updateCategoryCount(oldCategory, -1);
      this.updateCategoryCount(newCategory, 1);
    }

    return true;
  }

  deleteArticle(id: number): boolean {
    const articles = this.getArticles();
    const index = articles.findIndex((a) => a.id === id);

    if (index === -1) return false;

    const category = articles[index].category;
    articles.splice(index, 1);
    this.saveArticles(articles);

    // 更新分类文章数
    this.updateCategoryCount(category, -1);

    return true;
  }

  // ========== 分类相关 ==========

  getCategories(): Category[] {
    const data = localStorage.getItem(this.CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  getCategoryById(id: number): Category | null {
    const categories = this.getCategories();
    return categories.find((c) => c.id === id) || null;
  }

  addCategory(
    category: Omit<Category, "id" | "articleCount" | "createTime">
  ): Category {
    const categories = this.getCategories();
    const currentId = parseInt(
      localStorage.getItem(this.CATEGORY_ID_KEY) || "1"
    );

    const newCategory: Category = {
      ...category,
      id: currentId,
      articleCount: 0,
      createTime: this.getCurrentTime(),
    };

    categories.push(newCategory);
    this.saveCategories(categories);
    localStorage.setItem(this.CATEGORY_ID_KEY, (currentId + 1).toString());

    return newCategory;
  }

  updateCategory(id: number, updates: Partial<Category>): boolean {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) return false;

    categories[index] = {
      ...categories[index],
      ...updates,
    };

    this.saveCategories(categories);
    return true;
  }

  deleteCategory(id: number): boolean {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) return false;

    categories.splice(index, 1);
    this.saveCategories(categories);
    return true;
  }

  updateCategoryCount(categoryName: string, delta: number): void {
    const categories = this.getCategories();
    const category = categories.find((c) => c.name === categoryName);

    if (category) {
      category.articleCount = Math.max(0, category.articleCount + delta);
      this.saveCategories(categories);
    }
  }

  // ========== 用户相关 ==========

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // ========== 工具方法 ==========

  private getCurrentTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 清空所有数据
  clearAll(): void {
    localStorage.removeItem(this.ARTICLES_KEY);
    localStorage.removeItem(this.CATEGORIES_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ARTICLE_ID_KEY);
    localStorage.removeItem(this.CATEGORY_ID_KEY);
  }
}

export const storageService = new StorageService();
