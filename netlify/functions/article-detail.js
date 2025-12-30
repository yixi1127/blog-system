// 获取文章详情 API
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 从 URL 参数获取文章 ID
    const params = event.queryStringParameters || {};
    const articleId = params.id;

    if (!articleId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '文章 ID 不能为空' })
      };
    }

    // 获取文章详情
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name),
        article_tags(tag),
        users(username)
      `)
      .eq('id', articleId)
      .eq('author_id', userId)
      .single();

    if (error || !article) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '文章不存在或无权访问' })
      };
    }

    // 格式化数据
    const formattedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.categories?.name || '',
      tags: article.article_tags?.map(t => t.tag) || [],
      status: article.status,
      author: article.users?.username || '',
      views: article.views,
      likes: article.likes,
      comments: article.comments,
      createTime: article.created_at,
      updateTime: article.updated_at
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        article: formattedArticle
      })
    };

  } catch (error) {
    console.error('获取文章详情错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '获取文章详情失败' })
    };
  }
};
