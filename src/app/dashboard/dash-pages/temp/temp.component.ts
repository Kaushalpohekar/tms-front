import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditDeviceComponent } from '../../dash-component/edit-device/edit-device.component';
import { TriggerDeviceComponent } from '../../dash-component/trigger-device/trigger-device.component';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage, MqttConnectionState  } from 'ngx-mqtt';
import{ DashService } from '../../dash.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-temp',
  templateUrl: './temp.component.html',
  styleUrls: ['./temp.component.css']
})
export class TempComponent implements OnInit, OnDestroy {
  userDevices: any[] = [];
  CompanyEmail!: string | null; 
  mqttSubscriptions: Subscription[] = [];
  deviceData: any[] = [];
  userDevicesTrigger: any[] = [];
  consumptionData: any[] = [];
  fname!: string;
  lname!: string;

  constructor(
    public dialog: MatDialog,
    private dashDataService: DashDataService,
    private authService: AuthService,
    private mqttService: MqttService,
    public dashService: DashService,
    public snackBar: MatSnackBar,
  ) {
    const connectionSubscription: Subscription = this.mqttService.state.subscribe((state: MqttConnectionState) => {
    if (state === MqttConnectionState.CONNECTED) {
      // // Connection has been established
      // console.log('MQTT Connection Established!');
    }
  });
  }



  ngOnInit() {
    this.getUserDevices();
    this.getUserDevicesTrigger();
    setTimeout(() => {
        this.CombinedConsumption();
    }, 100);
    this.dashService.isPageLoading(true);
  }

  ngOnDestroy() {
    this.unsubscribeFromTopics();
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
          this.subscribeToTopics();
          this.dashService.isPageLoading(false);
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

  subscribeToTopics() {
    this.deviceData = [];
    this.userDevices.forEach(device => {
      const topic = `Sense/Live/${device.DeviceUID}`;
      const subscription = this.mqttService.observe(topic).subscribe((message: IMqttMessage) => {
        const payload = message.payload.toString();
        const deviceData = JSON.parse(payload);


        deviceData.Timestamp = new Date();

        const index = this.userDevices.findIndex(d => d.DeviceUID === device.DeviceUID);
        if (index !== -1) {
          this.deviceData[index] = deviceData;
        }
      });

      this.mqttSubscriptions.push(subscription);
    });
  }

  unsubscribeFromTopics() {
    this.mqttSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.mqttSubscriptions = [];
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
      return minutesDifference <= 5;
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
          temperature = {
            R: deviceTrigger.TemperatureR,
            Y: deviceTrigger.TemperatureY,
            B: deviceTrigger.TemperatureB,
          };
        } else if ('Temperature' in deviceTrigger) {
          // Check if a single "Temperature" value is available
          temperature = deviceTrigger.Temperature;
        }

        // Ensure that temperature data is available
        if (temperature !== undefined) {
          const triggerValue = trigger.TriggerValue;

          // Check the temperature and compare with the trigger value
          if (typeof temperature === 'number' && temperature >triggerValue) {
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
                  thisMonthConsumption: (thisMonth / 1000).toFixed(0),
                  lastMonthConsumption: (lastMonth / 1000).toFixed(0),
                  monthlyPercentageChange: monthlyPercentageChange
                };

                // Push the device object to the array
                this.consumptionData.push(deviceInfoObject);
              })
              .catch((monthError) => {
                console.log(monthError);
              });
          } else {
            // Handle the case where CompanyEmail is null
            console.log("CompanyEmail is null.");
            return Promise.resolve();
          }
        });

        // Use Promise.all() to wait for all monthly promises to resolve
        return Promise.all(monthlyPromises);
      })
      .then(() => {
        // All monthly promises have resolved, and data has been collected for all devices
        console.log("All data fetched successfully:", this.consumptionData);
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
}