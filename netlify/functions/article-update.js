// 更新文章 API
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
  if (event.httpMethod !== 'PUT') {
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

    const { id, title, content, summary, category, tags, status } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '文章 ID 不能为空' })
      };
    }

    // 检查文章是否属于当前用户
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingArticle || existingArticle.author_id !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: '无权限修改此文章' })
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

    // 更新文章
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (categoryId !== null) updateData.category_id = categoryId;
    if (status) updateData.status = status;

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 更新标签
    if (tags) {
      // 删除旧标签
      await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', id);

      // 添加新标签
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          article_id: id,
          tag: tag
        }));

        await supabase
          .from('article_tags')
          .insert(tagInserts);
      }
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
          status: article.status,
          updateTime: article.updated_at
        }
      })
    };

  } catch (error) {
    console.error('更新文章错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '更新文章失败' })
    };
  }
};
