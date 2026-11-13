export const homeKeys = {
  all: ['home'] as const,
  popular: () => [...homeKeys.all, 'popular'] as const,
};
