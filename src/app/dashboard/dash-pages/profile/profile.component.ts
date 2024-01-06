import { Component, OnInit } from '@angular/core';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { FormControl, Validators } from '@angular/forms';
import{ DashService } from '../../dash.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit{

  constructor(private dashService:DashService,private authService:AuthService, private DashDataService:DashDataService,public snackBar: MatSnackBar){}
  fname!: string;
  lname!: string;
  companyEmail!: string;
  personalEmail!: string;
  companyName!: string;
  location!: string;
  designation!: string;
  contactNo!: string ;
  password: string = '';
  CPassword: string = ''; 
  hidePassword = true;
  hideConfirmPassword = true;
  userId!: string | null;
  cancelCompany: boolean = false;
  cancelPersonal: boolean = false;
  cancelPassword: boolean = false;

  ngOnInit() {
    this.fetchUserData();
    this.dashService.isPageLoading(true);
  }

  toggleCompany(){
    this.cancelCompany = !this.cancelCompany;
  }

  togglePersonal(){
    this.cancelPersonal = !this.cancelPersonal;
  }

  togglePassword(){
    this.cancelPassword = !this.cancelPassword;
  }

  fetchUserData() {
    this.userId = sessionStorage.getItem('UserId');
    if (this.userId) {
      this.DashDataService.userDetails(this.userId).subscribe(
        (userData) => {
          this.fname = userData[0].FirstName;
          this.lname = userData[0].LastName;
          this.companyEmail = userData[0].CompanyEmail;
          this.personalEmail = userData[0].PersonalEmail;
          this.companyName = userData[0].CompanyName;
          this.location = userData[0].Location;
          this.designation = userData[0].Designation;
          this.contactNo = userData[0].ContactNo;
          this.dashService.isPageLoading(false);
        },
        (error) => {
          this.snackBar.open('Error for getting details!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    } else {
      this.snackBar.open('UserId is not available!', 'Dismiss', {
        duration: 2000
        });
    }
  }

  updatePersonal() {
    const PersonalData = {
      FirstName : this.fname,
      LastName : this.lname
    }
    if (this.userId) {
      this.DashDataService.updatePersonal(this.userId, PersonalData).subscribe(
        () => {
          this.snackBar.open('Successfully Updated!', 'Dismiss', {
            duration: 2000
            });
          this.fetchUserData();
          this.togglePersonal();
        },
        (error) => {
          this.snackBar.open('Error for getting details!', 'Dismiss', {
            duration: 2000
            });
        }
      );
    } else {
      this.snackBar.open('UserId is not available!', 'Dismiss', {
        duration: 2000
        });
    }
  }
  updateCompany() {
    const CompanyData = {
      Designation : this.designation,
      ContactNo : this.contactNo,
      Location : this.location
    }
    if (this.userId) {
      this.DashDataService.updateCompany(this.userId, CompanyData).subscribe(
        () => {
          this.snackBar.open('Successfully Updated!', 'Dismiss', {
            duration: 2000
            });
          this.fetchUserData();
          this.toggleCompany();
        },
        (error) => {
          this.snackBar.open('Error for getting details!', 'Dismiss', {
            duration: 2000
            });
        }
      );
    } else {
      this.snackBar.open('UserId is not available!', 'Dismiss', {
        duration: 2000
        });
    }

  }

  updatePassword() {
  if (this.password !== this.CPassword) {
    this.snackBar.open('Passwords do not match!', 'Dismiss', {
      duration: 2000
      });
    return;
  }

  const passwordData = {
    Password: this.password,
  };

  if (this.userId) {
    this.DashDataService.updatePassword(this.userId, passwordData).subscribe(
      () => {
        this.snackBar.open('Successfully updated password!', 'Dismiss', {
          duration: 2000
          });
        // Additional logic if needed
        this.fetchUserData();
        this.togglePassword();
      },
      (error) => {
        this.snackBar.open('Error updating password!', 'Dismiss', {
          duration: 2000
          });
      }
    );
  } else {
    this.snackBar.open('UserId is not available!', 'Dismiss', {
      duration: 2000
      });
  }
}
}
