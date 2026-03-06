const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { username, amount, credit, name, icon } = JSON.parse(event.body);
    if (!username || !credit) return { statusCode: 400, headers, body: JSON.stringify({ error: '参数错误' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    await sql`UPDATE users SET balance = balance + ${credit} WHERE username = ${username}`;
    const orderId = 'TZ' + Date.now().toString().slice(-8);
    await sql`INSERT INTO orders (username, order_id, name, amount, icon) VALUES (${username}, ${orderId}, ${name || '余额充值'}, ${amount}, ${icon || '💰'})`;
    const rows = await sql`SELECT balance FROM users WHERE username = ${username}`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, balance: parseFloat(rows[0].balance), orderId }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
