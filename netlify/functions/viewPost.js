const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { postId } = JSON.parse(event.body);
    if (!postId) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon();
    await sql`UPDATE posts SET views = views + 1 WHERE id = ${postId}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
