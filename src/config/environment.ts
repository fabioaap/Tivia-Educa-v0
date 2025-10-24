export const environment = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.educacross.com.br',
  ENABLE_TELEMETRY: import.meta.env.VITE_ENABLE_TELEMETRY !== 'false',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENVIRONMENT: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',
} as const;
