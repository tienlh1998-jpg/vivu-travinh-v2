const TABLE_NAME = 'place_comments';

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function requireAdmin(request, response) {
  const configuredSecret = process.env.ADMIN_SECRET;
  const providedSecret = request.headers['x-admin-secret'];

  if (!configuredSecret) {
    sendJson(response, 500, { error: 'ADMIN_SECRET is not configured.' });
    return false;
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    sendJson(response, 401, { error: 'Unauthorized.' });
    return false;
  }

  return true;
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin environment variables are not configured.');
  }

  return {
    baseUrl: supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
    serviceRoleKey,
  };
}

async function readBody(request) {
  if (typeof request.body === 'string') {
    return request.body ? JSON.parse(request.body) : {};
  }

  if (Buffer.isBuffer(request.body)) {
    return request.body.length ? JSON.parse(request.body.toString('utf8')) : {};
  }

  if (request.body && typeof request.body === 'object' && typeof request.body[Symbol.asyncIterator] !== 'function') {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function supabaseRequest(path, options = {}) {
  const { baseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function listComments(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const limit = Math.min(Number.parseInt(url.searchParams.get('limit') || '100', 10), 200);
  const hidden = url.searchParams.get('hidden');
  const hiddenFilter = hidden === 'true' || hidden === 'false' ? `&is_hidden=eq.${hidden}` : '';
  const query = `${TABLE_NAME}?select=id,place_id,place_name,author_name,rating,comment_text,created_at,is_hidden${hiddenFilter}&order=created_at.desc&limit=${limit}`;
  const comments = await supabaseRequest(query);
  sendJson(response, 200, { comments });
}

async function updateComment(request, response) {
  const body = await readBody(request);
  const id = Number.parseInt(body.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    sendJson(response, 400, { error: 'Invalid comment id.' });
    return;
  }

  if (typeof body.is_hidden !== 'boolean') {
    sendJson(response, 400, { error: 'is_hidden must be boolean.' });
    return;
  }

  const rows = await supabaseRequest(`${TABLE_NAME}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ is_hidden: body.is_hidden }),
  });

  sendJson(response, 200, { comment: rows?.[0] || null });
}

async function deleteComment(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const id = Number.parseInt(url.searchParams.get('id'), 10);

  if (!Number.isInteger(id) || id <= 0) {
    sendJson(response, 400, { error: 'Invalid comment id.' });
    return;
  }

  await supabaseRequest(`${TABLE_NAME}?id=eq.${id}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });

  sendJson(response, 200, { ok: true });
}

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) return;

  try {
    if (request.method === 'GET') {
      await listComments(request, response);
      return;
    }

    if (request.method === 'PATCH') {
      await updateComment(request, response);
      return;
    }

    if (request.method === 'DELETE') {
      await deleteComment(request, response);
      return;
    }

    sendJson(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Unexpected admin API error.' });
  }
}
