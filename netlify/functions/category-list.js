// 获取分类列表 API
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

    // 获取当前用户的分类，并统计文章数
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        sort,
        created_at,
        articles!inner(count)
      `)
      .eq('articles.author_id', userId)
      .order('sort', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // 格式化数据
    const formattedCategories = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      articleCount: category.articles?.length || 0,
      sort: category.sort,
      createTime: category.created_at
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        list: formattedCategories
      })
    };

  } catch (error) {
    console.error('获取分类列表错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '获取分类列表失败' })
    };
  }
};
