import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="employee-container">
      <div class="header">
        <h1>Employee Panel</h1>
        <div>
          <span class="user-info">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          <button (click)="logout()">Odjavi se</button>
        </div>
      </div>

      <div class="content">
        <h2>Dobrodošli, zaposleni!</h2>
        <p>Ovde će biti funkcionalnosti za zaposlene:</p>
        <ul>
          <li>Pregled klijenata</li>
          <li>Upravljanje računima klijenata</li>
          <li>Pregled transakcija</li>
          <li>Odobravanje transakcija (ako imate dozvole)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .employee-container {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 30px 40px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .header h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }
    button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
    }
    .user-info {
      margin-right: 20px;
      font-weight: 600;
      font-size: 16px;
      color: #555;
      font-family: 'Inter', sans-serif;
    }
    .content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 35px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .content h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
    }
    .content ul {
      list-style-type: disc;
      padding-left: 30px;
      color: #555;
    }
    .content li {
      margin-bottom: 10px;
      font-size: 16px;
    }
  `]
})
export class EmployeeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: any = null;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    // Proveri da li je korisnik stvarno employee
    if (!this.authService.isEmployee() && !this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

