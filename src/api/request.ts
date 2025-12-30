// API 请求工具函数

// 获取 token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 通用请求函数
export const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 如果有 token，添加到请求头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
};

// GET 请求
export const get = (url: string, params?: Record<string, any>) => {
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url = `${url}?${queryString}`;
  }
  return request(url, { method: 'GET' });
};

// POST 请求
export const post = (url: string, data?: any) => {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT 请求
export const put = (url: string, data?: any) => {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// DELETE 请求
export const del = (url: string, params?: Record<string, any>) => {
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url = `${url}?${queryString}`;
  }
  return request(url, { method: 'DELETE' });
};
