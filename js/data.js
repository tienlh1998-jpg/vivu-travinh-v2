// ViVuTraVinh - Data loading module
// Phase 1: Google Sheets API v4 + localStorage cache + JSON fallback

import { initConfig } from './config.js';

const CACHE_KEY = 'vivutravinh-places';
const CACHE_TTL = 30 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 800;
const FALLBACK_URL = './data/data-fallback.json';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=ViVuTraVinh';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildSheetsApiUrl(config) {
    const sheetRange = `${config.sheetName}!${config.range}`;
    const encodedRange = encodeURIComponent(sheetRange);
    const encodedKey = encodeURIComponent(config.apiKey);

    return `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${encodedRange}?key=${encodedKey}`;
}

function readCache() {
    try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        if (!rawCache) return null;

        const cache = JSON.parse(rawCache);
        if (!cache || !Array.isArray(cache.data) || typeof cache.timestamp !== 'number') {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        if (Date.now() - cache.timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return cache.data;
    } catch (error) {
        console.warn('[ViVuTraVinh Data] Không đọc được cache:', error);
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

function writeCache(places) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: places,
        }));
    } catch (error) {
        console.warn('[ViVuTraVinh Data] Không ghi được cache:', error);
    }
}

function normalizeText(value) {
    return String(value || '').trim();
}

function normalizeKey(key) {
    return normalizeText(key)
        .toLowerCase()
        .replace(/[📍🗺️🏘️⭐✍️📸🎯💰⏰📞📝]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function findValue(row, names) {
    for (const name of names) {
        const wantedKey = normalizeKey(name);
        const actualKey = Object.keys(row).find(key => normalizeKey(key) === wantedKey);
        if (actualKey && row[actualKey] !== undefined) {
            return normalizeText(row[actualKey]);
        }
    }

    return '';
}

function rowsToObjects(values) {
    if (!Array.isArray(values) || values.length < 2) return [];

    const headers = values[0].map(normalizeText);

    return values.slice(1).map(row => {
        return headers.reduce((place, header, index) => {
            if (header) {
                place[header] = normalizeText(row[index]);
            }
            return place;
        }, {});
    }).filter(row => Object.values(row).some(Boolean));
}

function isApprovedPlace(row) {
    const status = findValue(row, ['Trạng Thái', 'Trang Thái', 'Status', 'Duyet']).toLowerCase();
    return status === 'duyệt' || status === 'duyet' || status === 'approved';
}

function convertGoogleDriveLink(url) {
    const normalizedUrl = normalizeText(url);
    if (!normalizedUrl.includes('drive.google.com')) return normalizedUrl;

    const idParamMatch = normalizedUrl.match(/[?&]id=([^&]+)/);
    if (idParamMatch) {
        return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }

    const filePathMatch = normalizedUrl.match(/\/file\/d\/([^/]+)/);
    if (filePathMatch) {
        return `https://lh3.googleusercontent.com/d/${filePathMatch[1]}`;
    }

    return normalizedUrl;
}

function parseImages(rawImages) {
    const images = normalizeText(rawImages)
        .split(/[\n,]+/)
        .map(image => convertGoogleDriveLink(image))
        .filter(Boolean);

    return images.length > 0 ? images : [PLACEHOLDER_IMAGE];
}

function createSlug(text, fallback) {
    const slug = normalizeText(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || fallback;
}

function parseOperatingHours(rawHours) {
    const hours = normalizeText(rawHours);
    if (!hours) return { openingTime: '', closingTime: '', displayHours: '' };

    if (hours.toLowerCase().includes('24/7')) {
        return { openingTime: hours, closingTime: '', displayHours: hours };
    }

    const rangeMatch = hours.match(/(\d{1,2}:\d{2})(?::\d{2})?\s*[-–—]\s*(\d{1,2}:\d{2})(?::\d{2})?/);
    if (rangeMatch) {
        return {
            openingTime: rangeMatch[1],
            closingTime: rangeMatch[2],
            displayHours: `${rangeMatch[1]} - ${rangeMatch[2]}`,
        };
    }

    return { openingTime: hours, closingTime: '', displayHours: hours };
}

function normalizePlace(row, index) {
    const name = findValue(row, ['Tên địa điểm', 'Tên Địa Điểm / Cơ Sở', 'Name', 'Tên']);
    const category = findValue(row, ['Phân loại', 'Loại Hình Địa Điểm', 'Category', 'Loại']);
    const rawPrice = findValue(row, ['Mức Giá', 'Mức Giá Tham Khảo (Chi phí trung bình cho một người/lần ghé thăm)', 'Giá', 'Price']);
    const rawHours = findValue(row, ['Giờ Mở Cửa', 'Giờ Mở Cửa / Giờ Hoạt Động (Nếu có)', 'Opening Time', 'Open']);
    const hours = parseOperatingHours(rawHours);
    const images = parseImages(findValue(row, ['Link Hình Ảnh', 'Ảnh Đại Diện Chất Lượng Cao', 'Hình Ảnh', 'Link Ảnh', 'Image']));
    const rating = Number.parseFloat(findValue(row, ['Chấm Điểm?', 'Chấm Điểm', 'Đánh Giá', 'Rating', 'Sao', 'Star', 'Điểm', 'Review'])) || 0;
    const id = findValue(row, ['Slug', 'ID', 'Id']) || createSlug(name, `location-${index}`);

    return {
        ...row,
        id,
        slug: id,
        name,
        category,
        area: findValue(row, ['Khu vực', 'Thuộc Huyện / Thị xã nào?', 'Địa chỉ Chi Tiết (Số nhà, đường, khóm/ấp)', 'Area', 'Location']),
        address: findValue(row, ['Địa chỉ Chi Tiết (Số nhà, đường, khóm/ấp)', 'Địa chỉ', 'Address']),
        mapLink: findValue(row, ['Link Google Maps', 'Map Link', 'Maps']),
        priceRaw: rawPrice,
        priceFormatted: rawPrice || 'Liên hệ',
        imageLink: images[0],
        imageGallery: images,
        images,
        description: findValue(row, ['Mô Tả', 'Mô tả', 'Mô tả Ngắn Hấp Dẫn về Địa Điểm (Ít nhất 50 từ)', 'Description']),
        note: findValue(row, ['Ghi Chú Thêm (Tiện ích, lưu ý quan trọng, kinh nghiệm...)', 'Ghi chú', 'Note']),
        contact: findValue(row, ['Số Điện Thoại / Fanpage / Website', 'Liên hệ', 'Contact']),
        coordinates: findValue(row, ['Tọa Độ GPS (Latitude và Longitude)', 'Tọa độ', 'GPS']),
        contributor: findValue(row, ['Người Đóng Góp', 'Contributor']) || 'Ẩn danh',
        rating,
        openingTime: hours.openingTime,
        closingTime: findValue(row, ['Giờ Đóng Cửa', 'Closing Time', 'Close']) || hours.closingTime,
        displayHours: hours.displayHours,
        operatingStatus: findValue(row, ['Trạng Thái Hoạt Động', 'Operating Status']) || 'Normal',
        status: findValue(row, ['Trạng Thái', 'Trang Thái', 'Status', 'Duyet']),
    };
}

function hasDisplayableContent(row) {
    return Boolean(findValue(row, ['Tên địa điểm', 'Tên Địa Điểm / Cơ Sở', 'Name', 'Tên']));
}

function normalizePlaces(rows) {
    return rows
        .filter(isApprovedPlace)
        .filter(hasDisplayableContent)
        .map((row, index) => normalizePlace(row, index));
}

async function fetchWithRetry(url, options = {}, maxRetries = MAX_RETRIES) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            lastError = error;
            console.warn(`[ViVuTraVinh Data] Lần tải ${attempt}/${maxRetries} thất bại:`, error);

            if (attempt < maxRetries) {
                await sleep(RETRY_DELAY * attempt);
            }
        }
    }

    throw lastError;
}

