import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NavbarComponent } from './dash-component/navbar/navbar.component';
import { FooterComponent } from './dash-component/footer/footer.component';
import { DashLayoutComponent } from './dash-layout/dash-layout.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { TempComponent } from './dash-pages/temp/temp.component';
import { DataComponent } from './dash-pages/data/data.component';
import { ProfileComponent } from './dash-pages/profile/profile.component';
import { EditDeviceComponent } from './dash-component/edit-device/edit-device.component';
import { TriggerDeviceComponent } from './dash-component/trigger-device/trigger-device.component';
import { NotificationComponent } from './dash-pages/notification/notification.component';
import { UserManageComponent } from './dash-pages/user-manage/user-manage.component';
import { SidebarComponent } from './dash-component/sidebar/sidebar.component';
import { AppMqttComponent } from './dash-pages/app-mqtt/app-mqtt.component';

import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import {MatCardModule} from '@angular/material/card'
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FilterComponent } from './dash-component/filter/filter.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatMenuModule} from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';


import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from '../login/auth/auth.service';
import {MatTabsModule} from '@angular/material/tabs';
import { AddUserComponent } from './dash-component/add-user/add-user.component';
import { AddDeviceComponent } from './dash-component/add-device/add-device.component';
import { PageLoadingComponent } from './dash-loading/page-loading/page-loading.component';

import { DashFilterComponent } from './dash-component/dash-filter/dash-filter.component';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    DashLayoutComponent,
    TempComponent,
    DataComponent,
    ProfileComponent,
    EditDeviceComponent,
    TriggerDeviceComponent,
    FilterComponent,
    NotificationComponent,
    UserManageComponent,
    SidebarComponent,
    AddUserComponent,
    AddDeviceComponent,
    PageLoadingComponent,
    AppMqttComponent,
    DashFilterComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatBadgeModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatRadioModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatListModule,
    HttpClientModule,
    MatSidenavModule,
    MatExpansionModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatPaginatorModule
  ],
  providers:[
    AuthService,
    DatePipe
    ]
})
export class DashboardModule { }
