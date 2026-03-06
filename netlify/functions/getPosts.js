const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS posts (id VARCHAR(50) PRIMARY KEY, title VARCHAR(200) NOT NULL, body TEXT, preview VARCHAR(300), tag VARCHAR(30) DEFAULT '用户发帖', author VARCHAR(50) NOT NULL, views INT DEFAULT 1, likes INT DEFAULT 0, is_official BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS post_likes (post_id VARCHAR(50) NOT NULL, username VARCHAR(50) NOT NULL, PRIMARY KEY (post_id, username))`;
    const rows = await sql`SELECT p.*, COALESCE(array_agg(pl.username) FILTER (WHERE pl.username IS NOT NULL), '{}') as liked_by FROM posts p LEFT JOIN post_likes pl ON pl.post_id = p.id GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, posts: rows.map(r => ({ id: r.id, title: r.title, body: r.body, preview: r.preview, tag: r.tag, author: r.author, views: r.views, likes: r.likes, isOfficial: r.is_official, likedBy: r.liked_by || [], time: timeAgo(r.created_at) })) }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
function timeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff/60) + '分钟前';
  if (diff < 86400) return Math.floor(diff/3600) + '小时前';
  if (diff < 86400*7) return Math.floor(diff/86400) + '天前';
  return new Date(date).toLocaleDateString('zh-CN');
}
