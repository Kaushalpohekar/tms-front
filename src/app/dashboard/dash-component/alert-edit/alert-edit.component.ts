import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alert-edit',
  templateUrl: './alert-edit.component.html',
  styleUrls: ['./alert-edit.component.css']
})
export class AlertEditComponent {
  device: any;
  errorMessage = '';
  DeviceName = new FormControl('', [Validators.required]);
  DeviceUID = new FormControl('', [Validators.required]);
  TriggerValue = new FormControl('', [Validators.required]);
  PersonalEmail = new FormControl('', [Validators.required]);
  ContactNO = new FormControl('', [Validators.required]);
  interval = new FormControl('', [Validators.required]);

  @HostListener('window:resize')
  onWindowResize() {
    this.adjustDialogWidth();
  }

  private adjustDialogWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      this.dialogRef.updateSize('90%', '');
    } else if (screenWidth <= 960) {
      this.dialogRef.updateSize('70%', '');
    } else {
      this.dialogRef.updateSize('400px', '');
    }
  }

  constructor(
    private DashDataService: DashDataService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AlertEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.device = data;
  }

  ngOnInit() {
    this.adjustDialogWidth();
    this.DeviceName.setValue(this.device.DeviceName);
      this.DeviceUID.setValue(this.device.DeviceUID);
      this.TriggerValue.setValue(this.device.TriggerValue);
      this.PersonalEmail.setValue(this.device.PersonalEmail);
      this.ContactNO.setValue(this.device.ContactNO);
      this.interval.setValue(this.device.interval);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick() {
    if (
      this.DeviceName.valid &&
      this.DeviceUID.valid &&
      this.TriggerValue.valid &&
      this.PersonalEmail.valid &&
      this.ContactNO.valid
    ) {
      const DeviceUID = this.DeviceUID.value!;

      const TriggerData = {
        DeviceName: this.DeviceName.value,
        TriggerValue: this.TriggerValue.value,
        interval: this.interval.value,
        PersonalEmail: this.PersonalEmail.value,
        ContactNO: this.ContactNO.value
      };

      console.log(TriggerData);

      this.DashDataService.updateTrigger(DeviceUID, TriggerData).subscribe(
        () => {
          this.snackBar.open('User added Successfully!', 'Dismiss', {
            duration: 2000
          });
          this.dialogRef.close();
        },
        (error) => {
          this.snackBar.open(
            error.errorMessage || 'Failed to add user, Please try Again!',
            'Dismiss',
            { duration: 2000 }
          );
        }
      );
    }
  }
}
