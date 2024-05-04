import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddUserComponent } from '../../dash-component/add-user/add-user.component';
import { AddDeviceComponent } from '../../dash-component/add-device/add-device.component';
import { EditDeviceFromSettingComponent } from '../../dash-component/edit-device-from-setting/edit-device-from-setting.component';
import { EditUserComponent } from '../../dash-component/edit-user/edit-user.component';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DashService } from '../../dash.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css']
})
export class UserManageComponent implements OnInit, OnDestroy {
  CompanyEmail!: string | null;
  displayedColumns: string[] = ['Name', 'Contact', 'Designation', 'Status', 'Actions'];
  displayedColumns2: string[] = ['DeviceName', 'Location', 'IssueDate', 'Status', 'DeviceType', 'Actions2'];
  dataSource: UserData[] = [];
  dataSource2: DeviceData[] = [];
  totalUsers: number = 0;
  totalOnlineUsers: number = 0;
  totalOfflineUsers: number = 0;
  totalDevices: number = 0;
  totalActiveDevices: number = 0;
  totalInactiveDevices: number = 0;
  intervalSubscription: Subscription | undefined;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private dashDataService: DashDataService,
    private datePipe: DatePipe,
    public dashService: DashService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchData();
    this.startInterval();
    this.dashService.isPageLoading(true);
  }

  ngOnDestroy() {
    this.stopInterval();
  }

  startInterval() {
    this.intervalSubscription = interval(5000)
      .pipe(take(Infinity))
      .subscribe(() => {
        this.fetchData();
      });
  }

  stopInterval() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  fetchData() {
    this.fetchUsers();
    this.fetchDevices();
  }

  fetchUsers() {
    this.CompanyEmail = sessionStorage.getItem('CompanyEmail');
    if (this.CompanyEmail) {
      this.dashDataService.companyUsers(this.CompanyEmail).subscribe(
        (users) => {
          // Log the data received from the API
          this.dataSource = users.map((user: UserData) => {
            user.status = user.is_online === 1 ? 'Online' : 'Offline';
            return user;
          });

          this.totalUsers = users.length;
          this.totalOnlineUsers = this.dataSource.filter(user => user.is_online === 1).length;
          this.totalOfflineUsers = this.dataSource.filter(user => user.is_online === 0).length;
          this.dashService.isPageLoading(false);
        },
        (error) => {
          // Handle error
          console.error('Error fetching users:', error);
        }
      );
    }
  }

  fetchDevices() {
    if (this.CompanyEmail) {
      this.dashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.dataSource2 = devices.devices.map((device: DeviceData) => {
            device.formattedIssueDate = this.datePipe.transform(device.IssueDate, 'yyyy-MM-dd HH:mm:ss');
            return device;
          });

          this.dataSource2 = devices.devices.map((device: DeviceData) => {
            if (device.status === "online" || device.status === "heating") {
              device.Status = 'Online';
            } else {
              device.Status = 'Offline';
            }
            return device;
          });

          this.totalDevices = this.dataSource2.length;
          this.totalActiveDevices = this.dataSource2.filter(devices => devices.status === "online" || devices.status === "heating").length;
          this.totalInactiveDevices = this.dataSource2.filter(devices => devices.status === "offline" ).length;
          this.dashService.isPageLoading(false);
        },
        (error) => {
          console.log('Error while fetching user devices!');
        }
      );
    }
  }

  openAddUserDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    const dialogRef = this.dialog.open(AddUserComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(userAdded => {});
  }

  openAddDeviceDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    const dialogRef = this.dialog.open(AddDeviceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(deviceAdded => {});
  }

  editUser(userData:any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = {
      data: userData
    };
    const dialogRef = this.dialog.open(EditUserComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(userUpdate => {});
  }

  // Function to delete a user
  editDevice(device: DeviceData): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = { device };
    const dialogRef = this.dialog.open(EditDeviceFromSettingComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(updatedDevice => {});
  }

  deleteDevice(device: DeviceData) {
    const deviceid = device.DeviceUID;
  
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
        this.dashDataService.deleteDevice(deviceid).subscribe(
          () => {
            // User deleted successfully
            Swal.fire({
              title: "Deleted!",
              text: "Device has been deleted.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true
            });
  
            // Remove the deleted user from the local data source
            const index = this.dataSource2.indexOf(device);
            if (index !== -1) {
              this.dataSource2.splice(index, 1);
            }
  
            // Update the MatTableDataSource
            this.dataSource2 = [...this.dataSource2];
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

  deleteUser(user: UserData) {
    const userId = user.UserId;
  
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
        this.dashDataService.deleteUser(userId).subscribe(
          () => {
            // User deleted successfully
            Swal.fire({
              title: "Deleted!",
              text: "User has been deleted.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true
            });
  
            // Remove the deleted user from the local data source
            const index = this.dataSource.indexOf(user);
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

export interface UserData {
  FirstName: string;
  LastName: string;
  ContactNo: string;
  PersonalEmail: string;
  Designation: string;
  UserType: string;
  is_online: number;
  status: string;
  UserId: any; // Corrected property name to "UserId"
}

export interface DeviceData {
  DeviceUID: string;
  DeviceLocation: string;
  DeviceName: string;
  IssueDate: string;
  is_active: number;
  Status: string;
  formattedIssueDate: string | null;
  status: String;
}
