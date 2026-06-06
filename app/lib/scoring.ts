import { CardSet, CardValue, RoomState, TicketHistoryEntry, User } from '@/types';
import { TRAFFIC_LIGHT_STOPS, QUESTION_MARK_COLOR } from './constants';

export function normalizeJobRole(jobRole: string) {
  return jobRole.trim().toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function interpolateTrafficLight(t: number): string {
  const stops = TRAFFIC_LIGHT_STOPS;
  const segments = stops.length - 1;
  const segment = Math.min(Math.floor(t * segments), segments - 1);
  const localT = t * segments - segment;
  const [r1, g1, b1] = hexToRgb(stops[segment]!);
  const [r2, g2, b2] = hexToRgb(stops[segment + 1]!);
  const r = Math.round(r1 + (r2 - r1) * localT);
  const g = Math.round(g1 + (g2 - g1) * localT);
  const b = Math.round(b1 + (b2 - b1) * localT);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function getCardColor(value: CardValue, cards: CardValue[]): string {
  if (String(value) === '?') return QUESTION_MARK_COLOR;

  const numericCards = cards
    .filter((c): c is number => typeof c === 'number')
    .sort((a, b) => a - b);

  if (!numericCards.length) return '#475569';

  const numVal = typeof value === 'number' ? value : Number(value);
  if (isNaN(numVal)) return '#475569';

  const index = numericCards.indexOf(numVal);
  if (index === -1) return '#475569';

  const t = numericCards.length === 1 ? 0 : index / (numericCards.length - 1);
  return interpolateTrafficLight(t);
}

export function calculateAvg(room: RoomState) {
  return calculateAverageForUsers(room.users, room.cardSet.scoreValues) ?? '1';
}

export function calculateRoleAverage(room: RoomState, jobRole: string) {
  return (
    calculateAverageForUsers(
      room.users.filter((user) => normalizeJobRole(user.jobRole) === normalizeJobRole(jobRole)),
      room.cardSet.scoreValues,
    ) ?? '-'
  );
}

export function calculateAverageForUsers(users: User[], scoreValues: number[]) {
  const submittedVotes = users
    .map((user) => user.vote)
    .filter((vote): vote is CardValue => vote !== null);

  if (submittedVotes.length > 0 && submittedVotes.every((vote) => String(vote) === '?')) {
    return '?';
  }

  const votes = users
    .filter((user): user is User & { vote: number } => typeof user.vote === 'number')
    .map((user) => user.vote)
    .sort((a, b) => a - b);

  if (!votes.length) return null;

  const middleIndex = Math.floor(votes.length / 2);
  const median =
    votes.length % 2 === 0
      ? (votes[middleIndex - 1]! + votes[middleIndex]!) / 2
      : votes[middleIndex]!;

  if (!scoreValues.length) return '?';

  const closestScore = scoreValues.reduce((closest, current) =>
    Math.abs(current - median) < Math.abs(closest - median) ? current : closest,
    scoreValues[0]!,
  );

  return String(closestScore);
}

export function getScoreColor(score: string, cardSet: CardSet): string {
  if (score === '?') return QUESTION_MARK_COLOR;
  if (score === '-') return '#475569';
  return getCardColor(score, cardSet.cards);
}

export function formatHistoryTimestamp(entry: TicketHistoryEntry) {
  const completedAt = new Date(entry.completedAt);

  if (Number.isNaN(completedAt.getTime())) {
    return 'Completed just now';
  }

  return completedAt.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
