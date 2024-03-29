import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-trigger-device',
  templateUrl: './trigger-device.component.html',
  styleUrls: ['./trigger-device.component.css']
})
export class TriggerDeviceComponent {
  device: any = {};
  deviceName!: string;
  deviceId!: string;
  // CompanyEmail!:string | null;
  TriggerValue = new FormControl('', [Validators.required, Validators.pattern(/^\d*\.?\d+$/), Validators.min(0), Validators.max(200)]);
  // EmailValue = new FormControl('', [Validators.required, Validators.email]);
  PersonalEmail = new FormControl('', [Validators.required]);
  DeviceName = new FormControl('', [Validators.required]);
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
    private authService: AuthService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TriggerDeviceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    this.device = data.device;
  }

  ngOnInit() {
    this.adjustDialogWidth();
    this.getDeviceTrigger();
  }

  // getDeviceTrigger(){
  //   this.DashDataService.deviceTrigger(this.device.DeviceUID).subscribe(
  //     (response: any) => {
  //       this.device = response;
  //       // console.log(this.device);
  //       this.TriggerValue.setValue(this.device[0].TriggerValue);
  //       this.PersonalEmail.setValue(this.device[0].PersonalEmail);
  //       this.ContactNO.setValue(this.device[0].ContactNO);
  //       this.interval.setValue(this.device[0].interval);
  //       this.deviceName = this.device[0].DeviceName;
  //     },
  //     () => {
  //       console.log('Error fetching employee data.');
  //     }
  //   );
  // }


  getDeviceTrigger() {
  this.DashDataService.deviceTrigger(this.device.DeviceUID).subscribe(
    (response: any[]) => {
      response.forEach((device) => {
        // Handle each device here
        console.log(device);
        this.TriggerValue.setValue(device.TriggerValue);
        this.PersonalEmail.setValue(device.PersonalEmail);
        this.ContactNO.setValue(device.ContactNO);
        this.interval.setValue(device.interval);
        this.deviceName = device.DeviceName;
      });
    },
    () => {
      console.log('Error fetching device data.');
    }
  ); 
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // onSaveClick() {
  //   this.deviceId = this.device.DeviceUID;
  //   this.PersonalEmail = this.authService.getPersonalEmail();
  //   if(this.TriggerValue.valid &&
  //     this.PersonalEmail.valid && this.ContactNO.valid){
  //     const triggerData = {
  //       TriggerValue : this.TriggerValue.value,
  //       interval: this.interval.value,
  //       PersonalEmail: this.PersonalEmail.value,
  //       ContactNO: this.ContactNO.value
  //     }
  //     console.log(triggerData);

  //     this.DashDataService.updateDeviceTrigger(this.deviceId, triggerData).subscribe(
  //     () => {
  //       this.snackBar.open('Trigger Updated successfully!', 'Dismiss', {
  //           duration: 2000
  //       });
  //       this.dialogRef.close();
  //     },
  //     (error)=>{
  //       this.snackBar.open('Failed to update trigger!', 'Dismiss', {
  //           duration: 2000
  //         });
  //     });
  //   }
  // }

  onSaveClick() {
    const triggerData = {
      DeviceName: this.DeviceName.value,
      TriggerValue: this.TriggerValue.value,
      interval: this.interval.value,
      PersonalEmail: this.PersonalEmail.value,
      ContactNO: this.ContactNO.value
    };

    this.DashDataService.updateTrigger(this.device.DeviceUID, triggerData).subscribe(
      () => {
        this.snackBar.open('Trigger Updated successfully!', 'Dismiss', {
          duration: 2000
        });
        this.dialogRef.close();
      },
      (error) => {
        this.snackBar.open('Failed to update trigger!', 'Dismiss', {
          duration: 2000
        });
      }
    );
  }

  getThresholdErrorMessage() {
    if (this.TriggerValue.hasError('required')) {
      return 'Threshold is required';
    }
    
    if (this.TriggerValue.hasError('pattern')) {
      return 'Not a valid number';
    }
    
    if (this.TriggerValue.hasError('min')) {
      return 'Not less than 0';
    }
    
    if (this.TriggerValue.hasError('max')) {
      return 'Not more than 200';
    }
    
    return '';
  }

  // getEmailErrorMessage(){
  //   if (this.EmailValue.hasError('required')) {
  //     return 'Email is required';
  //   }
    
  //   if (this.EmailValue.hasError('email')) {
  //     return 'Not a valid email';
  //   }
    
  //   return '';
  // }

  getNumberErrorMessage(){
    if (this.ContactNO.hasError('required')) {
      return 'Number is required';
    }
    
    if (this.ContactNO.hasError('pattern')) {
      return 'Not a valid number';
    }
    
    return '';
  }
}
