import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit{

  FirstName = new FormControl('', [Validators.required]);
  LastName = new FormControl('', [Validators.required]);
  PersonalEmail = new FormControl('', [Validators.required, Validators.email]);
  ContactNo = new FormControl('', [Validators.required]);
  UserType = new FormControl('', [Validators.required]);
  Location = new FormControl('', [Validators.required]);
  Designation = new FormControl('', [Validators.required]);
  CompanyEmail!: string;
  CompanyName!: string;
  userId!: string | null;

  @HostListener('window:resize')
  onWindowResize() {
    this.adjustDialogWidth();
  }
  private adjustDialogWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      this.dialogRef.updateSize('90%', '');
    } else if (screenWidth <= 960) {
      this.dialogRef.updateSize('70%', '');
    } else {
      this.dialogRef.updateSize('400px', '');
    }
  }
  constructor(
    private DashDataService: DashDataService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
  }

  ngOnInit(){
    this.companyDetails();
  }

  getPersonalEmailErrorMessage() {
    if (this.PersonalEmail.hasError('required')) {
      return 'Email is Required';
    }
    return this.PersonalEmail.hasError('email') ? 'Not a valid email' : '';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if(this.FirstName.valid && this.LastName.valid && this.PersonalEmail.valid
      && this.ContactNo.valid && this.UserType.valid && this.Location.valid 
      && this.Designation.valid){
      const userRegister = {
        companyName: this.CompanyName,
        companyEmail: this.CompanyEmail,
        contact: this.ContactNo.value,
        location: this.Location.value,
        firstName: this.FirstName.value,
        lastName: this.LastName.value,
        personalEmail: this.PersonalEmail.value,
        designation: this.Designation.value,
        password: this.PersonalEmail.value,
        userType: this.UserType.value
      }
      this.DashDataService.addUser(userRegister).subscribe(
        () =>{
        this.snackBar.open('User Added Successful!', 'Dismiss', {
          duration: 2000
        });
        this.dialogRef.close();
        },
      (error) => {
        this.snackBar.open(
            error.error.message || 'Failed to add User. Please try again.',
            'Dismiss',
            { duration: 2000 }
          );
        this.dialogRef.close();
      });
    }
  }

 companyDetails() {
    this.userId = sessionStorage.getItem('UserId');
    if(this.userId){
      this.DashDataService.userDetails(this.userId).subscribe(
        (users) => {
          this.CompanyEmail = users[0].CompanyEmail;
          this.CompanyName = users[0].CompanyName;
        },
        (error) =>{
          this.snackBar.open(
            error.error.message || 'Error While Fetching the Compnay Details.',
            'Dismiss',
            { duration: 2000 }
          );
        }
      );
    }
  }

}
