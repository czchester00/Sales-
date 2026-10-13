export async function onRequestPost(context) {
  const { request, env } = context;
  const { username, password } = await request.json();

  // Ambil daftar user dari KV, fallback ke default
  let users = await env.SALES_KV.get('users', { type: 'json' });
  if (!users) {
    users = [{ username: 'admin', password: 'admin123' }];
    await env.SALES_KV.put('users', JSON.stringify(users));
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Buat token sederhana (base64 dari username + timestamp)
  const token = btoa(username + ':' + Date.now() + ':secretkey');
  await env.SALES_KV.put('session:' + token, username, { expirationTtl: 86400 });

  return new Response(JSON.stringify({ token, username }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
