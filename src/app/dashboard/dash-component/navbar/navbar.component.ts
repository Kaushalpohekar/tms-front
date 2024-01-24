import { Component } from '@angular/core';
import { DashService } from '../../dash.service';
import { AuthService } from '../../../login/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  UserId!: string;

  constructor(public dashService: DashService, public authService:  AuthService, private router: Router) { }

  public toggleMenu() {
    this.dashService.toggleMenu();
  }

  getUserType(): string | null {
    return this.authService.getUserType();
  }

  logout(){
    this.UserId = sessionStorage.getItem('UserId') ?? '';
    this.authService.setUserOffline(this.UserId).subscribe(
      () =>{
        this.authService.logout();
      },
      (error) =>{
      }
    );
  }

  home(){
    this.router.navigate(['/dash/temp']);
  }

  data(){
    this.router.navigate(['/dash/data']);
  }

  notifications(){
    this.router.navigate(['/dash/notification']);
  }

  settings(){
    this.router.navigate(['/dash/users']);
  }

  profile(){
    this.router.navigate(['/dash/profile']);
  }

  report(){
    this.router.navigate(['/dash/report']);
  }
}
