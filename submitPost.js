const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { id, title, body, preview, tag, author } = JSON.parse(event.body);
    if (!title || !author) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    await sql`INSERT INTO posts (id, title, body, preview, tag, author, views, likes, is_official) VALUES (${id}, ${title}, ${body}, ${preview}, ${tag}, ${author}, 1, 0, false)`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
