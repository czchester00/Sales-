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

  const url = new URL(request.url);
  const month = url.searchParams.get('month');

  let sales = await env.SALES_KV.get('sales', { type: 'json' }) || [];

  if (month) {
    sales = sales.filter(s => s.date.startsWith(month));
  }

  const total = sales.reduce((sum, s) => sum + Number(s.amount), 0);

  return new Response(JSON.stringify({ sales, total }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { date, amount, isEdit } = await request.json();
  let sales = await env.SALES_KV.get('sales', { type: 'json' }) || [];

  const existingIdx = sales.findIndex(s => s.date === date);
  if (existingIdx >= 0) {
    sales[existingIdx].amount = amount;
  } else {
    sales.push({ date, amount });
  }

  await env.SALES_KV.put('sales', JSON.stringify(sales));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  let sales = await env.SALES_KV.get('sales', { type: 'json' }) || [];
  sales = sales.filter(s => s.date !== date);
  await env.SALES_KV.put('sales', JSON.stringify(sales));

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}