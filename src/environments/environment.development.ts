export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api',
  auth: {
    loginUrl: '/auth/login',
    refreshUrl: '/auth/refresh',
    logoutUrl: '/auth/logout',
    meUrl: '/auth/me',
  },
  api: {
    dashboard: '/dashboard',
    movements: '/movements',
    reports: '/reports',
    products: '/products',
    users: '/users',
    roles: '/roles',
    settings: '/settings',
  },
};
