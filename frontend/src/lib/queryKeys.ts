export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
  },
  locations: {
    tree: ['locations-tree'] as const,
    flat: ['locations-flat'] as const,
    detail: (id: number) => ['locations', id] as const,
  },
  assets: {
    list: (filters: any) => ['assets', filters] as const,
    detail: (id: number) => ['asset', String(id)] as const,
    scan: (code: string) => ['scan-asset', code] as const,
  }
};
