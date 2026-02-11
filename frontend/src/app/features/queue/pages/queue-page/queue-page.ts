import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { QueueFilters } from '../../models/queue';
import { QueueToolbarComponent } from '../../components/queue-toolbar/queue-toolbar';
import { TicketDetailComponent } from '../../components/ticket-detail/ticket-detail';
import { TicketListComponent } from '../../components/ticket-list/ticket-list';
import { Store } from '@ngrx/store';
import * as QueueSelectors from '../../store/queue.selectors';
import * as QueueActions from '../../store/queue.actions';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-queue-page',
  standalone: true,
  imports: [TicketDetailComponent, TicketListComponent, QueueToolbarComponent, AsyncPipe],
  templateUrl: './queue-page.html',
  styleUrl: './queue-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueuePage implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  readonly filters$ = this.store.select(QueueSelectors.selectFilters);
  readonly items$ = this.store.select(QueueSelectors.selectFilteredTickets);
  readonly selectedItem$ = this.store.select(QueueSelectors.selectSelectedTicket);
  readonly selectedId$ = this.store.select(QueueSelectors.selectSelectedId);
  readonly pollingError$ = this.store.select(QueueSelectors.selectPollingError);

  ngOnInit(): void {
    this.store.dispatch(QueueActions.startPolling());
  }

  ngOnDestroy(): void {
    this.store.dispatch(QueueActions.stopPolling());
  }

  onFiltersChange(filters: QueueFilters): void {
    this.store.dispatch(QueueActions.setFilters({ filters }));
  }

  onSelectItem(id: string): void {
    this.store.dispatch(QueueActions.selectTicket({ id }));
  }

  onAssignToMe(): void {
    console.log('assign to me');
  }

  onComplete(): void {
    console.log('complete');
  }
}
