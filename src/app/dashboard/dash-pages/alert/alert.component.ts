import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertEditComponent } from '../../dash-component/alert-edit/alert-edit.component';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

export interface TriggerData {
  dname: string;
  DeviceUID: string;
  threshold: any;
  umail: string;
  contact: number;
  interval: string;
  whatsapp: boolean;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  displayedColumns: string[] = ['Device Name', 'Device UID', 'Threshold', 'CompanyEmail', 'Contact No', 'WhatsApp', 'Mail', 'Action'];
  dataSource: TriggerData[] = [];

  constructor(public dialog: MatDialog, private DashDataService: DashDataService) {}

  ngOnInit() {
    this.getdata();
  }

  getdata() {
    const CompanyEmail = sessionStorage.getItem('CompanyEmail') ?? '';
    this.DashDataService.getTriggersData(CompanyEmail).subscribe(
      (response: any) => {
        this.dataSource = response;
      },
      (error) => {
      }
    );
  }

  onCheckboxWhatsAppClick(element: any){
    let newWhatsappValue;
    const DeviceUID = element.DeviceUID;

    if (element.Whatsapp === '0') {
      newWhatsappValue = 1;
    } else {
      newWhatsappValue = 0;
    }

    const WhatsApp = {
      Whatsapp : newWhatsappValue
    }
    this.DashDataService.UpdateWhatsapp(DeviceUID, WhatsApp).subscribe(
      (response) => {
        this.getdata();
      },
      (error) => {
        console.error('Error updating WhatsApp setting:', error);
      }
    );
  }

  onCheckboxMailClick(element: any){
    let newMailValue;
    const DeviceUID = element.DeviceUID;

    if (element.Mail === '0') {
      newMailValue = 1;
    } else {
      newMailValue = 0;
    }

    const Mail = {
      Mail : newMailValue
    }
    this.DashDataService.UpdateMail(DeviceUID, Mail).subscribe(
      (response) => {
        this.getdata();
      },
      (error) => {
        console.error('Error updating Mail setting:', error);
      }
    );
  }

  openeditDialog(device: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = device;
    const dialogRef = this.dialog.open(AlertEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(userAdded => {
      this.getdata();
    });
  }

  deleteTrigger(element: any) {
    const deviceid = element.DeviceUID;
      
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked 'Yes' in the confirmation dialog
        this.DashDataService.deleteTrigger(deviceid).subscribe(
          () => {
            // User deleted successfully
            Swal.fire({
              title: "Deleted!",
              text: "Device Trigger has been deleted.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true
            });

            // Remove the deleted user from the local data source
            const index = this.dataSource.indexOf(element);
            if (index !== -1) {
              this.dataSource.splice(index, 1);
            }

            // Update the MatTableDataSource
            this.dataSource = [...this.dataSource];
          },
          (error) => {
            // Error deleting user
            console.error('Error deleting user:', error);
            Swal.fire({
              title: "Error",
              text: "Error deleting user",
              icon: "error",
              timer: 2000,
              timerProgressBar: true
            });
          }
        );
      }
    });
  }
}