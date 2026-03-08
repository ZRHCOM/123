const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { postId, username } = JSON.parse(event.body);
    if (!postId || !username) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon();

    // 检查是否已点赞
    const existing = await sql`SELECT 1 FROM post_likes WHERE post_id = ${postId} AND username = ${username}`;

    let liked;
    if (existing.length > 0) {
      // 取消点赞
      await sql`DELETE FROM post_likes WHERE post_id = ${postId} AND username = ${username}`;
      await sql`UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = ${postId}`;
      liked = false;
    } else {
      // 点赞
      await sql`INSERT INTO post_likes (post_id, username) VALUES (${postId}, ${username})`;
      await sql`UPDATE posts SET likes = likes + 1 WHERE id = ${postId}`;
      liked = true;
    }

    const rows = await sql`SELECT likes FROM posts WHERE id = ${postId}`;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, liked, likes: rows[0]?.likes || 0 })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
