// 分类相关 API
import { get } from './request';

export interface Category {
  id: number;
  name: string;
  description: string;
  articleCount: number;
  sort: number;
  createTime: string;
}

// 获取分类列表
export const getCategoryList = () => {
  return get('/.netlify/functions/category-list');
};
