// 用户注册 API
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase 配置（需要在 Netlify 环境变量中设置）
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '方法不允许' })
    };
  }

  try {
    const { username, email, password } = JSON.parse(event.body);

    // 验证输入
    if (!username || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '用户名、邮箱和密码不能为空' })
      };
    }

    if (username.length < 4 || username.length > 16) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '用户名长度必须在4-16个字符之间' })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '密码长度至少6个字符' })
      };
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '用户名已存在' })
      };
    }

    // 检查邮箱是否已存在
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '邮箱已被注册' })
      };
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: passwordHash,
          avatar: ''
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 返回用户信息（不包含密码）
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar,
          createTime: newUser.created_at
        }
      })
    };

  } catch (error) {
    console.error('注册错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '注册失败，请稍后重试' })
    };
  }
};
