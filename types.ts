export type Role = 'host' | 'voter';

export interface User {
  id: string;
  name: string;
  role: Role;
  vote: number | '?' | null;
}

export interface RoomState {
  ticket: string;
  revealed: boolean;
  users: User[];
}
