export const CARDS: (number | '?')[] = [1, 3, 5, 8, 13, '?'];
export const COLORS: Record<string, string> = {
  1: '#81C784',
  3: '#4CAF50',
  5: '#FFB74D',
  8: '#EF5350',
  13: '#8C4343',
  '?': '#cbd5e1',
};
export const SCORE_VALUES = [1, 3, 5, 8, 13];
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
export const THEME_STORAGE_KEY = 'planning-poker-theme';
export const MIN_NAME_LENGTH = 3;
