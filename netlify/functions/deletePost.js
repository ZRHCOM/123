const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { postId, username } = JSON.parse(event.body);
    if (!postId || !username) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const rows = await sql`SELECT author FROM posts WHERE id = ${postId}`;
    if (rows.length === 0) return { statusCode: 404, headers, body: JSON.stringify({ error: '帖子不存在' }) };
    if (rows[0].author !== username) return { statusCode: 403, headers, body: JSON.stringify({ error: '无权删除' }) };
    await sql`DELETE FROM comments WHERE post_id = ${postId}`;
    await sql`DELETE FROM post_likes WHERE post_id = ${postId}`;
    await sql`DELETE FROM posts WHERE id = ${postId}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
