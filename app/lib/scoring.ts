import { RoomState, TicketHistoryEntry, User } from '@/types';
import { COLORS, SCORE_VALUES } from './constants';

export function normalizeJobRole(jobRole: string) {
  return jobRole.trim().toLowerCase();
}

export function calculateAvg(room: RoomState) {
  return calculateAverageForUsers(room.users) ?? '1';
}

export function calculateRoleAverage(room: RoomState, jobRole: string) {
  return (
    calculateAverageForUsers(
      room.users.filter((user) => normalizeJobRole(user.jobRole) === normalizeJobRole(jobRole))
    ) ?? '-'
  );
}

export function calculateAverageForUsers(users: User[]) {
  const submittedVotes = users
    .map((user) => user.vote)
    .filter((vote): vote is number | '?' => vote !== null);

  if (submittedVotes.length > 0 && submittedVotes.every((vote) => vote === '?')) {
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
      ? (votes[middleIndex - 1] + votes[middleIndex]) / 2
      : votes[middleIndex];

  const closestScore = SCORE_VALUES.reduce((closest, current) =>
    Math.abs(current - median) < Math.abs(closest - median) ? current : closest,
    SCORE_VALUES[0]
  );

  return String(closestScore);
}

export function getScoreColor(score: string) {
  if (score === '?') return COLORS['?'];
  if (score === '-') return '#475569';

  const average = Number(score);
  const nearestCard = SCORE_VALUES.reduce((closest, current) =>
    Math.abs(current - average) < Math.abs(closest - average) ? current : closest,
    SCORE_VALUES[0]
  );

  return COLORS[String(nearestCard)];
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
