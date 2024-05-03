import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface DataTable {
  DeviceName?: string;
  DeviceUID?: string;
  Date?: string;
  Temperature?: string;
  Humidity?: string;
  TemperatureR?: string;
  TemperatureY?: string;
  TemperatureB?: string;
  flowRate?: string;
  location?: string;
  totalVolume?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-app-mqtt',
  templateUrl: './app-mqtt.component.html',
  styleUrls: ['./app-mqtt.component.css']
})
export class AppMqttComponent implements OnInit {

  constructor(private DashDataService: DashDataService,private authService: AuthService, public snackBar: MatSnackBar, private datePipe: DatePipe) { }

  CompanyEmail!: string | null;
  deviceOptions: any[] = [];
  selectedDeviceUID!: any;
  selectedDeviceType!: any;
  device_uid = new FormControl('', [Validators.required]);
  start_date = new FormControl('', [Validators.required, this.dateShouldNotBeAfterToday.bind(this)]);
  end_date = new FormControl('', [Validators.required, this.endDateShouldNotBeAfterToday.bind(this), this.endDateShouldBeAfterStartDate.bind(this)]);

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<DataTable>();


  ngOnInit() {
    this.getUserDevices();
  }
  
  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.DashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.deviceOptions = devices.devices;
          const storedData = sessionStorage.getItem('reportDevice') ?? '';
          const device = storedData ? JSON.parse(storedData) : '';
          const startDate = sessionStorage.getItem('reportStartDate') ?? '';
          const endDate = sessionStorage.getItem('reportEndDate') ?? '';