async function loadPlacesFromGoogleSheets(config) {
    const apiUrl = buildSheetsApiUrl(config);
    const response = await fetchWithRetry(apiUrl, { cache: 'no-store' });
    const payload = await response.json();

    if (!payload || !Array.isArray(payload.values)) {
        throw new Error('Google Sheets API trả về dữ liệu không hợp lệ.');
    }

    return normalizePlaces(rowsToObjects(payload.values));
}

async function loadPlacesFromFallback() {
    const response = await fetchWithRetry(FALLBACK_URL, { cache: 'no-store' });
    const payload = await response.json();

    if (!Array.isArray(payload)) {
        throw new Error('File fallback phải là một array các địa điểm.');
    }

    return normalizePlaces(payload);
}

export async function loadPlaces(configOverrides = {}) {
    const cachedPlaces = readCache();
    if (cachedPlaces) {
        return cachedPlaces;
    }

    try {
        const config = initConfig(configOverrides);
        const places = await loadPlacesFromGoogleSheets(config);
        if (places.length === 0) {
            throw new Error('Google Sheet không có địa điểm đã duyệt với đầy đủ tên để hiển thị.');
        }
        writeCache(places);
        return places;
    } catch (apiError) {
        console.error('[ViVuTraVinh Data] Không tải được Google Sheets API, chuyển sang fallback:', apiError);

        const fallbackPlaces = await loadPlacesFromFallback();
        writeCache(fallbackPlaces);
        return fallbackPlaces;
    }
}

export function clearPlacesCache() {
    localStorage.removeItem(CACHE_KEY);
}
