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

  // new constants

  deviceID!:string;
  deviceINTERVAL!:string;
  deviceSTART!:string;
  deviceEND!:string;

  ngOnInit() {
    this.retrievingValues();
    console.log("Intial Page!!");
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
            }, 1000);
            
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
    }, 1000);
  }

  retrievingAllValues(){
    if(this.DeviceType==='ws'|| this.DeviceType==='fs'){
      if(this.deviceINTERVAL==='Custom'){
        this.DashDataService.getCustomConsumption(this.deviceID,this.deviceSTART,this.deviceEND).subscribe(
          (dataWS: any) => {
            this.DashDataService.DataByCustomDate(this.deviceID,this.deviceSTART,this.deviceEND).subscribe(
              (data: any) => {
                this.DashDataService.DataByCustomDateStatus(this.deviceID,this.deviceSTART,this.deviceEND).subscribe(
                  (dataStatus: any) => {
                    setTimeout(() => {
                      this.processChartData(data);
                      this.createDonutChart(dataStatus.dataStatus);
                      this.fetchDeviceInfo(this.deviceID);
                      console.log(dataWS);
                      this.processChartDataWS(dataWS);
                      this.router.navigate([this.router.url]);
                    }, 1000);
                  },
                  (error) => {
                    this.snackBar.open('Error while fetching data!', 'Dismiss', {
                      duration: 2000
                    });
                  }
                );
              },
              (error) => {
                this.snackBar.open('Error while fetching data!', 'Dismiss', {
                  duration: 2000
                });
              }
            );
          },
          (error) => {
            this.snackBar.open('Error while fetching data!', 'Dismiss', {
              duration: 2000
            });
          }
        );
      }
      else{
        this.DashDataService.getIntervalConsuption(this.deviceID,this.deviceINTERVAL).subscribe(
          (dataWS: any) => {
            this.DashDataService.dataLast(this.deviceID,this.deviceINTERVAL).subscribe(
              (data: any) => {
                this.DashDataService.dataLastStatus(this.deviceID,this.deviceINTERVAL).subscribe(
                  (dataStatus: any) => {
                    setTimeout(() => {
                      this.processChartData(data);
                      this.createDonutChart(dataStatus.dataStatus);
                      this.fetchDeviceInfo(this.deviceID);
                      console.log(dataWS);
                      this.processChartDataWS(dataWS);
                      this.router.navigate([this.router.url]);
                    }, 1000);
                  },
                  (error) => {
                    this.snackBar.open('Error while fetching data!', 'Dismiss', {
                      duration: 2000
                    });
                  }
                );
              },
              (error) => {
                this.snackBar.open('Error while fetching data!', 'Dismiss', {
                  duration: 2000
                });
              }
            );
          },
          (error) => {
            this.snackBar.open('Error while fetching data!', 'Dismiss', {
              duration: 2000
            });
          }
        );
      }
    }
    else if(this.DeviceType==='t'||this.DeviceType==='th'||this.DeviceType==='ryb'){
      if(this.deviceINTERVAL==='Custom'){
        this.DashDataService.DataByCustomDate(this.deviceID,this.deviceSTART,this.deviceEND).subscribe(
          (data: any) => {
            this.DashDataService.DataByCustomDateStatus(this.deviceID,this.deviceSTART,this.deviceEND).subscribe(
              (dataStatus: any) => {
                setTimeout(() => {
                  this.processChartData(data);
                  this.createDonutChart(dataStatus.dataStatus);
                  this.fetchDeviceInfo(this.deviceID);
                  this.router.navigate([this.router.url]);
                }, 1000);
              },
              (error) => {
                this.snackBar.open('Error while fetching data!', 'Dismiss', {
                  duration: 2000
                });
              }
            );
          },
          (error) => {
            this.snackBar.open('Error while fetching data!', 'Dismiss', {
              duration: 2000
            });
          }
        );      
      }
      else{
        this.DashDataService.dataLast(this.deviceID,this.deviceINTERVAL).subscribe(
          (data: any) => {
            this.DashDataService.dataLastStatus(this.deviceID,this.deviceINTERVAL).subscribe(
              (dataStatus: any) => {
                setTimeout(() => {
                  this.processChartData(data);
                  this.createDonutChart(dataStatus.dataStatus);
                  this.fetchDeviceInfo(this.deviceID);
                  this.router.navigate([this.router.url]);
                }, 1000);
              },
              (error) => {
                this.snackBar.open('Error while fetching data!', 'Dismiss', {
                  duration: 2000
                });
              }
            );
          },
          (error) => {
            this.snackBar.open('Error while fetching data!', 'Dismiss', {
              duration: 2000
            });
          }
        ); 
      }
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
          /*dataLabels: {
            enabled: true,
            distance: -40, // Adjust the distance of labels from the center of the pie
            format: '{point.name}: {point.time}', // Include status and hours in the label
            style: {
              fontWeight: 'bold'
            }
          }*/
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
          lineWidth: 3, // Set the line width to triple
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
          lineWidth: 3, // Set the line width to triple
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
          lineWidth: 3, // Set the line width to triple
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

    this.temperatureData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      entry.Temperature,
    ]);

    this.humidityData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      entry.Humidity,
    ]);

    // Convert TemperatureR, TemperatureY, and TemperatureB values to numbers
    this.temperatureRData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      parseFloat(entry.TemperatureR),
    ]);

    this.temperatureYData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      parseFloat(entry.TemperatureY),
    ]);

    this.temperatureBData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      parseFloat(entry.TemperatureB),
    ]);

    this.timestampData = data.map(
      (entry: any) => new Date(entry.TimeStamp).getTime() + istOffset
    );

    this.flowRateData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      entry.flowRate,
    ]);

    if (this.DeviceType === 'th') {
      this.createChart();
      this.createChart2();
    } else if (this.DeviceType === 't') {
      this.createChart();
    } else if (this.DeviceType === 'ryb') {
      this.createTemperature();
    } else if (this.DeviceType === 'ws') {
      this.createChart3();
      this.createBarGraph();
    } else {
      this.snackBar.open('Device Type is not found!', 'Dismiss', {
        duration: 2000
      });
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
            this.DeviceLastUpdatedTime = this.formatTime(lastUpdatedTime);
            this.DashDataService.deviceTrigger(deviceId).subscribe(
              (deviceTriggerResult: any) => {
                this.DeviceTrigger = deviceTriggerResult[0].TriggerValue;
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
    const updatedTime = new Date(lastUpdatedTime);
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
      const formattedTime = this.datePipe.transform(
        updatedTime,
        'yyyy-MM-dd hh:mm:ss'
      );
      return formattedTime || '';
    }
  }

  refresh() {
    if (this.deviceID) {
      this.fetchDeviceInfo(this.deviceID);
    }
  }
}
