// 获取文章列表 API
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
const supabase = createClient(supabaseUrl, supabaseKey);

// 验证 token 并获取用户 ID
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '方法不允许' })
    };
  }

  try {
    // 从请求头获取 token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '未授权' })
      };
    }

    const token = authHeader.substring(7);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token 无效' })
      };
    }

    // 获取查询参数
    const params = event.queryStringParameters || {};
    const { title, category, status, page = 1, pageSize = 10 } = params;

    // 构建查询
    let query = supabase
      .from('articles')
      .select(`
        *,
        categories(name),
        article_tags(tag)
      `, { count: 'exact' })
      .eq('author_id', userId);

    // 筛选条件
    if (title) {
      query = query.ilike('title', `%${title}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('categories.name', category);
    }

    // 排序和分页
    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize) - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(start, end);

    const { data: articles, error, count } = await query;

    if (error) {
      throw error;
    }

    // 格式化数据
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.categories?.name || '',
      tags: article.article_tags?.map(t => t.tag) || [],
      status: article.status,
      views: article.views,
      likes: article.likes,
      comments: article.comments,
      createTime: article.created_at,
      updateTime: article.updated_at
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        list: formattedArticles,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      })
    };

  } catch (error) {
    console.error('获取文章列表错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '获取文章列表失败' })
    };
  }
};
