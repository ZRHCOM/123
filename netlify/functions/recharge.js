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
    const { username, amount, credit, name, icon } = JSON.parse(event.body);

    if (!username || !amount || !credit) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    }

    const sql = neon();

    // 更新余额
    await sql`UPDATE users SET balance = balance + ${credit} WHERE username = ${username}`;

    // 写入订单
    const orderId = 'TZ' + Date.now().toString().slice(-8);
    await sql`
      INSERT INTO orders (username, order_id, name, amount, icon)
      VALUES (${username}, ${orderId}, ${name || '余额充值'}, ${amount}, ${icon || '💰'})
    `;

    // 返回新余额
    const rows = await sql`SELECT balance FROM users WHERE username = ${username}`;
    const newBalance = parseFloat(rows[0].balance);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, balance: newBalance, orderId })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器错误: ' + e.message }) };
  }
};
