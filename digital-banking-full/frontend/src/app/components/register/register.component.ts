import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <h2>Registruj se</h2>
      <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            [(ngModel)]="customer.email"
            name="email"
            id="email"
            required
            #emailInput="ngModel"
            [class.error-input]="emailInput.invalid && emailInput.touched">
          <div *ngIf="emailInput.invalid && emailInput.touched" class="validation-error">
            <div *ngIf="emailInput.errors?.['required']">Email je obavezan</div>
          </div>
        </div>
        <div class="form-group">
          <label for="password">Lozinka:</label>
          <input
            type="password"
            [(ngModel)]="customer.password"
            name="password"
            id="password"
            required
            minlength="6"
            #passwordInput="ngModel"
            [class.error-input]="passwordInput.invalid && passwordInput.touched">
          <div *ngIf="passwordInput.invalid && passwordInput.touched" class="validation-error">
            <div *ngIf="passwordInput.errors?.['required']">Lozinka je obavezna</div>
            <div *ngIf="passwordInput.errors?.['minlength']">Lozinka mora imati najmanje 6 karaktera</div>
          </div>
        </div>
        <div class="form-group">
          <label for="firstName">Ime:</label>
          <input
            type="text"
            [(ngModel)]="customer.firstName"
            name="firstName"
            id="firstName"
            required
            #firstNameInput="ngModel"
            [class.error-input]="firstNameInput.invalid && firstNameInput.touched">
          <div *ngIf="firstNameInput.invalid && firstNameInput.touched" class="validation-error">
            Ime je obavezno
          </div>
        </div>
        <div class="form-group">
          <label for="lastName">Prezime:</label>
          <input
            type="text"
            [(ngModel)]="customer.lastName"
            name="lastName"
            id="lastName"
            required
            #lastNameInput="ngModel"
            [class.error-input]="lastNameInput.invalid && lastNameInput.touched">
          <div *ngIf="lastNameInput.invalid && lastNameInput.touched" class="validation-error">
            Prezime je obavezno
          </div>
        </div>
        <div class="form-group">
          <label for="phoneNumber">Telefon:</label>
          <input
            type="text"
            [(ngModel)]="customer.phoneNumber"
            name="phoneNumber"
            id="phoneNumber"
            required
            #phoneInput="ngModel"
            [class.error-input]="phoneInput.invalid && phoneInput.touched">
          <div *ngIf="phoneInput.invalid && phoneInput.touched" class="validation-error">
            Telefon je obavezan
          </div>
        </div>
        <div class="form-group">
          <label for="dateOfBirth">Datum rođenja:</label>
          <input
            type="date"
            [(ngModel)]="customer.dateOfBirth"
            name="dateOfBirth"
            id="dateOfBirth"
            required
            #dateInput="ngModel"
            [class.error-input]="dateInput.invalid && dateInput.touched">
          <div *ngIf="dateInput.invalid && dateInput.touched" class="validation-error">
            Datum rođenja je obavezan
          </div>
        </div>
        <div class="form-group">
          <label for="address">Adresa:</label>
          <input
            type="text"
            [(ngModel)]="customer.address"
            name="address"
            id="address"
            required
            #addressInput="ngModel"
            [class.error-input]="addressInput.invalid && addressInput.touched">
          <div *ngIf="addressInput.invalid && addressInput.touched" class="validation-error">
            Adresa je obavezna
          </div>
        </div>
        <div class="form-group">
          <label for="city">Grad:</label>
          <input
            type="text"
            [(ngModel)]="customer.city"
            name="city"
            id="city"
            required
            #cityInput="ngModel"
            [class.error-input]="cityInput.invalid && cityInput.touched">
          <div *ngIf="cityInput.invalid && cityInput.touched" class="validation-error">
            Grad je obavezan
          </div>
        </div>
        <div class="form-group">
          <label for="postalCode">Poštanski broj:</label>
          <input
            type="text"
            [(ngModel)]="customer.postalCode"
            name="postalCode"
            id="postalCode"
            required
            #postalInput="ngModel"
            [class.error-input]="postalInput.invalid && postalInput.touched">
          <div *ngIf="postalInput.invalid && postalInput.touched" class="validation-error">
            Poštanski broj je obavezan
          </div>
        </div>
        <div class="form-group">
          <label for="country">Država:</label>
          <input
            type="text"
            [(ngModel)]="customer.country"
            name="country"
            id="country"
            required
            #countryInput="ngModel"
            [class.error-input]="countryInput.invalid && countryInput.touched">
          <div *ngIf="countryInput.invalid && countryInput.touched" class="validation-error">
            Država je obavezna
          </div>
        </div>
        <button type="submit" [disabled]="loading || registerForm.invalid">Registruj se</button>
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="success" class="success">{{ success }}</div>
      </form>
      <p>Već imaš nalog? <a routerLink="/login">Prijavi se</a></p>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 550px;
      margin: 40px auto;
      padding: 50px 40px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      z-index: 1;
    }
    .register-container::-webkit-scrollbar {
      width: 8px;
    }
    .register-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .register-container::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 10px;
    }
    h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin-bottom: 35px;
      text-align: center;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .form-group {
      margin-bottom: 22px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      box-sizing: border-box;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    input:focus {
      outline: none;
      border-color: #0ea5e9;
      background: white;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15), 0 0 0 6px rgba(56, 189, 248, 0.1);
    }
    input.error-input {
      border-color: #e74c3c;
      background: #fff5f5;
    }
    button {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      margin-top: 10px;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
    }
    button:active:not(:disabled) {
      transform: translateY(0);
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }
    .error {
      color: #e74c3c;
      margin-top: 15px;
      padding: 14px;
      background-color: #fee;
      border: 2px solid #fcc;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
    }
    .success {
      color: #28a745;
      margin-top: 15px;
      padding: 14px;
      background-color: #e6ffe6;
      border: 2px solid #99ff99;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
    }
    .error-input {
      border-color: #e74c3c;
    }
    .validation-error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 6px;
      font-weight: 500;
    }
    p {
      text-align: center;
      margin-top: 25px;
      color: #666;
      font-size: 14px;
    }
    a {
      color: #0ea5e9;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    a:hover {
      color: #0284c7;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  customer = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    username: '',
    customerNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  };

  loading = false;
  error = '';
  success = '';

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Kreiraj username od emaila (osnova)
    this.customer.username = this.customer.email.split('@')[0];

    // Generiši customerNumber (jednostavno - CUST + timestamp)
    this.customer.customerNumber = 'CUST-' + Date.now();

    this.authService.register(this.customer).subscribe({
      next: () => {
        this.success = 'Uspešno si se registrovao! Sada se možeš prijaviti.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.error = 'Greška pri registraciji. Email već postoji ili su podaci neispravni.';
        this.loading = false;
      }
    });
  }
}

