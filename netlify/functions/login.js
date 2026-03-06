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

    if (!username || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '账号和密码不能为空' }) };
    }

    const sql = neon();
    const rows = await sql`SELECT username, balance FROM users WHERE username = ${username} AND password = ${password}`;

    if (rows.length === 0) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: '账号或密码错误' }) };
    }

    const orderRows = await sql`SELECT COUNT(*) as cnt FROM orders WHERE username = ${username}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        username: rows[0].username,
        balance: parseFloat(rows[0].balance),
        orderCount: parseInt(orderRows[0].cnt)
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器错误: ' + e.message }) };
  }
};
