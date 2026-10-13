async function verifyToken(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7);
  return await env.SALES_KV.get('session:' + token);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  let users = await env.SALES_KV.get('users', { type: 'json' });
  if (!users) {
    users = [{ username: 'admin', password: 'admin123' }];
    await env.SALES_KV.put('users', JSON.stringify(users));
  }

  // Jangan kirim password ke client
  const safeUsers = users.map(u => ({ username: u.username }));
  return new Response(JSON.stringify({ users: safeUsers }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { username, password } = await request.json();
  let users = await env.SALES_KV.get('users', { type: 'json' }) || [];

  const existingIdx = users.findIndex(u => u.username === username);
  if (existingIdx >= 0) {
    users[existingIdx].password = password;
  } else {
    users.push({ username, password });
  }

  await env.SALES_KV.put('users', JSON.stringify(users));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  let users = await env.SALES_KV.get('users', { type: 'json' }) || [];
  users = users.filter(u => u.username !== username);
  await env.SALES_KV.put('users', JSON.stringify(users));

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
