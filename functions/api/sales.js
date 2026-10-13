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

  let sales = await env.SALES_KV.get('sales', { type: 'json' }) || {};
  let freezer = await env.SALES_KV.get('freezer', { type: 'json' }) || {};

  if (month) {
    sales = { [month]: sales[month] || {} };
    freezer = { [month]: freezer[month] || {} };
  }

  return new Response(JSON.stringify({ sales, freezer }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await verifyToken(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { month, sales, freezer } = await request.json();

  let allSales = await env.SALES_KV.get('sales', { type: 'json' }) || {};
  let allFreezer = await env.SALES_KV.get('freezer', { type: 'json' }) || {};

  allSales[month] = sales;
  allFreezer[month] = freezer;

  await env.SALES_KV.put('sales', JSON.stringify(allSales));
  await env.SALES_KV.put('freezer', JSON.stringify(allFreezer));

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
