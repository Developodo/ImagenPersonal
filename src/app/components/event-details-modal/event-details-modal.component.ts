import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-event-details-modal',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,DatePipe,JsonPipe],
  templateUrl: './event-details-modal.component.html',
  styleUrl: './event-details-modal.component.css'
})
export class EventDetailsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EventDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  deleteEvent(): void {
    this.dialogRef.close({ delete: true });
  }
}