          if (!device || !startDate || !endDate) {
            if (this.deviceOptions.length > 0) {
              const firstDevice = this.deviceOptions[0];
              this.device_uid.setValue(firstDevice);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              this.start_date.setValue(yesterday.toISOString().split('T')[0]);
              this.end_date.setValue(today.toISOString().split('T')[0]);  
              this.fetchData();
            } else {
              this.snackBar.open('No devices found.', 'Dismiss', {
                duration: 2000
              });
            }
          } else {
            const selectedDevice = this.deviceOptions.find(d => d.DeviceUID === device.DeviceUID);
            if (selectedDevice) {
              this.device_uid.setValue(selectedDevice);
              this.start_date.setValue(startDate);
              this.end_date.setValue(endDate);
              this.fetchData();
            } else {
              this.snackBar.open('Selected device not found.', 'Dismiss', {
                duration: 2000
              });
            }
          }
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    }
  }


  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  setDisplayedColumns() {
    switch (this.selectedDeviceType) {
      case 't':
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date', 'Temperature'];
        break;
      case 'h':
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date', 'Humidity'];
        break;
      case 'ps':
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date', 'Pressure'];
        break;
      case 'th':
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date', 'Temperature', 'Humidity'];
        break;
      case 'ryb':
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date', 'TemperatureR', 'TemperatureY', 'TemperatureB'];
        break;
      case 'ws':
      case 'fs':
      case 'ts':
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date', 'flowRate', 'Totalizer'];
        break;
      default:
        this.displayedColumns = ['DeviceName', 'DeviceUID', 'Date']; // Default columns
    }
  }

  private dateShouldNotBeAfterToday(control: FormControl) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    return selectedDate <= today ? null : { dateShouldNotBeAfterToday: true };
  }

  private endDateShouldNotBeAfterToday(control: FormControl) {
    const endDate = new Date(control.value);
    const today = new Date();
    return endDate <= today ? null : { endDateShouldNotBeAfterToday: true };
  }

  private endDateShouldBeAfterStartDate(control: FormControl) {
    const startDateValue = this.start_date.value ?? ''; // Use nullish coalescing operator
    const startDate = new Date(startDateValue);
    const endDate = new Date(control.value);
    return endDate >= startDate ? null : { endDateShouldBeAfterStartDate: true };
  }

  getDeviceUidErrorMessage() {
    return this.device_uid.hasError('required') ? 'Device Name is <strong>required</strong>' : '';
  }

  getStartDateErrorMessage() {
    if (this.start_date.hasError('required')) {
      return 'Start date is <strong>required</strong>';
    } else if (this.start_date.hasError('dateShouldNotBeAfterToday')) {
      return 'Start date should not be after today';
    }
    return '';
  }

  getEndDateErrorMessage() {
    if (this.end_date.hasError('required')) {
      return 'End date is <strong>required</strong>';
    } else if (this.end_date.hasError('endDateShouldNotBeAfterToday')) {
      return 'End date should not be after today';
    } else if (this.end_date.hasError('endDateShouldBeAfterStartDate')) {
      return 'End date should be after start date';
    }
    return '';
  }

  // Function to get the max date for the end date input
  getMaxEndDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  async fetchData() {
    try {
      if (!this.device_uid.valid || !this.start_date.valid || !this.end_date.valid) {
        this.device_uid.markAsTouched();
        this.start_date.markAsTouched();
        this.end_date.markAsTouched();
        this.snackBar.open('Validation failed!', 'Dismiss', { duration: 2000 });
        return; 
      }

      const startDateFormatted = this.datePipe.transform(this.start_date.value, 'yyyy-MM-dd') || '';
      const endDateFormatted = this.datePipe.transform(this.end_date.value, 'yyyy-MM-dd') || '';

      this.selectedDeviceUID = (this.device_uid.value as { DeviceUID?: string })?.DeviceUID;
      this.selectedDeviceType = (this.device_uid.value as { DeviceType?: string })?.DeviceType;
      if(this.device_uid.value && this.start_date.value && this.end_date.value){
        sessionStorage.setItem('reportStartDate', startDateFormatted) ;
        sessionStorage.setItem('reportEndDate', endDateFormatted);
        var dataToStore = JSON.stringify(this.device_uid.value);
        sessionStorage.setItem('reportDevice', dataToStore);
      }

      let dataWSPromise, dataPromise;

      // if (this.selectedDeviceType === 'ws' || this.selectedDeviceType === 'fs') {
      //   dataWSPromise = this.DashDataService.getCustomConsumption(this.selectedDeviceUID, startDateFormatted, endDateFormatted).toPromise();
      // }

      dataPromise = this.DashDataService.DataByCustomDate(this.selectedDeviceUID, startDateFormatted, endDateFormatted).toPromise();
      const [dataWS, data] = await Promise.all([dataWSPromise, dataPromise]);

      this.setDisplayedColumns();
      if(this.selectedDeviceType === 't'){
        this.processChartDataT(data);
      } else if(this.selectedDeviceType === 'h'){
        this.processChartDataH(data);
      } else if(this.selectedDeviceType === 'ps'){
        this.processChartDataPS(data);
      }else if(this.selectedDeviceType === 'th'){
        this.processChartDataTH(data);
      } else if(this.selectedDeviceType === 'ryb'){
        this.processChartDataRYB(data);
      } else if(this.selectedDeviceType === 'ws' || this.selectedDeviceType === 'fs' || this.selectedDeviceType === 'ts'){
        this.processChartDataWSFSTS(data);
      } else{
        this.snackBar.open('Device Type is not Found!', 'Dismiss', {
          duration: 2000
        });
      }
    } catch (error) {
      this.snackBar.open('Error while fetching data!', 'Dismiss', { duration: 2000 });
    }
  }

  processChartDataTH(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000;

    const processedData = data.map((entry: any) => {
      const DeviceUID = entry.DeviceUID;
      const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

      const timestamp = new Date(entry.bucket_start_time).getTime() + istOffset;
      const Temperature = entry.Temperature ? parseFloat(entry.Temperature).toFixed(1) : '0';
      const Humidity = entry.Humidity ? parseFloat(entry.Humidity).toFixed(1) : '0';

      const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

      return {
        DeviceName: deviceOption ? deviceOption.DeviceName : '',
        DeviceUID : DeviceUID,
        Date: formattedDate,
        Temperature: Temperature,
        Humidity: Humidity,
      };
    });

    this.dataSource.data = processedData;
    this.dataSource.paginator = this.paginator;
  }

  processChartDataT(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000;

    const processedData = data.map((entry: any) => {
      const DeviceUID = entry.DeviceUID;
      const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

      const timestamp = new Date(entry.bucket_start_time).getTime() + istOffset;
      const Temperature = entry.Temperature ? parseFloat(entry.Temperature).toFixed(1) : '0';

      const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

      return {
        DeviceName: deviceOption ? deviceOption.DeviceName : '',
        DeviceUID : DeviceUID,
        Date: formattedDate,
        Temperature: Temperature,
      };
    });

    this.dataSource.data = processedData;
    this.dataSource.paginator = this.paginator;
  }

  processChartDataRYB(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000;

    const processedData = data.map((entry: any) => {
      const DeviceUID = entry.DeviceUID;
      const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

      const timestamp = new Date(entry.bucket_start_time).getTime() + istOffset;
      const TemperatureR = entry.TemperatureR ? parseFloat(entry.TemperatureR).toFixed(1) : '0';
      const TemperatureY = entry.TemperatureY ? parseFloat(entry.TemperatureY).toFixed(1) : '0';
      const TemperatureB = entry.TemperatureB ? parseFloat(entry.TemperatureB).toFixed(1) : '0';

      const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

      return {
        DeviceName: deviceOption ? deviceOption.DeviceName : '',
        DeviceUID : DeviceUID,
        Date: formattedDate,
        TemperatureR: TemperatureR,
        TemperatureY: TemperatureY,
        TemperatureB: TemperatureB
      };
    });

    this.dataSource.data = processedData;
    this.dataSource.paginator = this.paginator;
  }

  processChartDataH(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000;

    const processedData = data.map((entry: any) => {
      const DeviceUID = entry.DeviceUID;
      const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

      const timestamp = new Date(entry.bucket_start_time).getTime() + istOffset;
      const Humidity = entry.Humidity ? parseFloat(entry.Humidity).toFixed(1) : '0';

      const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

      return {
        DeviceName: deviceOption ? deviceOption.DeviceName : '',
        DeviceUID : DeviceUID,
        Date: formattedDate,
        Humidity: Humidity,
      };
    });

    this.dataSource.data = processedData;
    this.dataSource.paginator = this.paginator;
  }

  processChartDataWSFSTS(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000;

    const processedData = data.map((entry: any) => {
      const DeviceUID = entry.DeviceUID;
      const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

      const timestamp = new Date(entry.bucket_start_time).getTime() + istOffset;
      const flowRate = entry.flowRate ? parseFloat(entry.flowRate).toFixed(1) : '0';
      const Totalizer = entry.Totalizer ? parseFloat(entry.Totalizer).toFixed(2) : '0';
      //const totalVolume = entry.totalVolume ? parseFloat(entry.totalVolume).toFixed(1) : '0';
      
      const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

      return {
        DeviceName: deviceOption ? deviceOption.DeviceName : '',
        DeviceUID : DeviceUID,
        Date: formattedDate,
        flowRate: flowRate,
        Totalizer: Totalizer,
        //totalVolume: totalVolume
      };
    });

    this.dataSource.data = processedData;
    this.dataSource.paginator = this.paginator;
  }

  processChartDataPS(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000;

    const processedData = data.map((entry: any) => {
      const DeviceUID = entry.DeviceUID;
      const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

      const timestamp = new Date(entry.bucket_start_time).getTime() + istOffset;
      const Pressure = entry.Pressure ? parseFloat(entry.Pressure).toFixed(1) : '0';

      const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

      return {
        DeviceName: deviceOption ? deviceOption.DeviceName : '',
        DeviceUID : DeviceUID,
        Date: formattedDate,
        Pressure: Pressure,
      };
    });

    this.dataSource.data = processedData;
    this.dataSource.paginator = this.paginator;
  }

  // mergeChartData(responseWSFS: any, responseWSFSTotal: any) {
  //   const processedDataWSFS = this.processChartDataWSFS(responseWSFS);
  //   const processedDataWSFSTotal = this.processChartDataWSFSTotal(responseWSFSTotal);

  //   // Create an object to store aggregated totalVolume for each date
  //   const totalVolumeMap: { [date: string]: number } = {};

  //   // Aggregate totalVolume values for each date from processedDataWSFSTotal
  //   processedDataWSFSTotal.forEach((wsfstotalEntry: any) => {
  //     const key = wsfstotalEntry.Date;
  //     totalVolumeMap[key] = (totalVolumeMap[key] || 0) + parseFloat(wsfstotalEntry.totalVolume);
  //   });

  //   // Merge the data from processedDataWSFS and add aggregated totalVolume
  //   const mergedData = processedDataWSFS.map((wsfsEntry: any) => {
  //     const key = wsfsEntry.Date;
  //     const aggregatedTotalVolume = totalVolumeMap[key];
      
  //     return {
  //       ...wsfsEntry,
  //       totalVolume: aggregatedTotalVolume || 'N/A'
  //     };
  //   });

  //   this.dataSource.data = mergedData;
  //   this.dataSource.paginator = this.paginator;
  //   console.log(this.dataSource);
  // }


  // processChartDataWSFS(response: any) {
  //   const data = response.data;
  //   const istOffset = 5.5 * 60 * 60 * 1000;

  //   return data.map((entry: any) => {
  //     const DeviceUID = entry.DeviceUID;
  //     const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

  //     const timestamp = new Date(entry.bucket_start_time).getTime();
  //     const flowRate = entry.flowRate ? parseFloat(entry.flowRate).toFixed(1) : '0';

  //     const formattedDate = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');

  //     return {
  //       DeviceName: deviceOption ? deviceOption.DeviceName : '',
  //       DeviceUID: DeviceUID,
  //       Date: formattedDate,
  //       flowRate: flowRate
  //     };
  //   });
  // }

  // processChartDataWSFSTotal(response: any) {
  //   const data = response.data;
  //   const istOffset = 5.5 * 60 * 60 * 1000;

  //   return data.map((entry: any) => {
  //     const DeviceUID = entry.DeviceUID;
  //     const deviceOption = this.deviceOptions.find(device => device.DeviceUID === DeviceUID);

  //     const timestamp = new Date(entry.TimeStamp);
  //     const totalVolume = entry.totalVolume ? parseFloat(entry.totalVolume).toFixed(1) : '0';

  //     // Format the date as 'Jan 21, 2024, 5:30:00 AM'
  //     const formattedDate = new Date(timestamp).toLocaleString('en-US', {
  //       month: 'short',
  //       day: 'numeric',
  //       year: 'numeric',
  //       hour: 'numeric',
  //       minute: 'numeric',
  //       second: 'numeric',
  //       hour12: true,
  //     });

  //     return {
  //       DeviceName: deviceOption ? deviceOption.DeviceName : '',
  //       DeviceUID: DeviceUID,
  //       Date: formattedDate,
  //       totalVolume: totalVolume
  //     };
  //   });
  // }



  downloadCSV() {
    const startDateFormatted = this.datePipe.transform(this.start_date.value, 'yyyyMMdd');
    const endDateFormatted = this.datePipe.transform(this.end_date.value, 'yyyyMMdd');
    const fileName = `${this.selectedDeviceUID}_${startDateFormatted}_${endDateFormatted}.csv`;

    const csvData = this.convertDataSourceToCSV(this.dataSource.data);

    if (!csvData || csvData.trim() === '') {
      this.snackBar.open('No data found.', 'Dismiss', {
        duration: 2000
      });
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  // Convert data to CSV format
  private convertDataSourceToCSV(data: DataTable[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const header = Object.keys(data[0]).join(',') + '\n';
    const csvRows = data.map(row => Object.values(row).join(',') + '\n');
    return header + csvRows.join('');
  }

  downloadXLXS() {
    this.snackBar.open('XLSX sheed will be Available in Next Update!', 'Dismiss', {
      duration: 2000
    });
  }

  downloadPDF() {
    this.snackBar.open('PDF sheed will be Available in Next Update!', 'Dismiss', {
      duration: 2000
    });
  }

}