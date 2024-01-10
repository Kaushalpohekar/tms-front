import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userType!: string;
  private CompanyEmail!: string;
  private token!: string;

  encryptUsers!: any;
  decryptUsers!: any;

  constructor(private http: HttpClient, private router: Router) {}

  //private readonly API_URL = 'https://ec2-13-200-38-129.ap-south-1.compute.amazonaws.com:3000';
  private readonly API_URL = 'http://localhost:3000';

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, loginData);
  }

  register(registerData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, registerData);
  }

  resendVerificationEmail(resendVerifyData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/re-verify-mail`, resendVerifyData);
  }

  VerifyUser(verifyUserToken: any): Observable<any> {
    return this.http.post(`${this.API_URL}/verify`, verifyUserToken);
  }

  forgot(forgotData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot`, forgotData);
  }

  resendForgot(resendForgotData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/resend-forgot`, resendForgotData);
  }

  resetPassword(resetData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, resetData);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  setUserType(userType: string) {
    sessionStorage.setItem('userType', userType);
  }

  getUserType(): string | null {
    return sessionStorage.getItem('userType');
  }

  setCompanyEmail(CompanyEmail: string){
    sessionStorage.setItem('CompanyEmail', CompanyEmail);
  }

  getCompanyEmail(): string | null {
    return sessionStorage.getItem('CompanyEmail');
  }

  setCompanyName(CompanyName: string){
    sessionStorage.setItem('CompanyName', CompanyName);
  }

  getCompanyName(): string | null {
    return sessionStorage.getItem('CompanyName');
  }

  setToken(token: string): void {
    this.token = token;
    sessionStorage.setItem('token', token); // Store the token in the session storage

    // Fetch user details immediately after setting the token
    this.getUserDetails();
  }

  getToken(): string | null {
    return this.token || sessionStorage.getItem('token'); // Retrieve the token from the session storage
  }

  logout(): void {
    sessionStorage.removeItem('token'); // Clear the token
    this.isLoggedIn(); // Set the logged-in status to false
    this.setUserType(''); // Clear the user type
    this.router.navigate(['/login/login']); // Additional cleanup or redirect logic can be added here
  }

  getUserDetails(): void {
    const token = this.getToken();
    if (token && !this.userType) {
      // Make a request to fetch user details using the token
      this.http.get(`${this.API_URL}/user`, { headers: { Authorization: `Bearer ${token}` } })
        .subscribe(
          (user: any) => {
            // Handle the response and set the user type
            const userType = user.UserType; // Modify this according to the response structure
            this.setUserType(userType);

            const CompanyEmail = user.CompanyEmail;
            this.setCompanyEmail(CompanyEmail);

            const CompanyName = user.CompanyName;
            this.setCompanyName(CompanyName);

            const userId = user.UserId;
            sessionStorage.setItem('UserId', userId);
          },
          (error: any) => {
            console.error(error);
          }
        );
    }
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/users`);
  }

  setUserOffline(UserId: string): Observable<any> {
    return this.http.put(`${this.API_URL}/setUserOffline/${UserId}`, {});
  }
  
  setUserOnline(UserId: string): Observable<any> {
    return this.http.put(`${this.API_URL}/setUserOnline/${UserId}`, {});
  }

}
