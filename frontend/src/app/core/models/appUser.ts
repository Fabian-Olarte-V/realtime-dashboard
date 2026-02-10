export type UserRole = 'ADMIN' | 'AGENT';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}