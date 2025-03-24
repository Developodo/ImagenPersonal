import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-confirmdeletedialog',
  standalone: true,
  imports: [MatDialogModule,MatButton],
  templateUrl: './confirmdeletedialog.component.html',
  styleUrl: './confirmdeletedialog.component.css'
})
export class ConfirmdeletedialogComponent {

}
