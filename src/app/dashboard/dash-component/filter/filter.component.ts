import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {

  CompanyEmail!: string | null;
  selectedDevice = new FormControl('', [Validators.required]);
  selectedDeviceInterval!: string;
  deviceOptions: any[] = [];
  selectedRadioButton!: string;
  currentDate: Date = new Date();
  startDate!: Date;
  endDate: Date = this.currentDate;
  start_date = new FormControl('', [Validators.required]);
  end_date = new FormControl('', [Validators.required]);
  CompanyId!: string | null;
  deviceUID!:string;
  deviceType!:string;
  deviceName!:string;
  deviceInterval!:string;
  

  @HostListener('window:resize')
  onWindowResize() {
    this.adjustDialogWidth();
  }

  constructor(
    private DashDataService: DashDataService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.deviceUID = this.DashDataService.getDeviceId() || '';
    this.deviceName = this.DashDataService.getDeviceName() || '';
    this.deviceInterval = this.DashDataService.getInterval() || '';
    if(this.deviceUID && this.deviceName && this.deviceInterval){
      if(this.deviceInterval === "Custom"){
        this.selectedRadioButton = 'Custom';
      } else{
        this.selectedRadioButton = 'Last';
        this.selectedDeviceInterval = this.deviceInterval;
      }
    }
    this.adjustDialogWidth();
    this.getUserDevices();
  }

  open(device: any){
    this.deviceUID = device.DeviceUID;
    this.deviceType = device.DeviceType;
    this.deviceName = device.DeviceName;
  }

  updateStartDate(event: any): void {
    const selectedStartDate = event.value;
    this.startDate = selectedStartDate;
  }

  updateEndDate(event: any): void {
    const selectedEndDate = event.value;
    if (!this.startDate || selectedEndDate >= this.startDate) {
      this.endDate = selectedEndDate;
    } else {
      this.endDate = this.currentDate;
      console.error('End date must be greater than or equal to the start date');
    }
  }

  downloadPDF() {
    const backendResponse = sessionStorage.getItem('data');
    if (backendResponse !== null) {
      const parsedData = JSON.parse(backendResponse);
      const dataArray = parsedData.data;
      const jsPDF = require('jspdf');
      const columns = Object.keys(dataArray[0]);
      const rows = dataArray.map((item: Record<string, string | number>) => Object.values(item));
    
      const doc = new jsPDF.default();
    
      doc.autoTable({
        head: [columns],
        body: rows,
      });
    
      doc.save('report_data.pdf');
    } else {
      this.snackBar.open('No data found!', 'Dismiss', {
        duration: 2000
      });
    }
  }

  adjustDialogWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      this.dialogRef.updateSize('90%', '');
    } else if (screenWidth <= 960) {
      this.dialogRef.updateSize('70%', '');
    } else {
      this.dialogRef.updateSize('400px', '');
    }
  }

  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.DashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.deviceOptions = devices.devices;
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if(this.selectedRadioButton==='Custom'){
      if(this.start_date.valid && this.end_date.valid){
        this.DashDataService.setDeviceId(this.deviceUID);
        this.DashDataService.setDeviceName(this.deviceName);
        this.DashDataService.setInterval('Custom');
        this.DashDataService.setDeviceType(this.deviceType);
        const start = this.datePipe.transform(this.start_date.value, 'yyyy-M-d')!;
        this.DashDataService.setStartDate(start);
        const end = this.datePipe.transform(this.end_date.value, 'yyyy-M-d')!;
        this.DashDataService.setEndDate(end);
        this.dialogRef.close();
      }
      else{
        this.snackBar.open('Please Select appropriate values!', 'Dismiss', {
          duration: 2000
        });
      }      
    }
    else if(this.selectedRadioButton==='Last'){
      this.DashDataService.setDeviceId(this.deviceUID);
      this.DashDataService.setDeviceName(this.deviceName);
      this.DashDataService.setInterval(this.selectedDeviceInterval);
      this.DashDataService.setDeviceType(this.deviceType);
      this.DashDataService.setStartDate('');
      this.DashDataService.setEndDate('');
      this.dialogRef.close();
    } 
  }    
}
