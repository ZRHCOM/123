const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const h = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:h,body:''};
  try {
    const { username } = JSON.parse(event.body || '{}');
    const sql = neon();

    // 自动建表
    await sql`CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(50) PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT,
      preview TEXT,
      tag VARCHAR(50),
      author VARCHAR(50) NOT NULL,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      comment_count INT DEFAULT 0,
      is_official BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS post_likes (
      post_id VARCHAR(50),
      username VARCHAR(50),
      PRIMARY KEY(post_id, username)
    )`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`;

    const rows = await sql`
      SELECT p.*,
        COALESCE(array_agg(pl.username) FILTER (WHERE pl.username IS NOT NULL), '{}') as liked_by,
        u.avatar as author_avatar
      FROM posts p
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      LEFT JOIN users u ON u.username = p.author
      GROUP BY p.id, u.avatar
      ORDER BY p.created_at DESC
      LIMIT 100
    `;

    const posts = rows.map(r => ({
      id: r.id,
      title: r.title,
      body: r.body,
      preview: r.preview,
      tag: r.tag,
      author: r.author,
      authorAvatar: r.author_avatar || null,
      views: r.views || 0,
      likes: r.likes || 0,
      commentCount: r.comment_count || 0,
      isOfficial: r.is_official,
      likedBy: r.liked_by || [],
      liked: username ? (r.liked_by || []).includes(username) : false,
      time: timeAgo(r.created_at)
    }));

    return {statusCode:200,headers:h,body:JSON.stringify({success:true,posts})};
  } catch(e) {
    return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})};
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
