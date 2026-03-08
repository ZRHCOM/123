const { neon } = require('@netlify/neon');
exports.handler = async (event) => {
  const h = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:h,body:''};
  try {
    const { username, avatar } = JSON.parse(event.body);
    if (!username || !avatar) return {statusCode:400,headers:h,body:JSON.stringify({error:'参数错误'})};
    const sql = neon();
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`;
    await sql`UPDATE users SET avatar = ${avatar} WHERE username = ${username}`;
    return {statusCode:200,headers:h,body:JSON.stringify({success:true})};
  } catch(e) { return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})}; }
};
