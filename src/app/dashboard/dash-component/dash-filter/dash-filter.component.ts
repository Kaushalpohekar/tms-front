import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common'; 


@Component({
  selector: 'app-filter',
  templateUrl: './dash-filter.component.html',
  styleUrls: ['./dash-filter.component.css']
})
export class DashFilterComponent {

  selectedSortOptionFormControl!: FormControl;
  
  constructor(
    private DashDataService: DashDataService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DashFilterComponent>,
    private datePipe: DatePipe
  ) {
  
  }

  ngOnInit(): void {
    // Retrieve the selected sorting option from session storage
    const savedSortOption = sessionStorage.getItem('selectedSortOption');

    // Check if savedSortOption is not set
    if (!savedSortOption) {
        // Default to 'DeviceName Z-A'
        this.selectedSortOptionFormControl = new FormControl('DeviceName A-Z', Validators.required);
    } else {
        // Use the retrieved value
        this.selectedSortOptionFormControl = new FormControl(savedSortOption, Validators.required);
    }
}


  onNoClick() {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.selectedSortOptionFormControl.valid) {
      // Save the selected sorting option to session storage
      sessionStorage.setItem('selectedSortOption', this.selectedSortOptionFormControl.value);
      this.dialogRef.close();
    }

  }
}