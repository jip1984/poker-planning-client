export type Role = 'host' | 'voter';

export type CardValue = number | string;

export interface CardSet {
  name: string;
  label: string;
  cards: CardValue[];
  scoreValues: number[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  jobRole: string;
  vote: CardValue | null;
}

export interface TicketHistoryEntry {
  ticket: string;
  score: CardValue;
  completedAt: string;
}

export interface RoomState {
  ticket: string;
  revealed: boolean;
  users: User[];
  history: TicketHistoryEntry[];
  cardSet: CardSet;
  autoReveal: boolean;
}
