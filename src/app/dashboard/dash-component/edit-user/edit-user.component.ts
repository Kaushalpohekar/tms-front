import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user: any = {};
  FirstName = new FormControl('', [Validators.required]);
  LastName = new FormControl('', [Validators.required]);
  PersonalEmail = new FormControl('', [Validators.required, Validators.email]);
  ContactNo = new FormControl('', [Validators.required]);
  UserType = new FormControl('', [Validators.required]);
  Location = new FormControl('', [Validators.required]);
  Designation = new FormControl('', [Validators.required]);
  userId!: any;

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
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.user = data.data;
    // console.log(this.user);
    this.FirstName = new FormControl(this.user.FirstName, [Validators.required]);
    this.LastName  = new FormControl(this.user.LastName, [Validators.required]);
    this.PersonalEmail = new FormControl(this.user.PersonalEmail, [Validators.required]);
    this.ContactNo = new FormControl(this.user.ContactNo, [Validators.required]);
    this.Location = new FormControl(this.user.Location, [Validators.required]);
    this.Designation = new FormControl(this.user.Designation, [Validators.required]);
    this.UserType = new FormControl(this.user.UserType, [Validators.required]);
  }

  ngOnInit() {
    this.adjustDialogWidth();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  editUser(): void {
    this.userId = this.user.UserId;
    if (this.FirstName.valid && this.LastName.valid && this.PersonalEmail.valid && this.ContactNo.valid && this.UserType.valid && this.Location.valid && this.Designation.valid) {
        const userUpdate = {
            FirstName: this.FirstName.value,
            LastName: this.LastName.value,
            PersonalEmail: this.PersonalEmail.value,
            ContactNo: this.ContactNo.value,
            UserType: this.UserType.value,
            Location: this.Location.value,
            Designation: this.Designation.value
        };

        this.DashDataService.editUser(this.userId, userUpdate).subscribe(
          () => {
            this.snackBar.open('User Details Updated successfully!', 'Dismiss', {
              duration: 2000
            });
            this.dialogRef.close();
          },
          (error) => {
            this.snackBar.open('Failed to update User!', 'Dismiss', {
              duration: 2000
            });
          }
        );
    }
}
  
  getPersonalEmailErrorMessage() {
    if (this.PersonalEmail.hasError('required')) {
      return 'Email is Required';
    }
    return this.PersonalEmail.hasError('email') ? 'Not a valid email' : '';
  } 
}