import { initConfig } from './config.js';

const TABLE_NAME = 'place_comments';
const COMMENT_LIMIT = 20;
const COOLDOWN_MS = 30 * 1000;

function getSupabaseConfig() {
    const config = initConfig();
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Supabase chưa được cấu hình.');
    }

    return {
        url: config.supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
        anonKey: config.supabaseAnonKey,
    };
}

function buildHeaders(anonKey, prefer) {
    const headers = {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
    };

    if (prefer) headers.Prefer = prefer;
    return headers;
}

async function requestSupabase(path, options = {}) {
    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/${path}`, {
        ...options,
        headers: {
            ...buildHeaders(anonKey, options.prefer),
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

function normalizeCommentInput({ placeId, placeName, authorName, rating, commentText }) {
    const payload = {
        place_id: String(placeId || '').trim(),
        place_name: String(placeName || '').trim(),
        author_name: String(authorName || '').trim(),
        rating: Number.parseInt(rating, 10),
        comment_text: String(commentText || '').trim(),
    };

    if (!payload.place_id) throw new Error('Thiếu mã địa điểm.');
    if (payload.author_name.length < 2 || payload.author_name.length > 80) throw new Error('Tên cần từ 2 đến 80 ký tự.');
    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) throw new Error('Vui lòng chọn số sao từ 1 đến 5.');
    if (payload.comment_text.length < 3 || payload.comment_text.length > 1000) throw new Error('Bình luận cần từ 3 đến 1000 ký tự.');

    return payload;
}

function getCooldownKey(placeId) {
    return `vivutravinh-comment-cooldown-${placeId}`;
}

function assertCooldown(placeId) {
    const key = getCooldownKey(placeId);
    const lastSubmit = Number(localStorage.getItem(key) || 0);
    const remaining = COOLDOWN_MS - (Date.now() - lastSubmit);

    if (remaining > 0) {
        throw new Error(`Vui lòng chờ ${Math.ceil(remaining / 1000)} giây trước khi gửi bình luận tiếp theo.`);
    }
}

function markCooldown(placeId) {
    localStorage.setItem(getCooldownKey(placeId), Date.now().toString());
}

export async function loadComments(placeId) {
    const encodedPlaceId = encodeURIComponent(String(placeId || '').trim());
    if (!encodedPlaceId) return [];

    return requestSupabase(`${TABLE_NAME}?place_id=eq.${encodedPlaceId}&is_hidden=eq.false&select=id,place_id,place_name,author_name,rating,comment_text,created_at&order=created_at.desc&limit=${COMMENT_LIMIT}`);
}

export async function submitComment(input) {
    const payload = normalizeCommentInput(input);
    assertCooldown(payload.place_id);

    const rows = await requestSupabase(TABLE_NAME, {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify(payload),
    });

    markCooldown(payload.place_id);
    return rows?.[0] || null;
}

export function summarizeComments(comments) {
    if (!Array.isArray(comments) || comments.length === 0) {
        return { average: 0, count: 0 };
    }

    const total = comments.reduce((sum, comment) => sum + Number(comment.rating || 0), 0);
    return {
        average: Math.round((total / comments.length) * 10) / 10,
        count: comments.length,
    };
}
