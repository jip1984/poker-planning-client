import { CardSet } from '@/types';

// White numbers must stay readable on every card. Card numbers are large bold
// text, so the WCAG minimum is 3:1; the lightest stop (#43A047) is ~3.3:1.
export const TRAFFIC_LIGHT_STOPS = [
  '#43A047', // lowest card: lighter green
  '#1B5E20', // second card: deeper green, so the first two are easy to tell apart
  '#B45309',
  '#C62828',
  '#8C4343',
];
export const QUESTION_MARK_COLOR = '#64748b';

export const CARD_PRESETS: CardSet[] = [
  {
    name: 'fibonacci',
    label: 'Fibonacci',
    cards: [1, 3, 5, 8, 13, '?'],
    scoreValues: [1, 3, 5, 8, 13],
  },
  {
    name: 'modified-fibonacci',
    label: 'Modified Fibonacci',
    cards: [1, 2, 3, 5, 8, 13, 21, '?'],
    scoreValues: [1, 2, 3, 5, 8, 13, 21],
  },
  {
    name: 'sequential',
    label: 'Sequential',
    cards: [1, 2, 3, 4, 5, 6, 7, 8, 13, '?'],
    scoreValues: [1, 2, 3, 4, 5, 6, 7, 8, 13],
  },
  {
    name: 'custom',
    label: 'Custom',
    cards: [],
    scoreValues: [],
  },
];

export const DEFAULT_CARD_SET: CardSet = CARD_PRESETS[0]!;

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
export const THEME_STORAGE_KEY = 'planning-poker-theme';
export const MIN_NAME_LENGTH = 3;
