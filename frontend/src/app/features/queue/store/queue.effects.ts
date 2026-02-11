import { inject, Injectable } from '@angular/core';
import * as QueueActions from './queue.actions';
import * as QueueSelectors from './queue.selectors';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { QueueService } from '../services/queue.service';
import { catchError, exhaustMap, map, of, switchMap, takeUntil, timer, withLatestFrom } from 'rxjs';

@Injectable()
export class QueueEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly queueApi = inject(QueueService);

  startPolling$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QueueActions.startPolling),
      switchMap(() =>
        timer(0, 5000).pipe(
          takeUntil(this.actions$.pipe(ofType(QueueActions.stopPolling))),
          withLatestFrom(this.store.select(QueueSelectors.selectLastSyncAt)),
          exhaustMap(([, lastSyncAt]) => {
            const since = lastSyncAt ?? '1970-01-01T00:00:00.000Z';
            return this.queueApi.getTickets(since).pipe(
              map((res) => QueueActions.pollSuccess({ items: res })),
              catchError((err) =>
                of(QueueActions.pollFailure({ error: err.message || 'Polling failed' })),
              ),
            );
          }),
        ),
      ),
    ),
  );
}
