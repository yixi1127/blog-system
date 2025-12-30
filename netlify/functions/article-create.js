// 创建文章 API
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
  if (event.httpMethod !== 'POST') {
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

    const { title, content, summary, category, tags, status } = JSON.parse(event.body);

    // 验证必填字段
    if (!title || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '标题和内容不能为空' })
      };
    }

    // 查找分类 ID
    let categoryId = null;
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      categoryId = categoryData?.id;
    }

    // 创建文章
    const { data: article, error } = await supabase
      .from('articles')
      .insert([
        {
          title,
          content,
          summary: summary || '',
          category_id: categoryId,
          author_id: userId,
          status: status || 'draft'
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 添加标签
    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        article_id: article.id,
        tag: tag
      }));

      await supabase
        .from('article_tags')
        .insert(tagInserts);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        article: {
          id: article.id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          category,
          tags: tags || [],
          status: article.status,
          createTime: article.created_at
        }
      })
    };

  } catch (error) {
    console.error('创建文章错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '创建文章失败' })
    };
  }
};
