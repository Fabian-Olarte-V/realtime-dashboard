import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QueueItem } from '../../../../core/models/queue';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-detail',
  imports: [CommonModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  @Input() item: QueueItem | null = null;

  @Output() assignToMe = new EventEmitter<void>();
  @Output() complete = new EventEmitter<void>();
}
