const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const { username, password } = JSON.parse(event.body);
    if (!username || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: '账号和密码不能为空' }) };
    if (password.length < 6) return { statusCode: 400, headers, body: JSON.stringify({ error: '密码至少6位' }) };
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL, balance DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL, order_id VARCHAR(50) NOT NULL, name VARCHAR(100) NOT NULL, amount DECIMAL(10,2) NOT NULL, icon VARCHAR(20) DEFAULT '📦', created_at TIMESTAMP DEFAULT NOW())`;
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing.length > 0) return { statusCode: 400, headers, body: JSON.stringify({ error: '账号已存在' }) };
    await sql`INSERT INTO users (username, password, balance) VALUES (${username}, ${password}, 0)`;
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) { return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
