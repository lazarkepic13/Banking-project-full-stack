import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Account, AccountService, CreateAccountRequest } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { Card, CardService } from '../../services/card.service';
import { Transaction, TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Digital Banking</h1>
        <div>
          <span class="user-info">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          <button (click)="logout()">Odjavi se</button>
        </div>
      </div>

      <div class="content">
        <h2>Dobrodošli na početnu stranicu!</h2>

        <!-- Računi -->
        <div class="section">
          <div class="section-header">
            <h3>Moji računi</h3>
            <button (click)="showCreateAccountForm = !showCreateAccountForm" class="btn-primary">
              {{ showCreateAccountForm ? 'Otkaži' : 'Dodaj novi račun' }}
            </button>
          </div>

          <!-- Forma za kreiranje računa -->
          <div *ngIf="showCreateAccountForm" class="create-account-form">
            <h4>Kreiraj novi račun</h4>
            <form (ngSubmit)="onCreateAccount()" #accountForm="ngForm">
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

          <div *ngIf="loadingAccounts" class="loading">Učitavanje...</div>
          <div *ngIf="!loadingAccounts && accounts.length === 0" class="no-data">
            Nemate nijedan račun.
          </div>
          <div class="accounts-grid" *ngIf="!loadingAccounts && accounts.length > 0">
            <div *ngFor="let account of accounts" class="account-card">
              <div class="account-header">
                <span class="account-number">{{ account.accountNumber }}</span>
                <span class="account-type">{{ account.accountType }}</span>
              </div>
              <div class="account-balance">
                {{ account.balance | number:'1.2-2' }} RSD
              </div>
              <div class="account-status" [class]="'status-' + account.status?.toLowerCase()">
                {{ account.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Kartice -->
        <div class="section">
          <h3>Moje kartice</h3>
          <div *ngIf="loadingCards" class="loading">Učitavanje...</div>
          <div *ngIf="!loadingCards && cards.length === 0" class="no-data">
            Nemate nijednu karticu.
          </div>
          <div class="cards-grid" *ngIf="!loadingCards && cards.length > 0">
            <div *ngFor="let card of cards" class="card-item">
              <div class="card-number">{{ formatCardNumber(card.cardNumber) }}</div>
              <div class="card-type">{{ card.cardType }}</div>
              <div class="card-expiry">Ističe: {{ card.expiryDate }}</div>
              <div class="card-status" [class]="'status-' + card.status.toLowerCase()">
                {{ card.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Nova transakcija -->
        <div class="section">
          <div class="section-header">
            <h3>Nova transakcija</h3>
            <button
              (click)="showTransactionForm = !showTransactionForm"
              class="btn-primary">
              {{ showTransactionForm ? 'Otkaži' : 'Kreiraj transakciju' }}
            </button>
          </div>

          <div *ngIf="showTransactionForm" class="transaction-form-container">
            <div class="transaction-tabs">
              <button
                (click)="activeTransactionType = 'deposit'"
                [class.active]="activeTransactionType === 'deposit'"
                class="transaction-tab">
                Ulog
              </button>
              <button
                (click)="activeTransactionType = 'withdraw'"
                [class.active]="activeTransactionType === 'withdraw'"
                class="transaction-tab">
                Podizanje
              </button>
              <button
                (click)="activeTransactionType = 'transfer'"
                [class.active]="activeTransactionType === 'transfer'"
                class="transaction-tab">
                Prenos
              </button>
            </div>

            <!-- DEPOSIT Forma -->
            <div *ngIf="activeTransactionType === 'deposit'" class="transaction-form">
              <h4>Ulog novca</h4>
              <form (ngSubmit)="onDeposit()" #depositForm="ngForm">
                <div class="form-group">
                  <label for="depositAccount">Račun:</label>
                  <select
                    id="depositAccount"
                    name="depositAccount"
                    [(ngModel)]="depositFormData.accountId"
                    required
                    #depositAccountInput="ngModel">
                    <option value="">Izaberi račun</option>
                    <option *ngFor="let account of activeAccounts" [value]="account.id">
                      {{ account.accountNumber }} - {{ account.accountType }} ({{ account.balance | number:'1.2-2' }} RSD)
                    </option>
                  </select>
                  <div *ngIf="depositAccountInput.invalid && depositAccountInput.touched" class="validation-error">
                    Račun je obavezan
                  </div>
                </div>
                <div class="form-group">
                  <label for="depositAmount">Iznos (RSD):</label>
                  <input
                    type="number"
                    id="depositAmount"
                    name="depositAmount"
                    [(ngModel)]="depositFormData.amount"
                    required
                    min="0.01"
                    step="0.01"
                    #depositAmountInput="ngModel"
                    placeholder="0.00">
                  <div *ngIf="depositAmountInput.invalid && depositAmountInput.touched" class="validation-error">
                    Iznos mora biti veći od 0
                  </div>
                </div>
                <div class="form-group">
                  <label for="depositDescription">Opis (opciono):</label>
                  <input
                    type="text"
                    id="depositDescription"
                    name="depositDescription"
                    [(ngModel)]="depositFormData.description"
                    placeholder="Opis transakcije">
                </div>
                <button type="submit" [disabled]="loadingTransaction || depositForm.invalid" class="btn-submit">
                  <span *ngIf="!loadingTransaction">Ulog novca</span>
                  <span *ngIf="loadingTransaction">Procesiranje...</span>
                </button>
                <div *ngIf="transactionError" class="error-message">{{ transactionError }}</div>
                <div *ngIf="transactionSuccess" class="success-message">{{ transactionSuccess }}</div>
              </form>
            </div>

            <!-- WITHDRAW Forma -->
            <div *ngIf="activeTransactionType === 'withdraw'" class="transaction-form">
              <h4>Podizanje novca</h4>
              <form (ngSubmit)="onWithdraw()" #withdrawForm="ngForm">
                <div class="form-group">
                  <label for="withdrawAccount">Račun:</label>
                  <select
                    id="withdrawAccount"
                    name="withdrawAccount"
                    [(ngModel)]="withdrawFormData.accountId"
                    required
                    #withdrawAccountInput="ngModel">
                    <option value="">Izaberi račun</option>
                    <option *ngFor="let account of activeAccounts" [value]="account.id">
                      {{ account.accountNumber }} - {{ account.accountType }} ({{ account.balance | number:'1.2-2' }} RSD)
                    </option>
                  </select>
                  <div *ngIf="withdrawAccountInput.invalid && withdrawAccountInput.touched" class="validation-error">
                    Račun je obavezan
                  </div>
                </div>
                <div class="form-group">
                  <label for="withdrawAmount">Iznos (RSD):</label>
                  <input
                    type="number"
                    id="withdrawAmount"
                    name="withdrawAmount"
                    [(ngModel)]="withdrawFormData.amount"
                    required
                    min="0.01"
                    step="0.01"
                    #withdrawAmountInput="ngModel"
                    placeholder="0.00">
                  <div *ngIf="withdrawAmountInput.invalid && withdrawAmountInput.touched" class="validation-error">
                    Iznos mora biti veći od 0
                  </div>
                  <div *ngIf="withdrawFormData.accountId && withdrawFormData.amount && getAccountBalance(withdrawFormData.accountId) < withdrawFormData.amount"
                       class="validation-error">
                    Nemate dovoljno sredstava na računu
                  </div>
                </div>
                <div class="form-group">
                  <label for="withdrawDescription">Opis (opciono):</label>
                  <input
                    type="text"
                    id="withdrawDescription"
                    name="withdrawDescription"
                    [(ngModel)]="withdrawFormData.description"
                    placeholder="Opis transakcije">
                </div>
                <button type="submit" [disabled]="loadingTransaction || withdrawForm.invalid || (withdrawFormData.accountId && withdrawFormData.amount && getAccountBalance(withdrawFormData.accountId) < withdrawFormData.amount)" class="btn-submit">
                  <span *ngIf="!loadingTransaction">Podigni novac</span>
                  <span *ngIf="loadingTransaction">Procesiranje...</span>
                </button>
                <div *ngIf="transactionError" class="error-message">{{ transactionError }}</div>
                <div *ngIf="transactionSuccess" class="success-message">{{ transactionSuccess }}</div>
              </form>
            </div>

            <!-- TRANSFER Forma -->
            <div *ngIf="activeTransactionType === 'transfer'" class="transaction-form">
              <h4>Prenos novca</h4>
              <form (ngSubmit)="onTransfer()" #transferForm="ngForm">
                <div class="form-group">
                  <label for="transferFromAccount">Sa računa:</label>
                  <select
                    id="transferFromAccount"
                    name="transferFromAccount"
                    [(ngModel)]="transferFormData.fromAccountId"
                    required
                    #transferFromAccountInput="ngModel">
                    <option value="">Izaberi račun</option>
                    <option *ngFor="let account of activeAccounts" [value]="account.id">
                      {{ account.accountNumber }} - {{ account.accountType }} ({{ account.balance | number:'1.2-2' }} RSD)
                    </option>
                  </select>
                  <div *ngIf="transferFromAccountInput.invalid && transferFromAccountInput.touched" class="validation-error">
                    Račun je obavezan
                  </div>
                </div>
                <div class="form-group">
                  <label for="transferToAccount">Na račun:</label>
                  <select
                    id="transferToAccount"
                    name="transferToAccount"
                    [(ngModel)]="transferFormData.toAccountId"
                    required
                    #transferToAccountInput="ngModel">
                    <option value="">Izaberi račun</option>
                    <option *ngFor="let account of activeAccounts" [value]="account.id">
                      {{ account.accountNumber }} - {{ account.accountType }} ({{ account.balance | number:'1.2-2' }} RSD)
                    </option>
                  </select>
                  <div *ngIf="transferToAccountInput.invalid && transferToAccountInput.touched" class="validation-error">
                    Račun je obavezan
                  </div>
                  <div *ngIf="transferFormData.fromAccountId && transferFormData.toAccountId && transferFormData.fromAccountId.toString() === transferFormData.toAccountId.toString()"
                       class="validation-error">
                    Račun pošiljoca i primaoca ne mogu biti isti
                  </div>
                </div>
                <div class="form-group">
                  <label for="transferAmount">Iznos (RSD):</label>
                  <input
                    type="number"
                    id="transferAmount"
                    name="transferAmount"
                    [(ngModel)]="transferFormData.amount"
                    required
                    min="0.01"
                    step="0.01"
                    #transferAmountInput="ngModel"
                    placeholder="0.00">
                  <div *ngIf="transferAmountInput.invalid && transferAmountInput.touched" class="validation-error">
                    Iznos mora biti veći od 0
                  </div>
                  <div *ngIf="transferFormData.fromAccountId && transferFormData.amount && getAccountBalance(transferFormData.fromAccountId) < transferFormData.amount"
                       class="validation-error">
                    Nemate dovoljno sredstava na računu
                  </div>
                </div>
                <div class="form-group">
                  <label for="transferDescription">Opis (opciono):</label>
                  <input
                    type="text"
                    id="transferDescription"
                    name="transferDescription"
                    [(ngModel)]="transferFormData.description"
                    placeholder="Opis transakcije">
                </div>
                <button type="submit" [disabled]="loadingTransaction || transferForm.invalid || (transferFormData.fromAccountId && transferFormData.amount && getAccountBalance(transferFormData.fromAccountId) < transferFormData.amount) || (transferFormData.fromAccountId === transferFormData.toAccountId)" class="btn-submit">
                  <span *ngIf="!loadingTransaction">Prenesi novac</span>
                  <span *ngIf="loadingTransaction">Procesiranje...</span>
                </button>
                <div *ngIf="transactionError" class="error-message">{{ transactionError }}</div>
                <div *ngIf="transactionSuccess" class="success-message">{{ transactionSuccess }}</div>
              </form>
            </div>
          </div>
        </div>

        <!-- Transakcije -->
        <div class="section">
          <h3>Poslednje transakcije</h3>
          <div *ngIf="loadingTransactions" class="loading">Učitavanje...</div>
          <div *ngIf="!loadingTransactions && transactions.length === 0" class="no-data">
            Nemate nijednu transakciju.
          </div>
          <div class="transactions-list" *ngIf="!loadingTransactions && transactions.length > 0">
            <div *ngFor="let transaction of transactions" class="transaction-item">
              <div class="transaction-info">
                <span class="transaction-type">{{ transaction.transactionType || transaction.type }}</span>
                <span class="transaction-date">{{ formatDate(transaction.createdAt) }}</span>
              </div>
              <div class="transaction-amount" [class]="'amount-' + (transaction.transactionType || transaction.type || '').toLowerCase()">
                {{ (transaction.transactionType || transaction.type) === 'DEPOSIT' ? '+' : '-' }}{{ transaction.amount | number:'1.2-2' }} RSD
              </div>
              <div class="transaction-status" [class]="'status-' + (transaction.status || '').toLowerCase()">
                {{ transaction.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      position: relative;
      z-index: 1;
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
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
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
    .content {
      padding: 0;
    }
    .content h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 600;
      color: white;
      text-align: center;
      margin-bottom: 40px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    .user-info {
      margin-right: 20px;
      font-weight: 600;
      font-size: 16px;
      color: #555;
      font-family: 'Inter', sans-serif;
    }
    .section {
      margin-bottom: 40px;
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
    .section h3 {
      margin: 0;
      font-family: 'Poppins', sans-serif;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    .btn-primary, .btn-add {
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
    .btn-primary:hover, .btn-add:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
      box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5), 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    .create-account-form {
      border: 2px solid rgba(14, 165, 233, 0.3);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }
    .create-account-form h4 {
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
    .form-group select, .form-group input[type="number"], .form-group input[type="text"] {
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
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15), 0 0 0 6px rgba(56, 189, 248, 0.1);
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
    .btn-submit:disabled {
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
    .loading, .no-data {
      padding: 40px 20px;
      text-align: center;
      color: #888;
      font-size: 16px;
      font-weight: 500;
    }
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }
    .account-card {
      border: 2px solid #e8e8e8;
      border-radius: 15px;
      padding: 30px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }
    .account-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e8e8e8;
    }
    .account-number {
      font-weight: 700;
      font-size: 20px;
      color: #333;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.5px;
    }
    .account-type {
      color: #0ea5e9;
      font-size: 13px;
      font-weight: 600;
      background: #f0f4ff;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .account-balance {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 15px;
      font-family: 'Inter', sans-serif;
    }
    .account-status, .card-status, .transaction-status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-active {
      background-color: #d4edda;
      color: #155724;
    }
    .status-inactive, .status-blocked {
      background-color: #f8d7da;
      color: #721c24;
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
    .card-item:hover::before {
      transform: rotate(45deg);
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
    .transaction-form-container {
      border: 2px solid rgba(14, 165, 233, 0.3);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }
    .transaction-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      border-bottom: 2px solid rgba(14, 165, 233, 0.2);
      padding-bottom: 10px;
    }
    .transaction-tab {
      padding: 12px 24px;
      background: transparent;
      color: #0369a1;
      border: none;
      border-bottom: 3px solid transparent;
      border-radius: 0;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      box-shadow: none;
    }
    .transaction-tab:hover {
      background: rgba(14, 165, 233, 0.1);
      transform: none;
    }
    .transaction-tab.active {
      color: #0ea5e9;
      border-bottom-color: #0ea5e9;
      background: rgba(14, 165, 233, 0.15);
    }
    .transaction-form {
      padding-top: 20px;
    }
    .transaction-form h4 {
      margin-top: 0;
      margin-bottom: 25px;
      font-family: 'Poppins', sans-serif;
      font-size: 22px;
      font-weight: 600;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .transaction-item {
      border: 2px solid #e8e8e8;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .transaction-item:hover {
      transform: translateX(5px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      border-color: #0ea5e9;
      background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
    }
    .transaction-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .transaction-type {
      font-weight: 600;
      color: #333;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
    }
    .transaction-date {
      font-size: 13px;
      color: #888;
      font-weight: 500;
    }
    .transaction-amount {
      font-size: 22px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
    }
    .amount-deposit {
      color: #28a745;
    }
    .amount-withdrawal, .amount-transfer {
      color: #e74c3c;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: any = null;
  accounts: Account[] = [];
  cards: Card[] = [];
  transactions: Transaction[] = [];
  loadingAccounts = false;
  loadingCards = false;
  loadingTransactions = false;

  // Forma za kreiranje računa
  showCreateAccountForm = false;
  newAccount: Account = {
    accountType: '',
    balance: 0
  };
  loadingCreateAccount = false;
  createAccountError = '';
  createAccountSuccess = '';

  // Forme za transakcije
  showTransactionForm = false;
  activeTransactionType: 'deposit' | 'withdraw' | 'transfer' = 'deposit';
  loadingTransaction = false;
  transactionError = '';
  transactionSuccess = '';

  depositFormData = {
    accountId: null as number | null,
    amount: null as number | null,
    description: ''
  };

  withdrawFormData = {
    accountId: null as number | null,
    amount: null as number | null,
    description: ''
  };

  transferFormData = {
    fromAccountId: null as number | null,
    toAccountId: null as number | null,
    amount: null as number | null,
    description: ''
  };

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.cdr.detectChanges();
    this.loadData();
  }

  loadData() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Učitaj račune
    this.loadingAccounts = true;
    this.cdr.detectChanges();
    this.accountService.getAccountsByCustomer(userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        this.loadingAccounts = false;
        this.cdr.detectChanges();

        // Učitaj kartice za sve račune korisnika
        this.loadCardsForAccounts(accounts);

        // Učitaj transakcije za sve račune korisnika
        this.loadTransactionsForAccounts(accounts);
      },
      error: () => {
        this.loadingAccounts = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCardsForAccounts(accounts: Account[]) {
    if (accounts.length === 0) {
      this.loadingCards = false;
      this.cards = [];
      this.cdr.detectChanges();
      return;
    }

    this.loadingCards = true;
    this.cards = [];
    let loadedCount = 0;

    // Učitaj kartice za svaki račun
    accounts.forEach(account => {
      this.cardService.getCardsByAccount(account.id!).subscribe({
        next: (accountCards: Card[]) => {
          this.cards = [...this.cards, ...accountCards];
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
  }

  loadTransactionsForAccounts(accounts: Account[]) {
    if (accounts.length === 0) {
      this.loadingTransactions = false;
      this.transactions = [];
      this.cdr.detectChanges();
      return;
    }

    this.loadingTransactions = true;
    this.transactions = [];
    let loadedCount = 0;

    // Učitaj transakcije za svaki račun
    accounts.forEach(account => {
      this.transactionService.getTransactionsByAccount(account.id!).subscribe({
        next: (accountTransactions: Transaction[]) => {
          this.transactions = [...this.transactions, ...accountTransactions];
          loadedCount++;
          if (loadedCount === accounts.length) {
            // Sortiraj po datumu i uzmi poslednjih 10
            this.transactions = this.transactions
              .sort((a: Transaction, b: Transaction) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )
              .slice(0, 10);
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
  }

  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('sr-RS');
  }

  onCreateAccount() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.createAccountError = 'Niste prijavljeni.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.newAccount.accountType) {
      this.createAccountError = 'Morate izabrati tip računa.';
      this.cdr.detectChanges();
      return;
    }

    this.loadingCreateAccount = true;
    this.createAccountError = '';
    this.createAccountSuccess = '';

    // Pripremi podatke za kreiranje računa
    const accountRequest: CreateAccountRequest = {
      accountType: this.newAccount.accountType.toUpperCase(),
      customerId: userId
    };

    console.log('Creating account with data:', accountRequest);

    this.accountService.createAccount(accountRequest).subscribe({
      next: () => {
        this.loadingCreateAccount = false;
        this.createAccountSuccess = 'Račun je uspešno kreiran!';
        this.showCreateAccountForm = false;
        this.newAccount = { accountType: '', balance: 0 };

        // Osveži listu računa odmah
        this.loadData();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loadingCreateAccount = false;
        console.error('Create account error:', err);

        // Parsiranje detaljnih grešaka validacije
        if (err.error) {
          if (err.error.errors && typeof err.error.errors === 'object') {
            // Ima više grešaka validacije - prikaži sve
            const errorMessages = Object.entries(err.error.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join('; ');
            this.createAccountError = `Greške validacije: ${errorMessages}`;
          } else if (err.error.message) {
            this.createAccountError = err.error.message;
          } else if (err.error.error) {
            this.createAccountError = err.error.error;
          } else {
            this.createAccountError = 'Greška pri kreiranju računa. Proveri da li su podaci ispravni.';
          }
        } else {
          this.createAccountError = 'Greška pri kreiranju računa. Pokušaj ponovo.';
        }

        // Forsiraj change detection da odmah prikaže grešku
        this.cdr.detectChanges();
      }
    });
  }

  get activeAccounts() {
    return this.accounts.filter(acc => acc.status === 'ACTIVE');
  }

  getAccountBalance(accountId: number | string | null): number {
    if (!accountId) return 0;
    // Konvertuj u number ako je string (iz select-a)
    const id = typeof accountId === 'string' ? parseInt(accountId, 10) : accountId;
    if (isNaN(id)) return 0;
    const account = this.accounts.find(acc => acc.id === id);
    return account?.balance ?? 0;
  }

  onDeposit() {
    if (!this.depositFormData.accountId || !this.depositFormData.amount || this.depositFormData.amount <= 0) {
      this.transactionError = 'Molimo unesite ispravne podatke.';
      return;
    }

    // Konvertuj u number ako je string (iz select-a)
    const accountId = typeof this.depositFormData.accountId === 'string'
      ? parseInt(this.depositFormData.accountId, 10)
      : this.depositFormData.accountId;

    this.loadingTransaction = true;
    this.transactionError = '';
    this.transactionSuccess = '';

    this.transactionService.createDeposit(
      accountId,
      this.depositFormData.amount!,
      this.depositFormData.description || undefined
    ).subscribe({
      next: () => {
        this.loadingTransaction = false;
        this.transactionSuccess = 'Ulog je uspešno izvršen!';
        this.depositFormData = { accountId: null, amount: null, description: '' };
        this.cdr.detectChanges();
        // Osveži podatke odmah
        this.loadData();
        // Sakrij success poruku nakon 3 sekunde
        setTimeout(() => {
          this.transactionSuccess = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.loadingTransaction = false;
        console.error('Deposit error:', err);
        if (err.error?.message) {
          this.transactionError = err.error.message;
        } else if (err.error?.error) {
          this.transactionError = err.error.error;
        } else {
          this.transactionError = 'Greška pri izvršavanju uloga. Pokušaj ponovo.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onWithdraw() {
    if (!this.withdrawFormData.accountId || !this.withdrawFormData.amount || this.withdrawFormData.amount <= 0) {
      this.transactionError = 'Molimo unesite ispravne podatke.';
      return;
    }

    // Konvertuj u number ako je string (iz select-a)
    const accountId = typeof this.withdrawFormData.accountId === 'string'
      ? parseInt(this.withdrawFormData.accountId, 10)
      : this.withdrawFormData.accountId;

    const balance = this.getAccountBalance(accountId);
    if (balance < this.withdrawFormData.amount) {
      this.transactionError = 'Nemate dovoljno sredstava na računu.';
      return;
    }

    this.loadingTransaction = true;
    this.transactionError = '';
    this.transactionSuccess = '';

    this.transactionService.createWithdraw(
      accountId,
      this.withdrawFormData.amount!,
      this.withdrawFormData.description || undefined
    ).subscribe({
      next: () => {
        this.loadingTransaction = false;
        this.transactionSuccess = 'Podizanje novca je uspešno izvršeno!';
        this.withdrawFormData = { accountId: null, amount: null, description: '' };
        this.cdr.detectChanges();
        // Osveži podatke odmah
        this.loadData();
        // Sakrij success poruku nakon 3 sekunde
        setTimeout(() => {
          this.transactionSuccess = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.loadingTransaction = false;
        console.error('Withdraw error:', err);
        if (err.error?.message) {
          this.transactionError = err.error.message;
        } else if (err.error?.error) {
          this.transactionError = err.error.error;
        } else {
          this.transactionError = 'Greška pri podizanju novca. Pokušaj ponovo.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onTransfer() {
    if (!this.transferFormData.fromAccountId || !this.transferFormData.toAccountId ||
        !this.transferFormData.amount || this.transferFormData.amount <= 0) {
      this.transactionError = 'Molimo unesite ispravne podatke.';
      return;
    }

    // Konvertuj u number ako su stringovi (iz select-a)
    const fromId = typeof this.transferFormData.fromAccountId === 'string'
      ? parseInt(this.transferFormData.fromAccountId, 10)
      : this.transferFormData.fromAccountId;
    const toId = typeof this.transferFormData.toAccountId === 'string'
      ? parseInt(this.transferFormData.toAccountId, 10)
      : this.transferFormData.toAccountId;

    if (fromId === toId) {
      this.transactionError = 'Račun pošiljoca i primaoca ne mogu biti isti.';
      return;
    }

    const balance = this.getAccountBalance(fromId);
    if (balance < this.transferFormData.amount) {
      this.transactionError = 'Nemate dovoljno sredstava na računu.';
      return;
    }

    this.loadingTransaction = true;
    this.transactionError = '';
    this.transactionSuccess = '';

    this.transactionService.createTransfer(
      fromId,
      toId,
      this.transferFormData.amount!,
      this.transferFormData.description || undefined
    ).subscribe({
      next: () => {
        this.loadingTransaction = false;
        this.transactionSuccess = 'Prenos novca je uspešno izvršen!';
        this.transferFormData = { fromAccountId: null, toAccountId: null, amount: null, description: '' };
        this.cdr.detectChanges();
        // Osveži podatke odmah
        this.loadData();
        // Sakrij success poruku nakon 3 sekunde
        setTimeout(() => {
          this.transactionSuccess = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        this.loadingTransaction = false;
        console.error('Transfer error:', err);
        if (err.error?.message) {
          this.transactionError = err.error.message;
        } else if (err.error?.error) {
          this.transactionError = err.error.error;
        } else {
          this.transactionError = 'Greška pri prenosu novca. Pokušaj ponovo.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

