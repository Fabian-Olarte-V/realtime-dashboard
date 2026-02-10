import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { QueueFilters, QueueItem } from '../../models/queue';
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
export class QueuePage implements OnInit {
  private readonly store = inject(Store);

  readonly filters$ = this.store.select(QueueSelectors.selectFilters);
  readonly items$ = this.store.select(QueueSelectors.selectFilteredTickets);
  readonly selectedItem$ = this.store.select(QueueSelectors.selectSelectedTicket);
  readonly selectedId$ = this.store.select(QueueSelectors.selectSelectedId);

  ngOnInit(): void {
    this.store.dispatch(QueueActions.seedTickets({ items: makeMockTickets(50) }));
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

function makeMockTickets(count: number): QueueItem[] {
  const now = Date.now();
  const statuses: QueueItem['status'][] = ['NEW', 'IN_PROGRESS', 'DONE', 'FAILED'];

  return Array.from({ length: count }).map((_, i) => {
    const createdAt = new Date(now - i * 60_000).toISOString();
    const updatedAt = new Date(now - i * 30_000).toISOString();
    const deadlineAt = new Date(now + (i % 50) * 60_000).toISOString();

    return {
      id: `T-${i + 1}`,
      title: `Ticket ${i + 1}`,
      description: `This is ticket ${i + 1}`,
      status: statuses[i % statuses.length],
      priority: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      assigneeId: i % 3 === 0 ? 'agent-1' : undefined,
      deadlineAt,
      createdAt,
      updatedAt,
      version: 1,
      failReason: i % statuses.length === 3 ? 'DEADLINE_EXCEEDED' : undefined,
    };
  });
}
