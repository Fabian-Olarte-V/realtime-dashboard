import { AppUser } from '../models/appUser';

export interface AuthState {
  user: AppUser | null;
  token: string | null;
  status: 'authenticated' | 'unauthenticated';
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  status: 'unauthenticated',
};
