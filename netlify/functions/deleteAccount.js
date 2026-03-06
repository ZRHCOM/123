const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    const sql = neon();
    const rows = await sql`SELECT id FROM users WHERE username = ${username} AND password = ${password}`;
    if (rows.length === 0) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: '验证失败' }) };
    }
    await sql`DELETE FROM orders WHERE username = ${username}`;
    await sql`DELETE FROM users WHERE username = ${username}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
