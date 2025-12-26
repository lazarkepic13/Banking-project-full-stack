import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role?: string;
  active?: boolean;
  customerNumber?: string;
  employeeNumber?: string;
  position?: string;
  department?: string;
}

export interface AllUsers {
  customers: User[];
  employees: User[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllUsers(): Observable<AllUsers> {
    return this.http.get<AllUsers>(`${this.apiUrl}/admin/users`);
  }

  blockCustomer(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/customers/${id}/block`, {});
  }

  unblockCustomer(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/customers/${id}/unblock`, {});
  }

  blockAccount(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/accounts/${id}/block`, {});
  }

  activateAccount(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/accounts/${id}/activate`, {});
  }

  getAllAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/accounts`);
  }

  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/transactions`);
  }
}

