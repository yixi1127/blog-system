/**
 * 文章 API 测试脚本
 * 
 * 使用方法：
 * 1. 确保 netlify dev 正在运行
 * 2. 修改下面的 TOKEN 为你的实际登录 token
 * 3. 运行: node test-api.js
 */

const https = require('https');
const http = require('http');

// 配置
const BASE_URL = 'http://localhost:8888'; // Netlify Dev 默认端口
const TOKEN = 'YOUR_TOKEN_HERE'; // 替换为实际的 token

// 辅助函数：发送 HTTP 请求
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试函数
async function runTests() {
  console.log('🚀 开始测试文章 API...\n');

  let createdArticleId = null;

  try {
    // 测试 1: 创建文章
    console.log('📝 测试 1: 创建文章');
    const createData = {
      title: '测试文章 - API 自动化测试',
      content: '这是一篇通过 API 测试脚本创建的文章。\n\n包含多行内容。',
      summary: '这是文章摘要',
      category: '技术分享',
      tags: ['测试', 'API', '自动化'],
      status: 'published'
    };

    const createResult = await request('POST', '/.netlify/functions/article-create', createData);
    console.log(`状态码: ${createResult.status}`);
    console.log('响应:', JSON.stringify(createResult.data, null, 2));

    if (createResult.status === 200 && createResult.data.success) {
      createdArticleId = createResult.data.article.id;
      console.log('✅ 创建成功，文章 ID:', createdArticleId);
    } else {
      console.log('❌ 创建失败');
      return;
    }

    console.log('\n---\n');

    // 测试 2: 获取文章列表
    console.log('📋 测试 2: 获取文章列表');
    const listResult = await request('GET', '/.netlify/functions/article-list?page=1&pageSize=10');
    console.log(`状态码: ${listResult.status}`);
    console.log(`文章总数: ${listResult.data.total}`);
    console.log(`当前页文章数: ${listResult.data.list?.length || 0}`);

    if (listResult.status === 200 && listResult.data.success) {
      console.log('✅ 获取列表成功');
      if (listResult.data.list?.length > 0) {
        console.log('最新文章:', listResult.data.list[0].title);
      }
    } else {
      console.log('❌ 获取列表失败');
    }

    console.log('\n---\n');

    // 测试 3: 查看文章详情
    if (createdArticleId) {
      console.log('👀 测试 3: 查看文章详情');
      const detailResult = await request('GET', `/.netlify/functions/article-detail?id=${createdArticleId}`);
      console.log(`状态码: ${detailResult.status}`);
      console.log('响应:', JSON.stringify(detailResult.data, null, 2));

      if (detailResult.status === 200 && detailResult.data.success) {
        console.log('✅ 查看详情成功');
      } else {
        console.log('❌ 查看详情失败');
      }

      console.log('\n---\n');
    }

    // 测试 4: 编辑文章
    if (createdArticleId) {
      console.log('✏️ 测试 4: 编辑文章');
      const updateData = {
        id: createdArticleId,
        title: '测试文章 - API 自动化测试（已更新）',
        content: '这是更新后的内容。\n\n添加了新的段落。',
        summary: '这是更新后的摘要',
        category: '技术分享',
        tags: ['测试', 'API', '自动化', '更新'],
        status: 'published'
      };

      const updateResult = await request('PUT', '/.netlify/functions/article-update', updateData);
      console.log(`状态码: ${updateResult.status}`);
      console.log('响应:', JSON.stringify(updateResult.data, null, 2));

      if (updateResult.status === 200 && updateResult.data.success) {
        console.log('✅ 编辑成功');
      } else {
        console.log('❌ 编辑失败');
      }

      console.log('\n---\n');
    }

    // 测试 5: 再次查看详情（验证更新）
    if (createdArticleId) {
      console.log('🔍 测试 5: 验证更新结果');
      const verifyResult = await request('GET', `/.netlify/functions/article-detail?id=${createdArticleId}`);
      
      if (verifyResult.status === 200 && verifyResult.data.success) {
        const article = verifyResult.data.article;
        console.log('文章标题:', article.title);
        console.log('文章标签:', article.tags);
        console.log('✅ 验证成功，更新已生效');
      } else {
        console.log('❌ 验证失败');
      }

      console.log('\n---\n');
    }

    // 测试 6: 搜索文章
    console.log('🔎 测试 6: 搜索文章');
    const searchResult = await request('GET', '/.netlify/functions/article-list?title=测试&page=1&pageSize=10');
    console.log(`状态码: ${searchResult.status}`);
    console.log(`搜索结果数: ${searchResult.data.list?.length || 0}`);

    if (searchResult.status === 200 && searchResult.data.success) {
      console.log('✅ 搜索成功');
    } else {
      console.log('❌ 搜索失败');
    }

    console.log('\n---\n');

    // 测试 7: 删除文章（可选，取消注释以启用）
    /*
    if (createdArticleId) {
      console.log('🗑️ 测试 7: 删除文章');
      const deleteResult = await request('DELETE', '/.netlify/functions/article-delete', { id: createdArticleId.toString() });
      console.log(`状态码: ${deleteResult.status}`);
      console.log('响应:', JSON.stringify(deleteResult.data, null, 2));

      if (deleteResult.status === 200 && deleteResult.data.success) {
        console.log('✅ 删除成功');
      } else {
        console.log('❌ 删除失败');
      }
    }
    */

    console.log('\n✨ 测试完成！');
    console.log(`\n💡 提示: 创建的测试文章 ID 为 ${createdArticleId}，你可以在浏览器中查看它。`);

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
    console.error(error);
  }
}

// 检查配置
if (TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('⚠️ 请先配置 TOKEN！');
  console.log('\n获取 TOKEN 的步骤：');
  console.log('1. 在浏览器中登录你的应用');
  console.log('2. 打开开发者工具（F12）');
  console.log('3. 在 Console 中输入: localStorage.getItem("token")');
  console.log('4. 复制输出的 token 值');
  console.log('5. 替换本文件中的 YOUR_TOKEN_HERE\n');
  process.exit(1);
}

// 运行测试
runTests();
