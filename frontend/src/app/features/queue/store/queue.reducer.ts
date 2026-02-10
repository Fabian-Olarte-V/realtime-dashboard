import { createReducer, on } from '@ngrx/store';
import { initialQueueState } from './queue.models';
import * as QueueActions from './queue.actions';

export const queueFeatureKey = 'queue';

export const queueReducer = createReducer(
  initialQueueState,
  on(QueueActions.seedTickets, (state, { items }) => {
    const entities = { ...state.items };
    const ids: string[] = [];

    for (const item of items) {
      entities[item.id] = item;
      ids.push(item.id);
    }

    return {
      ...state,
      items: entities,
      ids,
    };
  }),

  on(QueueActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: filters,
  })),
  
  on(QueueActions.selectTicket, (state, { id }) => ({
    ...state,
    selectedItemId: id,
  })),
);
