export type AppEnv = 'development' | 'staging' | 'production';

const env = (import.meta.env.VITE_ENV as AppEnv | undefined) ?? (import.meta.env.MODE as AppEnv) ?? 'development';

const API_BASE_URLS: Record<AppEnv, string> = {
  development: 'http://localhost:5001',
  staging: 'https://staging.example.com',
  production: 'https://example.com',
};

export const API_BASE_URL = API_BASE_URLS[env];
