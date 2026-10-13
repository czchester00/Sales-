export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Lewati Basic Auth untuk endpoint API (karena API dilindungi oleh session token)
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return new Response('Autentikasi diperlukan.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Area Terlindungi"' },
    });
  }

  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    return new Response('Format autentikasi tidak valid.', { status: 400 });
  }

  const decoded = atob(encoded);
  const [username, password] = decoded.split(':');

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'rahasia123';

  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return new Response('Username atau password salah.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Area Terlindungi"' },
    });
  }

  return next();
}
