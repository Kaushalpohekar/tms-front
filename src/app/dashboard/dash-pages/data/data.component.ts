import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FilterComponent } from '../../dash-component/filter/filter.component';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
HighchartsMore(Highcharts);

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css'],
})
export class DataComponent implements OnInit{

  constructor(
    public dialog: MatDialog,
    private DashDataService: DashDataService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  deviceOptions: any[] = [];
  selectedDevice!: any;
  selectedDeviceInterval: any = '1hour';
  CompanyEmail!: string | null;
  temperatureData: any[] = [];
  temperatureRData: any[] = [];
  temperatureYData: any[] = [];
  temperatureBData: any[] = [];
  humidityData: any[] = [];
  flowRateData: any[] = [];
  timestampData: any[] = [];
  consumptionData: any[] = [];
  DeviceName!: any;
  DeviceStatus!: any;
  DeviceType!: any;
  DeviceLastUpdatedTime!: any;
  DeviceTrigger!: any;
  loading1 = true;
  selectedStartDate!: any;
  selectedEndDate!:any;
  DeviceTemperature!: any;
  DeviceTemperatureR!: any;
  DeviceTemperatureY!: any;
  DeviceTemperatureB!: any;
  DeviceHumidity!: any;
  DeviceFlowRate !: any;
  DeviceTodayConsumption!: any;
  // new constants

  deviceID!:string;
  deviceINTERVAL!:string;
  deviceSTART!:string;
  deviceEND!:string;

  ngOnInit() {
    this.retrievingValues();
  }

  getDisplayText(): string {
    switch (this.deviceINTERVAL) {
      case '1hour':
        return '1 Hour';
      case '12hour':
        return '12 Hours';
      case '1day':
        return '1 Day';
      case '7day':
        return '7 Days';
      case '30day':
        return '30 Days';
      default:
        return ''; // You can provide a default value or handle it as needed
    }
  }

  getFormattedDateRange(): string {
    const startDate = new Date(this.deviceSTART);
    const endDate = new Date(this.deviceEND);

    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endMonth = endDate.toLocaleString('default', { month: 'short' });

    return `${startMonth} ${startDate.getDate()}, ${startDate.getFullYear()} to ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }
  
  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.DashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.deviceOptions = devices.devices;

          if (this.deviceOptions.length > 0) {
            this.deviceID = this.deviceOptions[0].DeviceUID;
            this.DeviceType = this.deviceOptions[0].DeviceType;
            this.deviceINTERVAL = '1hour';
            this.DeviceName = this.deviceOptions[0].DeviceName;
            this.DashDataService.setDeviceId(this.deviceID);
            this.DashDataService.setDeviceType(this.DeviceType);
            this.DashDataService.setInterval(this.deviceINTERVAL);
            this.DashDataService.setDeviceName(this.DeviceName);

            setTimeout(() => {
              this.retrievingAllValues();
              this.fetchDeviceInfo(this.deviceID);
              this.router.navigate([this.router.url]);
            }, 100);
            
          }
        },
        (error) => {
          this.snackBar.open('Error while fetching data!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    }
  }

  retrievingValues(){
    this.loading1 = true;
    this.deviceID = this.DashDataService.getDeviceId() || '';
    this.DeviceType = this.DashDataService.getDeviceType() || '';
    this.deviceINTERVAL = this.DashDataService.getInterval() || '';
    this.deviceSTART = this.DashDataService.getStartDate() || '';
    this.deviceEND = this.DashDataService.getEndDate() || '';
    setTimeout(() => { 
      if(this.deviceID && this.DeviceType && this.deviceINTERVAL){
        this.retrievingAllValues();
      }  else{
        this.getUserDevices();
      }
    }, 100);
  }


  async retrievingAllValues() {
    try {
      let dataWSPromise, dataPromise;
      if (this.DeviceType === 'ws' || this.DeviceType === 'fs') {
        if (this.deviceINTERVAL === 'Custom') {
          dataWSPromise = this.DashDataService.getCustomConsumption(this.deviceID, this.deviceSTART, this.deviceEND).toPromise();
        } else {
          dataWSPromise = this.DashDataService.getIntervalConsumption(this.deviceID, this.deviceINTERVAL).toPromise();
        }

        dataPromise = this.deviceINTERVAL === 'Custom' ?
          this.DashDataService.DataByCustomDate(this.deviceID, this.deviceSTART, this.deviceEND).toPromise() :
          this.DashDataService.dataLast(this.deviceID, this.deviceINTERVAL).toPromise();
      } else if (this.DeviceType === 't' || this.DeviceType === 'th' || this.DeviceType === 'ryb') {
        dataPromise = this.deviceINTERVAL === 'Custom' ?
          this.DashDataService.DataByCustomDate(this.deviceID, this.deviceSTART, this.deviceEND).toPromise() :
          this.DashDataService.dataLast(this.deviceID, this.deviceINTERVAL).toPromise();
      }

      // Concurrently await all promises
      const [dataWS, data] = await Promise.all([dataWSPromise, dataPromise]);
      // Process the data and perform other actions
      this.processChartData(data);
      if (dataWS) {
        this.processChartDataWS(dataWS);
      }
      this.fetchDeviceInfo(this.deviceID);
      this.router.navigate([this.router.url]);

    } catch (error) {
      this.snackBar.open('Error while fetching data!', 'Dismiss', {
        duration: 2000
      });
    }
  }

  createDonutChart(dataStatus: any) {
    const donutChartData = dataStatus.map((entry: any) => {
      const formattedPercentage = parseFloat(entry.percentage.toFixed(2)); // Format to two decimal places
      let color;

      if (entry.status === 'online') {
        color = {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#78f5e6'], // Start color (light green)
            [1, '#43ab72'], // End color (darker green)
          ],
        };
      } else if (entry.status === 'heating') {
        color = {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#f0afad'], // Start color (light red)
            [1, 'rgba(255, 0, 0, 1)'], // End color (darker red)
          ],
        };
      } else {
        color = {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#E0E0E0'], // Start color (default light gray)
            [1, '#B1B1B1'], // End color (default darker gray)
          ],
        };
      }
      const time =
        entry.count >= 180
          ? (entry.count / 180).toFixed(2) + ' hrs'
          : (entry.count / 3).toFixed(2) + ' mins';

      return {
        name: entry.status,
        y: formattedPercentage,
        color: color,
        time: time,
      };
    });

    const options: Highcharts.Options = {
      chart: {
        type: 'pie',
      },
      title: {
        text: '   ',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          innerSize: '50%',
        },
      },
      tooltip: {
        pointFormat:
          '{series.name}: <b>{point.y}%</b> <br><b>({point.time})<b>',
      },
      series: [
        {
          type: 'pie',
          name: 'Time',
          data: donutChartData,
        },
      ],
    };

    Highcharts.chart('donutChart', options);
  }

  createChart() {
    Highcharts.chart('curvedLineChart', {
      chart: {
        type: 'spline',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false, // Disable the credits display
      },

      xAxis: {
        type: 'datetime',
        timezoneOffset: 330,
      },
      yAxis: {
        title: {
          text: 'Temperature',
        },
      },
      series: [
        {
          name: 'Temperature',
          color: {
            linearGradient: {
              x1: 0,
              x2: 0,
              y1: 0,
              y2: 1,
            },
            stops: [
              [0, 'rgba(255, 0, 0, 1)'], // Start color (red)
              [1, 'rgba(255, 255, 0, 0.3)'], // End color (yellow)
            ],
          },
          data: this.temperatureData,
          marker: {
            radius: 3, // Set the desired size of the points
          },
        },
      ] as any,
    } as Highcharts.Options);
  }

  createChart2() {
    Highcharts.chart('curvedLineChart2', {
      chart: {
        type: 'spline',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false, // Disable the credits display
      },

      xAxis: {
        type: 'datetime',
      },
      yAxis: {
        title: {
          text: 'Humidity',
        },
      },
      series: [
        {
          name: 'Humitidy',
          color: {
            linearGradient: {
              x1: 0,
              x2: 0,
              y1: 0,
              y2: 1,
            },
            stops: [
              [0, 'rgba(0, 0, 255, 1)'], // Start color (blue)
              [1, 'rgba(0, 255, 255, 0.3)'], // End color (cyan)
            ],
          },
          data: this.humidityData,
          marker: {
            radius: 3, // Set the desired size of the points
          },
        },
      ] as any,
    } as Highcharts.Options);
  }

  createChart3() {
    Highcharts.chart('curvedLineChart3', {
      chart: {
        type: 'spline',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false, // Disable the credits display
      },

      xAxis: {
        type: 'datetime',
        timezoneOffset: 330,
      },
      yAxis: {
        title: {
          text: 'Flow Rate',
        },
      },
      series: [
        {
          name: 'Flow Rate',
          color: {
            linearGradient: {
              x1: 0,
              x2: 0,
              y1: 0,
              y2: 1,
            },
            stops: [
              [0, 'rgba(0, 0, 255, 1)'], // Start color (blue)
              [1, 'rgba(0, 255, 255, 0.3)'], // End color (yellow)
            ],
          },
          data: this.flowRateData,
          marker: {
            radius: 3, // Set the desired size of the points
          },
        },
      ] as any,
    } as Highcharts.Options);
  }

  createTemperature() {
    Highcharts.chart('temperatureRYB', {
      chart: {
        type: 'spline',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: 'datetime',
        timezoneOffset: 330,
      },
      yAxis: {
        title: {
          text: 'Temperature RYB',
        },
        // min: 0,
        // max: 100,
      },
      series: [
        {
          name: 'Temperature R',
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(255, 0, 0, 1)'], // Start color (red)
              [1, 'rgba(255, 255, 0, 0.3)'], // End color (yellow)
            ],
          },
          data: this.temperatureRData,
          marker: {
            radius: 3, // Set the desired size of the points
          },
          lineWidth: 2, // Set the line width to triple
        },
        {
          name: 'Temperature B',
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(0, 0, 255, 1)'], // Start color (blue)
              [1, 'rgba(0, 255, 255, 0.3)'], // End color (cyan)
            ],
          },
          data: this.temperatureBData,
          marker: {
            radius: 3, // Set the desired size of the points
          },
          lineWidth: 2, // Set the line width to triple
        },
        {
          name: 'Temperature Y',
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(255, 255, 0, 0.3)'], // Start color (yellow)
              [1, 'rgba(255, 0, 0, 1)'], // End color (red)
            ],
          },
          data: this.temperatureYData,
          marker: {
            radius: 3, // Set the desired size of the points
          },
          lineWidth: 2, // Set the line width to triple
        },
      ] as any,
    } as Highcharts.Options);
  }

  createBarGraph() {
    Highcharts.chart('barChart', {
      chart: {
        type: 'column', // Specify the chart type as 'bar'
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false, // Disable the credits display
      },
      xAxis: {
        type: 'datetime',
        timezoneOffset: 330,
      },
      yAxis: {
        title: {
          text: 'Total Comsumption',
        },
      },
      series: [
        {
          name: 'Total Comsumption',
          color: {
            linearGradient: {
              x1: 0,
              x2: 0,
              y1: 0,
              y2: 1,
            },
            stops: [
              [0, 'rgba(0, 0, 255, 1)'], // Start color (blue)
              [1, 'rgba(0, 255, 255, 0.3)'], // End color (yellow)
            ],
          },
          data: this.consumptionData, // Specify the temperature values for each category
        },
      ] as any,
    } as Highcharts.Options);
  }

  openFilterDailog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';

    const dialogRef = this.dialog.open(FilterComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      this.retrievingValues();
    });
  }

  processChartData(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset: +5:30 in milliseconds

    const mapData = (entry: any, key: string) => [
      new Date(entry.bucket_start_time).getTime() + istOffset,
      key ? parseFloat(entry[key]) : entry[key],
    ];

    this.temperatureData = data.map((entry: any) => mapData(entry, 'Temperature'));
    this.humidityData = data.map((entry: any) => mapData(entry, 'Humidity'));
    this.temperatureRData = data.map((entry: any) => mapData(entry, 'TemperatureR'));
    this.temperatureYData = data.map((entry: any) => mapData(entry, 'TemperatureY'));
    this.temperatureBData = data.map((entry: any) => mapData(entry, 'TemperatureB'));
    this.timestampData = data.map((entry: any) => new Date(entry.bucket_start_time).getTime() + istOffset);
    this.flowRateData = data.map((entry: any) => mapData(entry, 'flowRate'));

    switch (this.DeviceType) {
      case 'th':
        this.createChart();
        this.createChart2();
        break;
      case 't':
        this.createChart();
        break;
      case 'ryb':
        this.createTemperature();
        break;
      case 'ws':
        this.createChart3();
        this.createBarGraph();
        break;
      default:
        this.snackBar.open('Device Type is not found!', 'Dismiss', { duration: 2000 });
    }
  }

  processChartDataWS(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset: +5:30 in milliseconds

    this.consumptionData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      entry.totalVolume,
    ]);

    this.createBarGraph();
  }

  fetchDeviceInfo(deviceId: string) {
    this.DashDataService.deviceDetails(deviceId).subscribe(
      (deviceDetailsResult: any) => {
        this.DeviceName = deviceDetailsResult[0].DeviceName;
        this.DashDataService.deviceStatus(deviceId).subscribe(
          (dataStatusResult: any) => {
            this.DeviceStatus = dataStatusResult[0].Status;
            const lastUpdatedTime = dataStatusResult[0].TimeStamp;
            this.DeviceTemperature = dataStatusResult[0].Temperature;
            this.DeviceTemperatureR = parseFloat(dataStatusResult[0].TemperatureR);
            this.DeviceTemperatureY = parseFloat(dataStatusResult[0].TemperatureY);
            this.DeviceTemperatureB = parseFloat(dataStatusResult[0].TemperatureB);
            this.DeviceHumidity = dataStatusResult[0].Humidity;
            this.DeviceFlowRate = dataStatusResult[0].flowRate;

            this.DeviceLastUpdatedTime = this.formatTime(lastUpdatedTime);
            this.DashDataService.deviceTrigger(deviceId).subscribe(
              (deviceTriggerResult: any) => {
                this.DeviceTrigger = deviceTriggerResult[0].TriggerValue;
                if(this.DeviceType === 'ws' || this.DeviceType === 'fs'){
                  this.DashDataService.getTotalConsumpion(deviceId).subscribe(
                    (deviceConsumtion: any) => {
                      if (deviceConsumtion.length > 0 && deviceConsumtion[0].totalVolume !== undefined && deviceConsumtion[0].totalVolume !== null && deviceConsumtion[0].totalVolume !== 0) {
                          this.DeviceTodayConsumption = (deviceConsumtion[0].totalVolume / 1000).toFixed(2);
                      } else {
                          this.DeviceTodayConsumption = 0;
                      }
                    }
                  );
                }
                this.loading1 = false;
              }
            );
          }
        );
      },
      (error) => {
        this.snackBar.open('Error while fetching last data!', 'Dismiss', {
          duration: 2000,
        });
      }
    );
  }

  formatTime(lastUpdatedTime: string): string {
    const currentTime = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const updatedTime = new Date(new Date(lastUpdatedTime).getTime() + offset);
    const diff = Math.abs(currentTime.getTime() - updatedTime.getTime()) / 1000; // Time difference in seconds

    if (diff < 60) {
      return `${Math.floor(diff)} sec ago`;
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} min ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour ago`;
    } else {
      const formattedTime = this.datePipe.transform(updatedTime, 'yyyy-MM-dd hh:mm:ss');
      return formattedTime || '';
    }
  }

  refresh() {
    if (this.deviceID) {
      this.fetchDeviceInfo(this.deviceID);
    }
  }
}
