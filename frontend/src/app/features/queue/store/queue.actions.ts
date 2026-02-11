import { createAction, props } from '@ngrx/store';
import { QueueFilters, QueueItem } from '../models/queue';

export const setFilters = createAction('[Queue] Set Filters', props<{ filters: QueueFilters }>());
export const selectTicket = createAction('[Queue] Select Ticket', props<{ id: string | null }>());

export const startPolling = createAction('[Queue] Start Polling');
export const stopPolling = createAction('[Queue] Stop Polling');

export const pollSuccess = createAction('[Queue] Poll Success', props<{ items: QueueItem[] }>());
export const pollFailure = createAction('[Queue] Poll Failure', props<{ error: string }>());
