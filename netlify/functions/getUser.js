const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { username } = JSON.parse(event.body || '{}');
    if (!username) return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少用户名' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userRows = await sql`SELECT username, balance FROM users WHERE username = ${username}`;
    if (userRows.length === 0) return { statusCode: 404, headers, body: JSON.stringify({ error: '用户不存在' }) };
    const orderRows = await sql`SELECT order_id, name, amount, icon, created_at FROM orders WHERE username = ${username} ORDER BY created_at DESC LIMIT 50`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, username: userRows[0].username, balance: parseFloat(userRows[0].balance), orders: orderRows.map(o => ({ id: o.order_id, name: o.name, amount: parseFloat(o.amount), icon: o.icon, date: new Date(o.created_at).toLocaleDateString('zh-CN') })) }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
