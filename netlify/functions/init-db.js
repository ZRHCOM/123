const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const sql = neon();

    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      balance DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      order_id VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: '数据库表创建成功！' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
