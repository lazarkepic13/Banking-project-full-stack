import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <h2>Prijavi se</h2>
      <form (ngSubmit)="onSubmit($event)" #loginForm="ngForm">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            [(ngModel)]="email"
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
            [(ngModel)]="password"
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
        <button type="submit" [disabled]="loading">
          <span *ngIf="!loading">Prijavi se</span>
          <span *ngIf="loading">Učitavanje...</span>
        </button>
        <div [hidden]="!error" class="error-message">{{ error }}</div>
      </form>
      <p>Nemaš nalog? <a routerLink="/register">Registruj se</a></p>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 450px;
      margin: 80px auto;
      padding: 50px 40px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin-bottom: 35px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .form-group {
      margin-bottom: 25px;
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
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
    input.error-input {
      border-color: #e74c3c;
      background: #fff5f5;
    }
    button {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      margin-top: 10px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    button:active:not(:disabled) {
      transform: translateY(0);
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }
    .error-message {
      color: #e74c3c;
      margin-top: 15px;
      padding: 14px;
      background-color: #fee;
      border: 2px solid #fcc;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
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
      color: #667eea;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    a:hover {
      color: #764ba2;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit(event: Event) {
    event.preventDefault();

    // Očisti prethodne greške
    this.error = '';

    // Osnovna provera
    if (!this.email || !this.password) {
      this.error = 'Molimo unesite email i lozinku.';
      return;
    }

    this.loading = true;
    this.error = ''; // Očisti greške pre novog zahteva

    this.authService.login(this.email, this.password)
      .pipe(
        finalize(() => {
          // Ovo će se uvek izvršiti kada observable završi (success ili error)
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          const role = response?.role || this.authService.getCurrentRole();
          // Preusmeri na odgovarajući panel na osnovu role
          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'EMPLOYEE') {
            this.router.navigate(['/employee']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: any) => {
          console.error('Login error:', err);

          if (err.error && err.error.message) {
            this.error = err.error.message;
          } else if (err.status === 401 || err.status === 403) {
            this.error = 'Pogrešan email ili lozinka.';
          } else if (err.status === 0) {
            this.error = 'Nemoguće se povezati sa serverom. Proveri da li je backend pokrenut.';
          } else {
            this.error = 'Greška pri prijavi. Proveri email i lozinku.';
          }

          this.cdr.detectChanges();
        }
      });
  }
}

