import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Account {
  id?: number;
  accountNumber?: string;
  accountType: string;
  balance?: number;
  status?: string;
  customer?: {
    id: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAccountRequest {
  accountType: string;
  customerId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`);
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${id}`);
  }

  getAccountsByCustomer(customerId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts/customer/${customerId}`);
  }

  createAccount(request: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounts`, request);
  }
}

