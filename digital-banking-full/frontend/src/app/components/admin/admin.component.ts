import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, User } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Admin početna stranica</h1>
        <div>
          <span class="user-info">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          <button (click)="logout()" class="logout-btn">Odjavi se</button>
        </div>
      </div>

      <div class="tabs">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab.id"
          [class.active]="activeTab === tab.id"
          class="tab-button">
          {{ tab.label }}
        </button>
      </div>

      <div class="content">
        <!-- Tab: Korisnici -->
        <div *ngIf="activeTab === 'users'" class="tab-content">
          <div class="section-header">
            <h2>Korisnici</h2>
            <div class="user-filter">
              <button
                (click)="userFilter = 'all'"
                [class.active]="userFilter === 'all'"
                class="filter-btn">Svi</button>
              <button
                (click)="userFilter = 'customers'"
                [class.active]="userFilter === 'customers'"
                class="filter-btn">Klijenti</button>
              <button
                (click)="userFilter = 'employees'"
                [class.active]="userFilter === 'employees'"
                class="filter-btn">Zaposleni</button>
            </div>
          </div>

          <div *ngIf="loadingUsers" class="loading">Učitavanje korisnika...</div>

          <div *ngIf="!loadingUsers" class="users-grid">
            <!-- Customers -->
            <div *ngFor="let customer of filteredCustomers" class="user-card">
              <div class="user-header">
                <div>
                  <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
                  <p class="user-email">{{ customer.email }}</p>
                  <p class="user-number">Broj: {{ customer.customerNumber }}</p>
                </div>
                <span class="badge badge-customer">Klijent</span>
              </div>
              <div class="user-details">
                <p><strong>Telefon:</strong> {{ customer.phoneNumber }}</p>
                <p><strong>Status:</strong>
                  <span [class]="'status-' + (customer.active ? 'active' : 'blocked')">
                    {{ customer.active ? 'Aktivan' : 'Blokiran' }}
                  </span>
                </p>
              </div>
              <div class="user-actions">
                <button
                  *ngIf="customer.active"
                  (click)="blockCustomer(customer.id)"
                  [disabled]="processing"
                  class="btn-danger btn-sm">
                  Blokiraj
                </button>
                <button
                  *ngIf="!customer.active"
                  (click)="unblockCustomer(customer.id)"
                  [disabled]="processing"
                  class="btn-success btn-sm">
                  Odblokiraj
                </button>
              </div>
            </div>

            <!-- Employees -->
            <div *ngFor="let employee of filteredEmployees" class="user-card">
              <div class="user-header">
                <div>
                  <h3>{{ employee.firstName }} {{ employee.lastName }}</h3>
                  <p class="user-email">{{ employee.email }}</p>
                  <p class="user-number">Broj: {{ employee.employeeNumber }}</p>
                </div>
                <span class="badge badge-employee">Zaposleni</span>
              </div>
              <div class="user-details">
                <p><strong>Telefon:</strong> {{ employee.phoneNumber }}</p>
                <p *ngIf="employee.position"><strong>Pozicija:</strong> {{ employee.position }}</p>
                <p *ngIf="employee.department"><strong>Odeljenje:</strong> {{ employee.department }}</p>
                <p><strong>Status:</strong>
                  <span [class]="'status-' + (employee.active ? 'active' : 'blocked')">
                    {{ employee.active ? 'Aktivan' : 'Blokiran' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Računi -->
        <div *ngIf="activeTab === 'accounts'" class="tab-content">
          <div class="section-header">
            <h2>Računi</h2>
          </div>

          <div *ngIf="loadingAccounts" class="loading">Učitavanje računa...</div>

          <div *ngIf="!loadingAccounts" class="accounts-list">
            <div *ngFor="let account of accounts" class="account-card">
              <div class="account-info">
                <div>
                  <h3>Račun: {{ account.accountNumber }}</h3>
                  <p><strong>Tip:</strong> {{ account.type }}</p>
                  <p><strong>Stanje:</strong> {{ account.balance | number:'1.2-2' }} RSD</p>
                  <p><strong>Vlasnik:</strong> {{ account.customer?.firstName }} {{ account.customer?.lastName }}</p>
                </div>
                <span [class]="'badge status-' + account.status?.toLowerCase()">
                  {{ account.status }}
                </span>
              </div>
              <div class="account-actions">
                <button
                  *ngIf="account.status === 'ACTIVE'"
                  (click)="blockAccount(account.id)"
                  [disabled]="processing"
                  class="btn-danger btn-sm">
                  Blokiraj račun
                </button>
                <button
                  *ngIf="account.status === 'BLOCKED'"
                  (click)="activateAccount(account.id)"
                  [disabled]="processing"
                  class="btn-success btn-sm">
                  Aktiviraj račun
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Transakcije -->
        <div *ngIf="activeTab === 'transactions'" class="tab-content">
          <div class="section-header">
            <h2>Transakcije</h2>
          </div>

          <div *ngIf="loadingTransactions" class="loading">Učitavanje transakcija...</div>

          <div *ngIf="!loadingTransactions" class="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tip</th>
                  <th>Iznos</th>
                  <th>Status</th>
                  <th>Sa računa</th>
                  <th>Na račun</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of transactions">
                  <td>{{ transaction.id }}</td>
                  <td>{{ transaction.type }}</td>
                  <td [class]="'amount-' + transaction.type?.toLowerCase()">
                    {{ transaction.amount | number:'1.2-2' }} RSD
                  </td>
                  <td>
                    <span [class]="'badge status-' + transaction.status?.toLowerCase()">
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td>{{ transaction.fromAccount?.accountNumber || '-' }}</td>
                  <td>{{ transaction.toAccount?.accountNumber || '-' }}</td>
                  <td>{{ formatDate(transaction.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 40px 20px;
      max-width: 1600px;
      margin: 0 auto;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
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
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }
    button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4), 0 2px 8px rgba(2, 132, 199, 0.3);
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5), 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .user-info {
      margin-right: 20px;
      font-weight: 600;
      font-size: 16px;
      color: #555;
      font-family: 'Inter', sans-serif;
    }
    .logout-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%) !important;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(220, 38, 38, 0.3) !important;
    }
    .logout-btn:hover {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%) !important;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5), 0 4px 12px rgba(220, 38, 38, 0.4) !important;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .tab-button {
      padding: 12px 24px;
      background: transparent;
      color: #666;
      border: 2px solid transparent;
      border-radius: 10px;
      font-weight: 600;
      box-shadow: none;
      transition: all 0.3s ease;
    }
    .tab-button:hover {
      background: #f0f0f0;
      transform: none;
    }
    .tab-button.active {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4), 0 2px 8px rgba(2, 132, 199, 0.3);
    }
    .content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 35px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .section-header h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    .user-filter {
      display: flex;
      gap: 10px;
    }
    .filter-btn {
      padding: 8px 16px;
      background: #f0f0f0;
      color: #666;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: none;
    }
    .filter-btn:hover {
      background: #e0e0e0;
      transform: none;
    }
    .filter-btn.active {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4), 0 1px 4px rgba(2, 132, 199, 0.3);
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 16px;
    }
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    .user-card {
      background: white;
      border: 2px solid #e8e8e8;
      border-radius: 15px;
      padding: 25px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .user-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      border-color: #0ea5e9;
      background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
    }
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .user-header h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    .user-email {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
    }
    .user-number {
      color: #888;
      font-size: 13px;
      margin: 5px 0;
    }
    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-customer {
      background: #e3f2fd;
      color: #1976d2;
    }
    .badge-employee {
      background: #fff3e0;
      color: #f57c00;
    }
    .status-active {
      color: #28a745;
      font-weight: 600;
    }
    .status-blocked {
      color: #075985;
      font-weight: 600;
    }
    .status-pending {
      color: #ffc107;
    }
    .status-completed {
      color: #28a745;
    }
    .status-failed {
      color: #075985;
    }
    .user-details {
      margin-bottom: 15px;
    }
    .user-details p {
      margin: 8px 0;
      color: #555;
      font-size: 14px;
    }
    .user-actions {
      display: flex;
      gap: 10px;
    }
    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .btn-danger {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4), 0 2px 8px rgba(2, 132, 199, 0.3);
    }
    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
      box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5), 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    .btn-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }
    .accounts-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .account-card {
      background: white;
      border: 2px solid #e8e8e8;
      border-radius: 15px;
      padding: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .account-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      border-color: #0ea5e9;
      background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
    }
    .account-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
    }
    .account-info h3 {
      margin: 0 0 10px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    .account-info p {
      margin: 5px 0;
      color: #555;
      font-size: 14px;
    }
    .account-actions {
      margin-left: 20px;
    }
    .transactions-table {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
    }
    thead {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #0369a1 80%, #075985 100%);
      color: white;
    }
    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
    }
    tbody tr {
      border-bottom: 1px solid #e8e8e8;
      transition: background 0.2s ease;
    }
    tbody tr:hover {
      background: #f8f9fa;
    }
    td {
      padding: 15px;
      color: #555;
      font-size: 14px;
    }
    .amount-deposit {
      color: #28a745;
      font-weight: 600;
    }
    .amount-withdraw, .amount-transfer {
      color: #0369a1;
      font-weight: 600;
    }
  `]
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: any = null;
  activeTab = 'users';
  userFilter = 'all';

  tabs = [
    { id: 'users', label: 'Korisnici' },
    { id: 'accounts', label: 'Računi' },
    { id: 'transactions', label: 'Transakcije' }
  ];

  customers: User[] = [];
  employees: User[] = [];
  accounts: any[] = [];
  transactions: any[] = [];

  loadingUsers = false;
  loadingAccounts = false;
  loadingTransactions = false;
  processing = false;

  get filteredCustomers() {
    if (this.userFilter === 'employees') return [];
    return this.customers;
  }

  get filteredEmployees() {
    if (this.userFilter === 'customers') return [];
    return this.employees;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsers();
    this.loadAccounts();
    this.loadTransactions();
  }

  loadUsers() {
    this.loadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (data: any) => {
        this.customers = data.customers || [];
        this.employees = data.employees || [];
        this.loadingUsers = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.loadingUsers = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAccounts() {
    this.loadingAccounts = true;
    this.adminService.getAllAccounts().subscribe({
      next: (accounts: any[]) => {
        this.accounts = accounts || [];
        this.loadingAccounts = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading accounts:', err);
        this.loadingAccounts = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions() {
    this.loadingTransactions = true;
    this.adminService.getAllTransactions().subscribe({
      next: (transactions: any[]) => {
        this.transactions = transactions || [];
        this.loadingTransactions = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading transactions:', err);
        this.loadingTransactions = false;
        this.cdr.detectChanges();
      }
    });
  }

  blockCustomer(id: number) {
    this.processing = true;
    this.adminService.blockCustomer(id).subscribe({
      next: () => {
        this.loadUsers();
        this.processing = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error blocking customer:', err);
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  unblockCustomer(id: number) {
    this.processing = true;
    this.adminService.unblockCustomer(id).subscribe({
      next: () => {
        this.loadUsers();
        this.processing = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error unblocking customer:', err);
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  blockAccount(id: number) {
    this.processing = true;
    this.adminService.blockAccount(id).subscribe({
      next: () => {
        this.loadAccounts();
        this.processing = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error blocking account:', err);
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  activateAccount(id: number) {
    this.processing = true;
    this.adminService.activateAccount(id).subscribe({
      next: () => {
        this.loadAccounts();
        this.processing = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error activating account:', err);
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
