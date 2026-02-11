import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueueState } from './queue.models';
import { queueFeatureKey } from './queue.reducer';

export const selectQueueState = createFeatureSelector<QueueState>(queueFeatureKey);
export const selectQueueIds = createSelector(selectQueueState, (s) => s.ids);


export const selectQueueEntities = createSelector(selectQueueState, (s) => s.items);
export const selectSelectedId = createSelector(selectQueueState, (s) => s.selectedItemId);

export const selectSelectedTicket = createSelector(
  selectQueueEntities,
  selectSelectedId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);


export const selectFilters = createSelector(selectQueueState, (s) => s.filters);

export const selectAllTickets = createSelector(
  selectQueueEntities,
  selectQueueIds,
  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean),
);

export const selectFilteredTickets = createSelector(
  selectAllTickets,
  selectFilters,
  (items, filters) => {
    const search = filters.searchText.trim().toLowerCase();
    return items
      .filter((i) => (filters.status === 'ALL' ? true : i.status === filters.status))
      .filter((i) => {
        if (!search) return true;
        const searchCriteria = `${i.title} ${i.description ?? ''}`.toLowerCase();
        return searchCriteria.includes(search);
      });
  },
);


export const selectLastSyncAt = createSelector(selectQueueState, (s) => s.lastSyncAt);
export const selectPollingError = createSelector(selectQueueState, (s) => s.pollingError);