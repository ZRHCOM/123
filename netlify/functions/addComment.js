const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { postId, author, content } = JSON.parse(event.body);
    if (!postId || !author || !content) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    if (content.trim().length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: '评论不能为空' }) };
    const sql = neon();
    await sql`INSERT INTO comments (post_id, author, content) VALUES (${postId}, ${author}, ${content.trim()})`;
    // 更新帖子评论数（在posts表加comment_count字段）
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0`;
    await sql`UPDATE posts SET comment_count = comment_count + 1 WHERE id = ${postId}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
