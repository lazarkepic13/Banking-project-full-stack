import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transaction {
  id?: number;
  type?: string; // DEPOSIT, WITHDRAW, TRANSFER
  transactionType?: string; // Backward compatibility
  amount: number;
  status?: string;
  description?: string;
  fromAccount?: { id: number };
  toAccount?: { id: number };
  fromAccountId?: number; // Backward compatibility
  toAccountId?: number; // Backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionRequest {
  type: string; // DEPOSIT, WITHDRAW, TRANSFER
  amount: number;
  fromAccount?: { id: number };
  toAccount?: { id: number };
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
  }

  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/account/${accountId}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  createDeposit(toAccountId: number, amount: number, description?: string): Observable<Transaction> {
    const transaction: CreateTransactionRequest = {
      type: 'DEPOSIT',
      amount: amount,
      toAccount: { id: toAccountId },
      description: description
    };
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  createWithdraw(fromAccountId: number, amount: number, description?: string): Observable<Transaction> {
    const transaction: CreateTransactionRequest = {
      type: 'WITHDRAW',
      amount: amount,
      fromAccount: { id: fromAccountId },
      description: description
    };
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  createTransfer(fromAccountId: number, toAccountId: number, amount: number, description?: string): Observable<Transaction> {
    const transaction: CreateTransactionRequest = {
      type: 'TRANSFER',
      amount: amount,
      fromAccount: { id: fromAccountId },
      toAccount: { id: toAccountId },
      description: description
    };
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }
}

