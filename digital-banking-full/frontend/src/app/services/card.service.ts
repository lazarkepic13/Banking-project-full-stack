import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Card {
  id?: number;
  cardNumber: string;
  cardType: string;
  status: string;
  expiryDate: string;
  cvv?: string;
  accountId?: number;
  cardholderName?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/cards`);
  }

  getCardById(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/cards/${id}`);
  }

  getCardsByAccount(accountId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/cards/account/${accountId}`);
  }

  createCard(card: Card): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards`, card);
  }
}

