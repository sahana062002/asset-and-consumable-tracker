export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ASSET: '/asset',
  LOCATION: '/location',
  USERS: '/users',
  SCAN: '/scan',
  ADMIN_SCAN: '/dashboard/scan',
  ASSET_DETAILS: (id: string | number) => `/asset/${id}`,
  LOCATION_DETAILS: (id: string | number) => `/location/${id}`,
  USER_DETAILS: (id: string | number) => `/users/${id}`,
  SCAN_ASSET: (code: string) => `/scan/asset/${code}`,
  ADMIN_SCAN_ASSET: (code: string) => `/dashboard/scan/asset/${code}`,
};
