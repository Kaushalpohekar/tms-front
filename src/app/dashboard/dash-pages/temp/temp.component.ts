import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditDeviceComponent } from '../../dash-component/edit-device/edit-device.component';
import { TriggerDeviceComponent } from '../../dash-component/trigger-device/trigger-device.component';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import{ DashService } from '../../dash.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashFilterComponent } from '../../dash-component/dash-filter/dash-filter.component';

@Component({
  selector: 'app-temp',
  templateUrl: './temp.component.html',
  styleUrls: ['./temp.component.css']
})
export class TempComponent implements OnInit {
  private destroy$ = new Subject<void>();


  userDevices: any[] = [];
  CompanyEmail!: string | null; 
  deviceData: any[] = [];
  userDevicesTrigger: any[] = [];
  consumptionData: any[] = [];

  constructor(
    public dialog: MatDialog,
    private dashDataService: DashDataService,
    private authService: AuthService,
    public dashService: DashService,
    public snackBar: MatSnackBar,
  ) {
  }



  ngOnInit() {
    this.getUserDevices();
    this.getUserDevicesTrigger();
    this.CombinedConsumption();
    this.dashService.isPageLoading(true);
  }

  ngOnDestroy() {
    // Complete the subject to signal the subscription to unsubscribe
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserType(): string | null {
    return this.authService.getUserType();
  }

  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.dashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.userDevices = devices.devices;
          let sortOption = sessionStorage.getItem('selectedSortOption');
          if (!sortOption) {
            sortOption = 'DeviceName A-Z';
          }

          if (sortOption === 'DeviceName A-Z') {
            this.userDevices.sort((a, b) => a.DeviceName.localeCompare(b.DeviceName));
          } else if (sortOption === 'DeviceName Z-A') {
            this.userDevices.sort((b, a) => a.DeviceName.localeCompare(b.DeviceName));
          } else if (sortOption === 'DeviceUID A-Z') {
            this.userDevices.sort((a, b) => a.DeviceUID.localeCompare(b.DeviceUID));
          } else if (sortOption === 'DeviceUID Z-A') {
            this.userDevices.sort((b, a) => a.DeviceUID.localeCompare(b.DeviceUID));
          } else if (sortOption === 'DeviceStatus offline') {
            // this.userDevices.sort((a, b) => a.status.localeCompare(b.status));
            this.userDevices.sort((a, b) => {
              // Compare by status
              if (a.status === 'offline' && b.status !== 'offline') {
                return -1; // Put 'offline' status first
              } else if (a.status !== 'offline' && b.status === 'offline') {
                return 1; // Put 'offline' status first
              } else {
                // If statuses are the same or both not 'offline', sort by DeviceName
                return a.DeviceName.localeCompare(b.DeviceName);
              }
            });
          }

          this.getDeviceData();
          interval(60 * 1000).pipe(
            takeUntil(this.destroy$)
          ).subscribe(() => {
            this.getDeviceData();
            this.CombinedConsumption();
          });
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    }
  }


  getUserDevicesTrigger() {
    this.CompanyEmail = this.authService.getCompanyEmail();
     if (this.CompanyEmail) {
      this.dashDataService.fetchTriggerAll(this.CompanyEmail).subscribe(
        (triggers: any) => {
          this.userDevicesTrigger = triggers.triggers;
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    } 
  }

  openEditDeviceDialog(device: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = { device };
    const dialogRef = this.dialog.open(EditDeviceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(updatedDevice => {});
  }

  openTriggerDeviceDialog(device: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = { device };
    const dialogRef = this.dialog.open(TriggerDeviceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(updatedDevice => {
      this.getUserDevicesTrigger();
    });
  }

  getDeviceData(){
    if(this.CompanyEmail){
      this.dashDataService.getDeviceData(this.CompanyEmail).subscribe(
        (deviceData) =>{
          const transformedData = this.transformData(deviceData);
          // Map deviceData to userDevices based on DeviceUID index
          this.deviceData = this.userDevices.map(userDevice => {
            const foundData = transformedData.find(data => data.DeviceUID === userDevice.DeviceUID);
            return foundData || null; // Return null if no matching data found
          });
          this.dashService.isPageLoading(false);
        },
        (error) =>{
        }
      );
    }
  }


  transformData(data: any): any[] {
    const transformedData: any[] = [];

    data.latestEntry.forEach((deviceEntry: any) => {
      const deviceUID = Object.keys(deviceEntry)[0];
      const entryData = deviceEntry[deviceUID]?.entry?.[0];

      if (entryData) {
        const timestampUTC = new Date(entryData.TimeStamp);
        const timestampIST = new Date(timestampUTC.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.30 hours

        const transformedEntry: any = {
          DeviceUID: deviceUID,
          Temperature: entryData.Temperature ? parseFloat(entryData.Temperature) : undefined,
          Humidity: entryData.Humidity ? parseFloat(entryData.Humidity) : undefined,
          TemperatureR: entryData.TemperatureR ? parseFloat(entryData.TemperatureR) : undefined,
          TemperatureY: entryData.TemperatureY ? parseFloat(entryData.TemperatureY) : undefined,
          TemperatureB: entryData.TemperatureB ? parseFloat(entryData.TemperatureB) : undefined,
          flowRate: entryData.flowRate ? parseInt(entryData.flowRate) : undefined,
          Pressure: entryData.Pressure ? parseFloat(entryData.Pressure) : undefined,
          totalVolume: entryData.totalVolume ? parseFloat(entryData.totalVolume) : undefined,
          Timestamp: timestampIST.toISOString() // Convert back to ISO string
        };

        transformedData.push(transformedEntry);
      } else {
        console.error(`Entry data not found for device UID: ${deviceUID}`);
      }
    });

    return transformedData;
  }



  getIndex(deviceUid: string): number {
    return this.userDevices.findIndex(device => device.DeviceUID === deviceUid);
  }

  isDeviceConnected(deviceUid: string): boolean {
    const deviceData = this.deviceData[this.getIndex(deviceUid)];
    if (deviceData) {
      const timestamp = new Date(deviceData.Timestamp);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - timestamp.getTime();
      const minutesDifference = Math.floor(timeDifference / 1000 / 60); // Convert milliseconds to minutes

      // Check if the data is within the last 5 minutes (300 seconds)
      return minutesDifference <= 30;
    }
    return false; // Device data not available, consider it disconnected
  }


  isDeviceHeated(deviceUid: string): boolean {
    const deviceIndex = this.getIndex(deviceUid);
    const deviceTrigger = this.deviceData[deviceIndex];

    if (deviceTrigger) {
      const trigger = this.userDevicesTrigger.find(trigger => trigger.DeviceUID === deviceUid);

      if (trigger) {
        let temperature; // Variable to hold the temperature value

        // Check if individual temperature parameters (R, Y, B) are available
        if ('TemperatureR' in deviceTrigger && 'TemperatureY' in deviceTrigger && 'TemperatureB' in deviceTrigger) {
          if (deviceTrigger.TemperatureR === null || deviceTrigger.TemperatureY === null || deviceTrigger.TemperatureB === null || deviceTrigger.TemperatureR === undefined || deviceTrigger.TemperatureY === undefined || deviceTrigger.TemperatureB === undefined)
            {
              temperature = deviceTrigger.Temperature;
          } else {
              temperature = {
                  R: deviceTrigger.TemperatureR,
                  Y: deviceTrigger.TemperatureY,
                  B: deviceTrigger.TemperatureB,
              };
          }
      }

        // Ensure that temperature data is available
        if (temperature !== undefined) {
          const triggerValue = trigger.TriggerValue;

          // Check the temperature and compare with the trigger value
          if (typeof temperature === 'number' && temperature > triggerValue) {
            return true; // Device is heated
          } else if (typeof temperature === 'object') {
            // Check individual temperature parameters
            if (temperature.R > triggerValue || temperature.Y > triggerValue || temperature.B > triggerValue) {
              return true; // Device is heated
            }
          }
        }
      }
    }

    return false; // Device or trigger not found, or missing temperature value
  }

  getIndexConsumption(deviceUid: string): number {
    return this.consumptionData.findIndex(device => device.DeviceUID === deviceUid);
  }

  CombinedConsumption() {
    if (this.CompanyEmail) {
      this.dashDataService.getTodayConsumption(this.CompanyEmail)
        .toPromise() 
        .then((todayData: any[]) => {
          this.consumptionData = [];

          // Create an array of promises for fetching monthly consumption data
          const monthlyPromises = todayData.map((dailyConsumptionData, index) => {
            const deviceInfo = Object.keys(dailyConsumptionData)[0];

            if (dailyConsumptionData && dailyConsumptionData[deviceInfo] && dailyConsumptionData[deviceInfo][0]) {
              const today = dailyConsumptionData[deviceInfo][0].today;
              const yesterday = dailyConsumptionData[deviceInfo][0].yesterday;

              // Calculate daily percentage change
              let dailyPercentageChange: number;
              if (yesterday !== 0) {
                dailyPercentageChange = ((today - yesterday) / yesterday) * 100;
              } else {
                dailyPercentageChange = 100;
              }

              // Fetch monthly consumption data for the same device only if CompanyEmail is not null
              if (this.CompanyEmail) {
                return this.dashDataService.getMonthConsumption(this.CompanyEmail)
                  .toPromise()
                  .then((monthData: any[]) => {
                    if (monthData && monthData[index] && monthData[index][deviceInfo] && monthData[index][deviceInfo][0]) {
                      const monthlyConsumptionData = monthData[index][deviceInfo][0];
                      const thisMonth = monthlyConsumptionData.thisMonth;
                      const lastMonth = monthlyConsumptionData.lastMonth;

                      // Calculate monthly percentage change
                      let monthlyPercentageChange: number;
                      if (lastMonth !== 0) {
                        monthlyPercentageChange = ((thisMonth - lastMonth) / lastMonth) * 100;
                      } else {
                        monthlyPercentageChange = 100;
                      }

                      // Create an object with combined information
                      const deviceInfoObject = {
                        DeviceUID: deviceInfo,
                        todayConsumption: today,
                        yesterdayConsumption: yesterday,
                        dailyPercentageChange: dailyPercentageChange,
                        thisMonthConsumption: (thisMonth),
                        lastMonthConsumption: (lastMonth),
                        monthlyPercentageChange: monthlyPercentageChange
                      };

                      // Push the device object to the array
                      this.consumptionData.push(deviceInfoObject);
                    } else {
                      console.log("Monthly consumption data structure is unexpected.");
                    }
                  })
                  .catch((monthError) => {
                    console.log(monthError);
                  });
              } else {
                // Handle the case where CompanyEmail is null
                return Promise.resolve();
              }
            } else {
              return Promise.resolve();
            }
          });

          // Use Promise.all() to wait for all monthly promises to resolve
          return Promise.all(monthlyPromises);
        })
        .then(() => {
          // All monthly promises have resolved, and data has been collected for all devices
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  }

  getAbsPercentageChange(percentageChange: number | undefined): { value: number | undefined, arrow: string } {
    const absValue = percentageChange ? Math.floor(Math.abs(percentageChange)) : undefined;
    const arrow = percentageChange && percentageChange >= 0 ? '▲' : '▼';
    return { value: absValue, arrow: arrow };
  }
  
  openDashFilterDailog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';

    const dialogRef = this.dialog.open(DashFilterComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      this.getUserDevices();
      this.dashService.isPageLoading(true);
    });
  }
}
