// 删除文章 API
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
  if (event.httpMethod !== 'DELETE') {
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

    // 检查文章是否属于当前用户
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!existingArticle) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '文章不存在' })
      };
    }

    if (existingArticle.author_id !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: '无权限删除此文章' })
      };
    }

    // 删除文章（标签会自动级联删除）
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: '文章删除成功'
      })
    };

  } catch (error) {
    console.error('删除文章错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '删除文章失败' })
    };
  }
};
