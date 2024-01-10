import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EncrptService } from './services/encrpt.service'

import { HttpClientModule } from '@angular/common/http';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

import { HashLocationStrategy,LocationStrategy } from '@angular/common';

// const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
//   hostname: 'dashboard.senselive.in',
//   port: 8885,
//   protocol: 'wss',
//   username: 'Sense2023',
//   password: 'sense123'
// };

// const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
//   hostname: '43.204.219.125',
//   port: 9001,
//   protocol: 'ws',
//   username: 'Sense2023',
//   password: 'sense123'
// };


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    //MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    
  ],
  providers: [EncrptService,{provide : LocationStrategy , useClass : HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }