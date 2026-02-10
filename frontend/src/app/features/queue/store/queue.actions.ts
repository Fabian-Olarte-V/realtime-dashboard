import { createAction, props } from '@ngrx/store';
import { QueueFilters, QueueItem } from '../models/queue';

export const seedTickets = createAction('[Queue] Seed Tickets', props<{ items: QueueItem[] }>());
export const setFilters = createAction('[Queue] Set Filters', props<{ filters: QueueFilters }>());
export const selectTicket = createAction('[Queue] Select Ticket', props<{ id: string | null }>());
