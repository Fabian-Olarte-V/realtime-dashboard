import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QueueFilters, QueueItem } from '../../../../core/models/queue';
import { QueueToolbar } from '../../components/queue-toolbar/queue-toolbar';
import { TicketDetail } from '../../components/ticket-detail/ticket-detail';
import { TicketList } from '../../components/ticket-list/ticket-list';

@Component({
  selector: 'app-queue-page',
  standalone: true,
  imports: [TicketDetail, TicketList, QueueToolbar],
  templateUrl: './queue-page.html',
  styleUrl: './queue-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueuePage {
  filters: QueueFilters = { searchText: '', status: 'ALL', sort: 'updatedAt_desc' };
  selectedId: string | null = null;

  items: readonly QueueItem[] = makeMockTickets(50);

  get selectedItem(): QueueItem | null {
    return this.items.find((x) => x.id === this.selectedId) ?? null;
  }

  onFiltersChange(next: QueueFilters): void {
    this.filters = next;
  }

  onSelectItem(id: string): void {
    this.selectedId = id;
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
