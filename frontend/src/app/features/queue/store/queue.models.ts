import { QueueFilters, QueueItem } from "../models/queue";

export interface QueueState {
  items: Record<string, QueueItem>;
  ids: string[]; // sorted order
  selectedItemId: string | null;
  filters: QueueFilters;
}

export const initialQueueState: QueueState = {
  items: {},
  ids: [],
  selectedItemId: null,
  filters: {
    searchText: '',
    sort: 'updatedAt_desc',
    status: 'ALL',
  },
};

