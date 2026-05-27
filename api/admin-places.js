const TABLE_NAME = 'places';
const VALID_STATUSES = new Set(['approved', 'draft', 'hidden', 'archived']);
const PATCH_FIELDS = new Set([
  'name',
  'slug',
  'category',
  'area',
  'address',
  'map_link',
  'price_raw',
  'description',
  'note',
  'contact',
  'coordinates',
  'contributor',
  'rating',
  'opening_time',
  'closing_time',
  'display_hours',
  'operating_status',
  'status',
  'images',
  'image_link',
  'sort_order',
  'is_featured',
]);

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

function normalizeText(value) {
  return String(value || '').trim();
}

function sanitizeStatus(value) {
  const status = normalizeText(value || 'draft');
  if (!VALID_STATUSES.has(status)) {
    throw new Error('Invalid place status.');
  }
  return status;
}

function sanitizePatch(body) {
  const patch = {};

  for (const [field, value] of Object.entries(body)) {
    if (!PATCH_FIELDS.has(field)) continue;

    if (field === 'status') {
      patch.status = sanitizeStatus(value);
      continue;
    }

    if (field === 'rating') {
      const rating = Number.parseFloat(value);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        throw new Error('rating must be a number from 0 to 5.');
      }
      patch.rating = rating;
      continue;
    }

    if (field === 'sort_order') {
      const sortOrder = Number.parseInt(value, 10);
      if (!Number.isInteger(sortOrder)) {
        throw new Error('sort_order must be an integer.');
      }
      patch.sort_order = sortOrder;
      continue;
    }

    if (field === 'images') {
      if (!Array.isArray(value)) {
        throw new Error('images must be an array.');
      }
      patch.images = value.map(normalizeText).filter(Boolean);
      continue;
    }

    if (field === 'is_featured') {
      patch.is_featured = Boolean(value);
      continue;
    }

    patch[field] = typeof value === 'string' ? normalizeText(value) : value;
  }

  if ('name' in patch && !patch.name) throw new Error('name is required.');
  if ('slug' in patch && !patch.slug) throw new Error('slug is required.');
  if ('category' in patch && !patch.category) throw new Error('category is required.');

  return patch;
}

function encodeLike(value) {
  return encodeURIComponent(`*${value.replace(/[*,]/g, ' ')}*`);
}

async function listPlaces(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const limit = Math.min(Number.parseInt(url.searchParams.get('limit') || '100', 10), 200);
  const status = url.searchParams.get('status') || 'all';
  const category = normalizeText(url.searchParams.get('category'));
  const q = normalizeText(url.searchParams.get('q'));

  if (status !== 'all' && !VALID_STATUSES.has(status)) {
    sendJson(response, 400, { error: 'Invalid status filter.' });
    return;
  }

  const filters = [];
  if (status !== 'all') filters.push(`status=eq.${encodeURIComponent(status)}`);
  if (category) filters.push(`category=eq.${encodeURIComponent(category)}`);
  if (q) filters.push(`or=(name.ilike.${encodeLike(q)},slug.ilike.${encodeLike(q)},address.ilike.${encodeLike(q)})`);

  const query = `${TABLE_NAME}?select=id,slug,name,category,area,address,map_link,price_raw,description,note,contact,coordinates,contributor,rating,opening_time,closing_time,display_hours,operating_status,status,images,image_link,sort_order,is_featured,created_at,updated_at${filters.length ? `&${filters.join('&')}` : ''}&order=sort_order.asc,updated_at.desc&limit=${limit}`;
  const places = await supabaseRequest(query);
  sendJson(response, 200, { places });
}

async function updatePlace(request, response) {
  const body = await readBody(request);
  const id = Number.parseInt(body.id, 10);

  if (!Number.isInteger(id) || id <= 0) {
    sendJson(response, 400, { error: 'Invalid place id.' });
    return;
  }

  const patch = sanitizePatch(body);
  delete patch.id;

  if (Object.keys(patch).length === 0) {
    sendJson(response, 400, { error: 'No valid fields to update.' });
    return;
  }

  const rows = await supabaseRequest(`${TABLE_NAME}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });

  sendJson(response, 200, { place: rows?.[0] || null });
}

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) return;

  try {
    if (request.method === 'GET') {
      await listPlaces(request, response);
      return;
    }

    if (request.method === 'PATCH') {
      await updatePlace(request, response);
      return;
    }

    sendJson(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Unexpected admin places API error.' });
  }
}
