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
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .eq('author_id', userId)
      .single();

    if (articleError || !article) {
      console.error('获取文章错误:', articleError);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '文章不存在或无权访问' })
      };
    }

    // 获取分类名称
    let categoryName = '';
    if (article.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', article.category_id)
        .single();
      categoryName = categoryData?.name || '';
    }

    // 获取标签
    const { data: tagsData } = await supabase
      .from('article_tags')
      .select('tag')
      .eq('article_id', articleId);
    const tags = tagsData?.map(t => t.tag) || [];

    // 获取作者信息
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', article.author_id)
      .single();

    // 格式化数据
    const formattedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      category: categoryName,
      tags: tags,
      status: article.status,
      author: userData?.username || '',
      views: article.views || 0,
      likes: article.likes || 0,
      comments: article.comments || 0,
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
