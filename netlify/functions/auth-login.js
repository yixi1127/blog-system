// 用户登录 API
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '方法不允许' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // 验证输入
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '用户名和密码不能为空' })
      };
    }

    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '用户名或密码错误' })
      };
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '用户名或密码错误' })
      };
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' } // token 7天后过期
    );

    // 返回用户信息和 token
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          createTime: user.created_at
        }
      })
    };

  } catch (error) {
    console.error('登录错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '登录失败，请稍后重试' })
    };
  }
};
