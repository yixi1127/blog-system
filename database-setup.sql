-- 博客系统数据库表结构
-- 在 Supabase SQL Editor 中运行这段代码

-- 1. 用户表
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 分类表
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 文章表
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  author_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'draft', -- draft 或 published
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 文章标签表（多对多关系）
CREATE TABLE article_tags (
  article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (article_id, tag)
);

-- 5. 创建索引（提高查询速度）
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created ON articles(created_at DESC);

-- 6. 插入默认分类
INSERT INTO categories (name, description, sort) VALUES
  ('技术文章', '技术相关的文章', 1),
  ('生活随笔', '记录生活点滴', 2),
  ('学习笔记', '学习过程中的笔记', 3);

-- 7. 创建更新时间自动触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
