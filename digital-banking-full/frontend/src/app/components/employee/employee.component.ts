import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Account, AccountService, CreateAccountRequest } from '../../services/account.service';
import { AdminService, User } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Card, CardService } from '../../services/card.service';
import { Transaction, TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="employee-container">
      <div class="header">
        <h1>Employee Panel</h1>
        <div>
          <span class="user-info">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          <button (click)="logout()" class="logout-btn">Odjavi se</button>
        </div>
      </div>

      <div class="tabs">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab.id; onTabChange()"
          [class.active]="activeTab === tab.id"
          class="tab-button">
          {{ tab.label }}
        </button>
      </div>

      <div class="content">
        <!-- Tab: Klijenti -->
        <div *ngIf="activeTab === 'customers'" class="tab-content">
          <div class="section-header">
            <h2>Klijenti</h2>
            <div class="search-box">
              <input
                type="text"
                [(ngModel)]="customerSearchTerm"
                (input)="filterCustomers()"
                placeholder="Pretraži klijente (ime, email, broj)..."
                class="search-input">
            </div>
          </div>

          <div *ngIf="loadingCustomers" class="loading">Učitavanje klijenata...</div>

          <div *ngIf="!loadingCustomers && filteredCustomers.length === 0" class="no-data">
            Nema klijenata za prikaz.
          </div>

          <div *ngIf="!loadingCustomers" class="customers-grid">
            <div *ngFor="let customer of filteredCustomers" class="customer-card">
              <div class="customer-header">
                <div>
                  <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
                  <p class="customer-email">{{ customer.email }}</p>
                  <p class="customer-number">Broj: {{ customer.customerNumber }}</p>
                </div>
                <span class="badge badge-customer">Klijent</span>
              </div>
              <div class="customer-details">
                <p><strong>Telefon:</strong> {{ customer.phoneNumber }}</p>
                <p><strong>Status:</strong>
                  <span [class]="'status-' + (customer.active ? 'active' : 'blocked')">
                    {{ customer.active ? 'Aktivan' : 'Blokiran' }}
                  </span>
                </p>
              </div>
              <div class="customer-actions">
                <button
                  (click)="viewCustomerDetails(customer.id)"
                  class="btn-primary btn-sm">
                  Detalji
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Računi -->
        <div *ngIf="activeTab === 'accounts'" class="tab-content">
          <div class="section-header">
            <h2>Računi</h2>
            <button
              *ngIf="selectedCustomerId"
              (click)="showCreateAccountForm = !showCreateAccountForm"
              class="btn-primary">
              {{ showCreateAccountForm ? 'Otkaži' : 'Kreiraj račun' }}
            </button>
          </div>

          <div *ngIf="selectedCustomerId && showCreateAccountForm" class="create-account-form">
            <h4>Kreiraj novi račun za klijenta</h4>
            <form (ngSubmit)="onCreateAccount()" #accountForm="ngForm">
              <div class="form-group">
                <label>Klijent:</label>
                <select [(ngModel)]="selectedCustomerId" name="customerId" required disabled>
                  <option [value]="selectedCustomerId">{{ getSelectedCustomerName() }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="accountType">Tip računa:</label>
                <select
                  id="accountType"
                  name="accountType"
                  [(ngModel)]="newAccount.accountType"
                  required
                  #accountTypeInput="ngModel">
                  <option value="">Izaberi tip računa</option>
                  <option value="CHECKING">Tekući račun</option>
                  <option value="SAVINGS">Štedni račun</option>
                </select>
                <div *ngIf="accountTypeInput.invalid && accountTypeInput.touched" class="validation-error">
                  Tip računa je obavezan
                </div>
              </div>
              <button type="submit" [disabled]="loadingCreateAccount || accountForm.invalid" class="btn-submit">
                <span *ngIf="!loadingCreateAccount">Kreiraj račun</span>
                <span *ngIf="loadingCreateAccount">Kreiranje...</span>
              </button>
              <div *ngIf="createAccountError" class="error-message">{{ createAccountError }}</div>
              <div *ngIf="createAccountSuccess" class="success-message">{{ createAccountSuccess }}</div>
            </form>
          </div>

          <div *ngIf="!selectedCustomerId" class="info-box">
            <p>Izaberite klijenta da biste videli njegove račune ili kreirajte novi račun.</p>
            <select [(ngModel)]="selectedCustomerId" (change)="onCustomerSelected()" class="customer-select">
              <option value="">Izaberi klijenta...</option>
              <option *ngFor="let customer of customers" [value]="customer.id">
                {{ customer.firstName }} {{ customer.lastName }} ({{ customer.customerNumber }})
              </option>
            </select>
          </div>

          <div *ngIf="selectedCustomerId && !showCreateAccountForm">
            <div *ngIf="loadingAccounts" class="loading">Učitavanje računa...</div>
            <div *ngIf="!loadingAccounts && customerAccounts.length === 0" class="no-data">
              Klijent nema račune.
            </div>
            <div *ngIf="!loadingAccounts && customerAccounts.length > 0" class="accounts-list">
              <div *ngFor="let account of customerAccounts" class="account-card">
                <div class="account-info">
                  <div>
                    <h3>Račun: {{ account.accountNumber }}</h3>
                    <p><strong>Tip:</strong> {{ account.accountType }}</p>
                    <p><strong>Stanje:</strong> {{ account.balance | number:'1.2-2' }} RSD</p>
                  </div>
                  <span [class]="'badge status-' + (account.status || 'unknown')?.toLowerCase()">
                    {{ account.status }}
                  </span>
                </div>
                <div class="account-actions">
                  <button
                    *ngIf="account.status === 'ACTIVE' && account.id"
                    (click)="blockAccount(account.id!)"
                    [disabled]="processing"
                    class="btn-danger btn-sm">
                    Blokiraj račun
                  </button>
                  <button
                    *ngIf="account.status === 'BLOCKED' && account.id"
                    (click)="activateAccount(account.id!)"
                    [disabled]="processing"
                    class="btn-success btn-sm">
                    Aktiviraj račun
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Transakcije -->
        <div *ngIf="activeTab === 'transactions'" class="tab-content">
          <div class="section-header">
            <h2>Transakcije</h2>
          </div>

          <div *ngIf="!selectedCustomerId" class="info-box">
            <p>Izaberite klijenta da biste videli njegove transakcije.</p>
            <select [(ngModel)]="selectedCustomerId" (change)="onCustomerSelected()" class="customer-select">
              <option value="">Izaberi klijenta...</option>
              <option *ngFor="let customer of customers" [value]="customer.id">
                {{ customer.firstName }} {{ customer.lastName }} ({{ customer.customerNumber }})
              </option>
            </select>
          </div>

          <div *ngIf="selectedCustomerId">
            <div *ngIf="loadingTransactions" class="loading">Učitavanje transakcija...</div>
            <div *ngIf="!loadingTransactions && customerTransactions.length === 0" class="no-data">
              Klijent nema transakcija.
            </div>
            <div *ngIf="!loadingTransactions && customerTransactions.length > 0" class="transactions-table">
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
                  <tr *ngFor="let transaction of customerTransactions">
                    <td>{{ transaction.id }}</td>
                    <td>{{ transaction.type || transaction.transactionType }}</td>
                    <td [class]="'amount-' + (transaction.type || transaction.transactionType || '').toLowerCase()">
                      {{ transaction.amount | number:'1.2-2' }} RSD
                    </td>
                    <td>
                      <span [class]="'badge status-' + (transaction.status || '').toLowerCase()">
                        {{ transaction.status }}
                      </span>
                    </td>
                    <td>{{ getAccountNumber(transaction.fromAccount, transaction.fromAccountId) }}</td>
                    <td>{{ getAccountNumber(transaction.toAccount, transaction.toAccountId) }}</td>
                    <td>{{ formatDate(transaction.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Kartice -->
        <div *ngIf="activeTab === 'cards'" class="tab-content">
          <div class="section-header">
            <h2>Kartice</h2>
            <button
              *ngIf="selectedCustomerId"
              (click)="toggleCreateCardForm()"
              class="btn-primary">
              {{ showCreateCardForm ? 'Otkaži' : 'Kreiraj karticu' }}
            </button>
          </div>

          <div *ngIf="selectedCustomerId && showCreateCardForm" class="create-card-form">
            <h4>Kreiraj novu karticu za klijenta</h4>
            <form (ngSubmit)="onCreateCard()" #cardForm="ngForm">
              <div class="form-group">
                <label>Klijent:</label>
                <input type="text" [value]="getSelectedCustomerName()" disabled class="form-group input">
              </div>
              <div class="form-group">
                <label for="cardAccountId">Račun:</label>
                <select
                  id="cardAccountId"
                  name="cardAccountId"
                  [(ngModel)]="newCard.accountId"
                  required
                  #cardAccountInput="ngModel">
                  <option value="">Izaberi račun</option>
                  <option *ngFor="let account of customerAccounts" [value]="account.id">
                    {{ account.accountNumber }} - {{ account.accountType }} ({{ account.balance | number:'1.2-2' }} RSD)
                  </option>
                </select>
                <div *ngIf="cardAccountInput.invalid && cardAccountInput.touched" class="validation-error">
                  Račun je obavezan
                </div>
              </div>
              <div class="form-group">
                <label for="cardType">Tip kartice:</label>
                <select
                  id="cardType"
                  name="cardType"
                  [(ngModel)]="newCard.cardType"
                  required
                  #cardTypeInput="ngModel">
                  <option value="">Izaberi tip kartice</option>
                  <option value="DEBIT">Debitna</option>
                  <option value="CREDIT">Kreditna</option>
                </select>
                <div *ngIf="cardTypeInput.invalid && cardTypeInput.touched" class="validation-error">
                  Tip kartice je obavezan
                </div>
              </div>
              <button type="submit" [disabled]="loadingCreateCard || cardForm.invalid" class="btn-submit">
                <span *ngIf="!loadingCreateCard">Kreiraj karticu</span>
                <span *ngIf="loadingCreateCard">Kreiranje...</span>
              </button>
              <div *ngIf="createCardError" class="error-message">{{ createCardError }}</div>
              <div *ngIf="createCardSuccess" class="success-message">{{ createCardSuccess }}</div>
            </form>
          </div>

          <div *ngIf="!selectedCustomerId" class="info-box">
            <p>Izaberite klijenta da biste videli njegove kartice ili kreirajte novu karticu.</p>
            <select [(ngModel)]="selectedCustomerId" (change)="onCustomerSelected()" class="customer-select">
              <option value="">Izaberi klijenta...</option>
              <option *ngFor="let customer of customers" [value]="customer.id">
                {{ customer.firstName }} {{ customer.lastName }} ({{ customer.customerNumber }})
              </option>
            </select>
          </div>

          <div *ngIf="selectedCustomerId && !showCreateCardForm">
            <div *ngIf="loadingCards" class="loading">Učitavanje kartica...</div>
            <div *ngIf="!loadingCards && customerCards.length === 0" class="no-data">
              Klijent nema kartica.
            </div>
            <div *ngIf="!loadingCards && customerCards.length > 0" class="cards-grid">
              <div *ngFor="let card of customerCards" class="card-item">
                <div class="card-number">{{ formatCardNumber(card.cardNumber) }}</div>
                <div class="card-type">{{ card.cardType }}</div>
                <div class="card-expiry">Ističe: {{ card.expiryDate }}</div>
                <div class="card-status" [class]="'status-' + card.status.toLowerCase()">
                  {{ card.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employee-container {
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
    .search-box {
      display: flex;
      gap: 10px;
    }
    .search-input, .customer-select {
      padding: 10px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      min-width: 300px;
      transition: all 0.3s ease;
    }
    .search-input:focus, .customer-select:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }
    .loading, .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 16px;
    }
    .info-box {
      padding: 30px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
      border-radius: 15px;
      margin-bottom: 30px;
      border: 2px solid rgba(14, 165, 233, 0.2);
    }
    .info-box p {
      margin-bottom: 15px;
      color: #0369a1;
      font-weight: 500;
    }
    .customers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }
    .customer-card {
      background: white;
      border: 2px solid #e8e8e8;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }
    .customer-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border-color: #0ea5e9;
    }
    .customer-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
    }
    .customer-header h3 {
      margin: 0 0 8px 0;
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    .customer-email, .customer-number {
      margin: 4px 0;
      font-size: 14px;
      color: #666;
    }
    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-customer {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
    }
    .customer-details {
      margin-bottom: 20px;
    }
    .customer-details p {
      margin: 8px 0;
      color: #555;
      font-size: 14px;
    }
    .customer-actions {
      display: flex;
      gap: 10px;
    }
    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .btn-primary {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
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
    .status-active {
      color: #28a745;
      font-weight: 600;
    }
    .status-blocked {
      color: #075985;
      font-weight: 600;
    }
    .create-account-form, .create-card-form {
      border: 2px solid rgba(14, 165, 233, 0.3);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }
    .create-account-form h4, .create-card-form h4 {
      margin-top: 0;
      margin-bottom: 20px;
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 600;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group select, .form-group input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      box-sizing: border-box;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      background: white;
      transition: all 0.3s ease;
    }
    .form-group select:focus, .form-group input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }
    .btn-submit {
      padding: 14px 28px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
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
    .success-message {
      color: #28a745;
      margin-top: 15px;
      padding: 14px;
      background-color: #e6ffe6;
      border: 2px solid #99ff99;
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
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }
    .account-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      border-color: #0ea5e9;
    }
    .account-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .account-info h3 {
      margin: 0 0 10px 0;
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    .account-info p {
      margin: 6px 0;
      color: #555;
      font-size: 14px;
    }
    .account-actions {
      display: flex;
      gap: 10px;
    }
    .transactions-table {
      overflow-x: auto;
    }
    .transactions-table table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    }
    .transactions-table thead {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      color: white;
    }
    .transactions-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .transactions-table td {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      color: #555;
      font-size: 14px;
    }
    .transactions-table tbody tr:hover {
      background: #f8f9fa;
    }
    .amount-deposit {
      color: #28a745;
      font-weight: 600;
    }
    .amount-withdraw, .amount-transfer {
      color: #0369a1;
      font-weight: 600;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }
    .card-item {
      border: none;
      border-radius: 15px;
      padding: 25px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #0369a1 80%, #075985 100%);
      color: white;
      box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4), 0 4px 12px rgba(2, 132, 199, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .card-item::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      transition: transform 0.5s ease;
    }
    .card-item:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 12px 35px rgba(14, 165, 233, 0.5), 0 8px 20px rgba(2, 132, 199, 0.4);
    }
    .card-number {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 15px;
      letter-spacing: 3px;
      font-family: 'Inter', sans-serif;
    }
    .card-type, .card-expiry {
      font-size: 14px;
      margin-bottom: 8px;
      opacity: 0.9;
      font-weight: 500;
    }
    .card-status {
      margin-top: 15px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }
  `]
})
export class EmployeeComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private accountService = inject(AccountService);
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: any = null;
  activeTab = 'customers';

  tabs = [
    { id: 'customers', label: 'Klijenti' },
    { id: 'accounts', label: 'Računi' },
    { id: 'transactions', label: 'Transakcije' },
    { id: 'cards', label: 'Kartice' }
  ];

  customers: User[] = [];
  filteredCustomers: User[] = [];
  customerSearchTerm = '';
  selectedCustomerId: number | null = null;

  customerAccounts: Account[] = [];
  customerTransactions: Transaction[] = [];
  customerCards: Card[] = [];

  loadingCustomers = false;
  loadingAccounts = false;
  loadingTransactions = false;
  loadingCards = false;
  processing = false;

  showCreateAccountForm = false;
  showCreateCardForm = false;
  loadingCreateAccount = false;
  loadingCreateCard = false;
  createAccountError = '';
  createAccountSuccess = '';
  createCardError = '';
  createCardSuccess = '';

  newAccount: { accountType: string } = { accountType: '' };
  newCard: { accountId?: number; cardType: string } = { cardType: '' };

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.authService.isEmployee() && !this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadCustomers();
  }

  loadCustomers() {
    this.loadingCustomers = true;
    this.adminService.getAllUsers().subscribe({
      next: (data: any) => {
        this.customers = data.customers || [];
        this.filteredCustomers = this.customers;
        this.loadingCustomers = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading customers:', err);
        this.loadingCustomers = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterCustomers() {
    if (!this.customerSearchTerm.trim()) {
      this.filteredCustomers = this.customers;
      return;
    }

    const search = this.customerSearchTerm.toLowerCase().trim();
    this.filteredCustomers = this.customers.filter(customer =>
      customer.firstName.toLowerCase().includes(search) ||
      customer.lastName.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      (customer.customerNumber && customer.customerNumber.toLowerCase().includes(search))
    );
  }

  viewCustomerDetails(customerId: number) {
    this.selectedCustomerId = customerId;
    // Automatski prebaci na tab sa računima
    this.activeTab = 'accounts';
    this.loadCustomerAccounts();
  }

  onCustomerSelected() {
    if (!this.selectedCustomerId) {
      this.customerAccounts = [];
      this.customerTransactions = [];
      this.customerCards = [];
      return;
    }

    // Konvertuj u broj ako je string (iz select-a)
    if (typeof this.selectedCustomerId === 'string') {
      this.selectedCustomerId = Number(this.selectedCustomerId);
    }

    // Učitaj podatke na osnovu aktivnog taba
    if (this.activeTab === 'accounts') {
      this.loadCustomerAccounts();
    } else if (this.activeTab === 'transactions') {
      this.loadCustomerTransactions();
    } else if (this.activeTab === 'cards') {
      // Učitaj i račune jer su potrebni za kreiranje kartice
      this.loadCustomerAccounts();
      this.loadCustomerCards();
    }
  }

  onTabChange() {
    // Kada se promeni tab, učitaj odgovarajuće podatke ako je klijent izabran
    if (this.selectedCustomerId) {
      if (this.activeTab === 'accounts') {
        this.loadCustomerAccounts();
      } else if (this.activeTab === 'transactions') {
        this.loadCustomerTransactions();
      } else if (this.activeTab === 'cards') {
        // Učitaj i račune jer su potrebni za kreiranje kartice
        if (this.customerAccounts.length === 0) {
          this.loadCustomerAccounts();
        }
        this.loadCustomerCards();
      }
    }
  }

  loadCustomerAccounts() {
    if (!this.selectedCustomerId) return;

    this.loadingAccounts = true;
    this.accountService.getAccountsByCustomer(this.selectedCustomerId).subscribe({
      next: (accounts: Account[]) => {
        this.customerAccounts = accounts || [];
        this.loadingAccounts = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading customer accounts:', err);
        this.loadingAccounts = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomerTransactions() {
    if (!this.selectedCustomerId) return;

    this.loadingTransactions = true;
    // Učitaj transakcije za sve račune klijenta
    this.accountService.getAccountsByCustomer(this.selectedCustomerId).subscribe({
      next: (accounts: Account[]) => {
        if (accounts.length === 0) {
          this.customerTransactions = [];
          this.loadingTransactions = false;
          this.cdr.detectChanges();
          return;
        }

        let loadedCount = 0;
        this.customerTransactions = [];

        accounts.forEach(account => {
          this.transactionService.getTransactionsByAccount(account.id!).subscribe({
            next: (transactions: Transaction[]) => {
              this.customerTransactions = [...this.customerTransactions, ...transactions];
              loadedCount++;
              if (loadedCount === accounts.length) {
                // Sortiraj po datumu
                this.customerTransactions = this.customerTransactions.sort((a, b) =>
                  new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                this.loadingTransactions = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              loadedCount++;
              if (loadedCount === accounts.length) {
                this.loadingTransactions = false;
                this.cdr.detectChanges();
              }
            }
          });
        });
      },
      error: (err: any) => {
        console.error('Error loading customer transactions:', err);
        this.loadingTransactions = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomerCards() {
    if (!this.selectedCustomerId) return;

    this.loadingCards = true;
    // Prvo učitaj račune, pa onda kartice za svaki račun
    this.accountService.getAccountsByCustomer(this.selectedCustomerId).subscribe({
      next: (accounts: Account[]) => {
        if (accounts.length === 0) {
          this.customerCards = [];
          this.loadingCards = false;
          this.cdr.detectChanges();
          return;
        }

        let loadedCount = 0;
        this.customerCards = [];

        accounts.forEach(account => {
          this.cardService.getCardsByAccount(account.id!).subscribe({
            next: (cards: Card[]) => {
              this.customerCards = [...this.customerCards, ...cards];
              loadedCount++;
              if (loadedCount === accounts.length) {
                this.loadingCards = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              loadedCount++;
              if (loadedCount === accounts.length) {
                this.loadingCards = false;
                this.cdr.detectChanges();
              }
            }
          });
        });
      },
      error: (err: any) => {
        console.error('Error loading customer cards:', err);
        this.loadingCards = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCreateAccount() {
    if (!this.selectedCustomerId || !this.newAccount.accountType) {
      this.createAccountError = 'Molimo unesite ispravne podatke.';
      return;
    }

    this.loadingCreateAccount = true;
    this.createAccountError = '';
    this.createAccountSuccess = '';

    const accountRequest: CreateAccountRequest = {
      accountType: this.newAccount.accountType.toUpperCase(),
      customerId: this.selectedCustomerId
    };

    this.accountService.createAccount(accountRequest).subscribe({
      next: () => {
        this.loadingCreateAccount = false;
        this.createAccountSuccess = 'Račun je uspešno kreiran!';
        this.showCreateAccountForm = false;
        this.newAccount = { accountType: '' };
        this.loadCustomerAccounts();
        setTimeout(() => {
          this.createAccountSuccess = '';
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loadingCreateAccount = false;
        console.error('Create account error:', err);
        if (err.error?.message) {
          this.createAccountError = err.error.message;
        } else {
          this.createAccountError = 'Greška pri kreiranju računa.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  toggleCreateCardForm() {
    this.showCreateCardForm = !this.showCreateCardForm;
    // Kada se otvori forma, učitaj račune ako već nisu učitani
    if (this.showCreateCardForm && this.selectedCustomerId) {
      if (this.customerAccounts.length === 0) {
        this.loadCustomerAccounts();
      }
    }
  }

  onCreateCard() {
    if (!this.selectedCustomerId || !this.newCard.accountId || !this.newCard.cardType) {
      this.createCardError = 'Molimo unesite ispravne podatke.';
      return;
    }

    this.loadingCreateCard = true;
    this.createCardError = '';
    this.createCardSuccess = '';

    // Konvertuj accountId u number (iz select-a dolazi kao string)
    const accountId = typeof this.newCard.accountId === 'string'
      ? Number(this.newCard.accountId)
      : this.newCard.accountId;

    // Proveri da li je accountId validan broj
    if (!accountId || isNaN(accountId)) {
      this.loadingCreateCard = false;
      this.createCardError = 'Neispravan ID računa.';
      this.cdr.detectChanges();
      return;
    }

    // Pošalji samo accountId i cardType - backend će generisati sve ostalo
    const cardRequest = {
      accountId: accountId,
      cardType: this.newCard.cardType.toUpperCase()
    };

    console.log('Sending card request:', cardRequest);

    this.cardService.createCard(cardRequest as any).subscribe({
      next: () => {
        this.loadingCreateCard = false;
        this.createCardSuccess = 'Kartica je uspešno kreirana!';
        this.showCreateCardForm = false;
        this.newCard = { cardType: '' };
        this.loadCustomerCards();
        setTimeout(() => {
          this.createCardSuccess = '';
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loadingCreateCard = false;
        console.error('Create card error:', err);
        console.error('Error details:', err.error);

        // Prikaži detaljne greške validacije ako postoje
        if (err.error?.errors) {
          const validationErrors = Object.values(err.error.errors).join(', ');
          this.createCardError = `Greška validacije: ${validationErrors}`;
        } else if (err.error?.message) {
          this.createCardError = err.error.message;
        } else if (err.error?.error) {
          this.createCardError = `${err.error.error}: ${err.error.message || 'Invalid input data'}`;
        } else {
          this.createCardError = 'Greška pri kreiranju kartice.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  blockAccount(id: number) {
    this.processing = true;
    this.adminService.blockAccount(id).subscribe({
      next: () => {
        this.loadCustomerAccounts();
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
        this.loadCustomerAccounts();
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

  getSelectedCustomerName(): string {
    if (!this.selectedCustomerId) return '';
    // Konvertuj u broj ako je string (iz select-a)
    const customerId = typeof this.selectedCustomerId === 'string'
      ? Number(this.selectedCustomerId)
      : this.selectedCustomerId;
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : '';
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

  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  getAccountNumber(account: any, accountId?: number): string {
    if (account && (account as any).accountNumber) {
      return (account as any).accountNumber;
    }
    if (accountId) {
      return accountId.toString();
    }
    return '-';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

