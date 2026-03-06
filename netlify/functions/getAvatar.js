const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { username } = JSON.parse(event.body || '{}');
    if (!username) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const rows = await sql`SELECT avatar FROM users WHERE username = ${username}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, avatar: rows[0]?.avatar || null }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
