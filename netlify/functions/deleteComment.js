const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { commentId, username, postId } = JSON.parse(event.body);
    if (!commentId || !username) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const rows = await sql`SELECT author FROM comments WHERE id = ${commentId}`;
    if (rows.length === 0) return { statusCode: 404, headers, body: JSON.stringify({ error: '评论不存在' }) };
    if (rows[0].author !== username) return { statusCode: 403, headers, body: JSON.stringify({ error: '无权删除' }) };
    await sql`DELETE FROM comments WHERE id = ${commentId}`;
    if (postId) await sql`UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = ${postId}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
