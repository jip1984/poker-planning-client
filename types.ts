export type Role = 'host' | 'voter';

export interface User {
  id: string;
  name: string;
  role: Role;
  jobRole: string;
  vote: number | '?' | null;
}

export interface TicketHistoryEntry {
  ticket: string;
  score: number | '?';
  completedAt: string;
}

export interface RoomState {
  ticket: string;
  revealed: boolean;
  users: User[];
  history: TicketHistoryEntry[];
}
