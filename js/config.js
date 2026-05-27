// ViVuTraVinh - App configuration
// Không commit API key thật lên repository public. Hãy inject bằng window.VIVUTRAVINH_CONFIG trước khi import module.

export const SHEET_ID = '1xywS77u_udvGzsZyeV2tiKBReaWAXkdu4EQP41Q3yCI';
export const API_KEY = '';
export const SHEET_NAME = 'Bang1';
export const RANGE = 'A:Z';
export const SUPABASE_URL = 'https://foyraoimhksfvlxndwxr.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveXJhb2ltaGtzZnZseG5kd3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjkwNzAsImV4cCI6MjA5NTMwNTA3MH0.ARJ173UkVNCichCiJmVrbp2aTByVoXnSEAIsIvbnYJ8';

export function initConfig(overrides = {}) {
    const runtimeConfig = window.VIVUTRAVINH_CONFIG || {};

    return {
        sheetId: overrides.sheetId || runtimeConfig.sheetId || SHEET_ID,
        apiKey: overrides.apiKey || runtimeConfig.apiKey || API_KEY,
        sheetName: overrides.sheetName || runtimeConfig.sheetName || SHEET_NAME,
        range: overrides.range || runtimeConfig.range || RANGE,
        supabaseUrl: overrides.supabaseUrl || runtimeConfig.supabaseUrl || SUPABASE_URL,
        supabaseAnonKey: overrides.supabaseAnonKey || runtimeConfig.supabaseAnonKey || SUPABASE_ANON_KEY,
    };
}

export function assertSupabaseConfig(config) {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Thiếu cấu hình Supabase.');
    }
}

export function assertGoogleSheetsConfig(config) {
    if (!config.sheetId) {
        throw new Error('Thiếu SHEET_ID cho Google Sheets API.');
    }

    if (!config.apiKey) {
        throw new Error('Thiếu API_KEY cho Google Sheets API. Hãy cấu hình qua window.VIVUTRAVINH_CONFIG hoặc truyền vào initConfig().');
    }

    if (!config.sheetName) {
        throw new Error('Thiếu Sheet Name cho Google Sheets API.');
    }

    if (!config.range) {
        throw new Error('Thiếu Range cho Google Sheets API.');
    }
}
