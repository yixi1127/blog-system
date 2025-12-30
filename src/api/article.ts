// 文章相关 API
import { get, post, put, del } from './request';

export interface Article {
  id?: number;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published';
  views?: number;
  likes?: number;
  comments?: number;
  createTime?: string;
  updateTime?: string;
}

export interface ArticleListParams {
  title?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

// 获取文章列表
export const getArticleList = (params?: ArticleListParams) => {
  return get('/.netlify/functions/article-list', params);
};

// 获取文章详情
export const getArticleDetail = (id: number) => {
  return get('/.netlify/functions/article-detail', { id: id.toString() });
};

// 创建文章
export const createArticle = (data: Article) => {
  return post('/.netlify/functions/article-create', data);
};

// 更新文章
export const updateArticle = (data: Article) => {
  return put('/.netlify/functions/article-update', data);
};

// 删除文章
export const deleteArticle = (id: number) => {
  return del('/.netlify/functions/article-delete', { id: id.toString() });
};
