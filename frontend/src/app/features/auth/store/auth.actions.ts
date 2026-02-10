import { createAction, props } from '@ngrx/store';
import { AppUser } from '../models/appUser';

export const loginMock = createAction(
  '[Auth] Login Mock',
  props<{ user: AppUser; token: string }>(),
);

export const logout = createAction('[Auth] Logout');
