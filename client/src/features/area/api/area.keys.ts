export const areaKeys = {
  all: ['area'] as const,
  profile: () => [...areaKeys.all, 'profile'] as const,
  unions: () => [...areaKeys.all, 'unions'] as const,
  administration: () => [...areaKeys.all, 'administration'] as const,
  municipality: () => [...areaKeys.all, 'municipality'] as const,
};
