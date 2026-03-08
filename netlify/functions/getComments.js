const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { postId } = JSON.parse(event.body || '{}');
    if (!postId) return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少postId' }) };
    const sql = neon();
    await sql`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, post_id VARCHAR(50) NOT NULL, author VARCHAR(50) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW())`;
    const rows = await sql`SELECT id, author, content, created_at FROM comments WHERE post_id = ${postId} ORDER BY created_at ASC`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, comments: rows.map(r => ({ id: r.id, author: r.author, content: r.content, time: timeAgo(r.created_at) })) }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

function timeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff/60) + '分钟前';
  if (diff < 86400) return Math.floor(diff/3600) + '小时前';
  if (diff < 86400*7) return Math.floor(diff/86400) + '天前';
  return new Date(date).toLocaleDateString('zh-CN');
}
