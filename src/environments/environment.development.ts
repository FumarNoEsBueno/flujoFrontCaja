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
    cajas: '/cajas',
    movimientos: '/movimientos',
    productos: '/productos',
    reports: '/reports',
    products: '/products',
    users: '/usuarios',
    roles: '/roles',
    settings: '/settings',
  },
};
