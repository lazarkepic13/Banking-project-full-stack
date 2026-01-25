import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CardService, Card } from './card.service';
import { environment } from '../../environments/environment';

describe('CardService', () => {
  let service: CardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CardService]
    });
    service = TestBed.inject(CardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCards', () => {
    it('should return array of cards', () => {
      const mockCards: Card[] = [
        {
          id: 1,
          cardNumber: '1234567890123456',
          cardType: 'DEBIT',
          status: 'ACTIVE',
          expiryDate: '2025-12-31'
        }
      ];

      service.getAllCards().subscribe(cards => {
        expect(cards.length).toBe(1);
        expect(cards).toEqual(mockCards);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCards);
    });
  });

  describe('getCardById', () => {
    it('should return card by id', () => {
      const mockCard: Card = {
        id: 1,
        cardNumber: '1234567890123456',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: '2025-12-31'
      };

      service.getCardById(1).subscribe(card => {
        expect(card).toEqual(mockCard);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCard);
    });
  });

  describe('getCardsByAccount', () => {
    it('should return cards for account', () => {
      const mockCards: Card[] = [
        {
          id: 1,
          cardNumber: '1234567890123456',
          cardType: 'DEBIT',
          status: 'ACTIVE',
          expiryDate: '2025-12-31'
        }
      ];

      service.getCardsByAccount(1).subscribe(cards => {
        expect(cards.length).toBe(1);
        expect(cards).toEqual(mockCards);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/account/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCards);
    });
  });

  describe('createCard', () => {
    it('should create a new card', () => {
      const mockCard: Card = {
        cardNumber: '1234567890123456',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: '2025-12-31',
        accountId: 1
      };
      const mockResponse: Card = {
        id: 1,
        ...mockCard
      };

      service.createCard(mockCard).subscribe(card => {
        expect(card).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCard);
      req.flush(mockResponse);
    });
  });

  describe('blockCard', () => {
    it('should block a card', () => {
      const mockCard: Card = {
        id: 1,
        cardNumber: '1234567890123456',
        cardType: 'DEBIT',
        status: 'BLOCKED',
        expiryDate: '2025-12-31'
      };

      service.blockCard(1).subscribe(card => {
        expect(card.status).toBe('BLOCKED');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1/block`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockCard);
    });
  });

  describe('unblockCard', () => {
    it('should unblock a card', () => {
      const mockCard: Card = {
        id: 1,
        cardNumber: '1234567890123456',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: '2025-12-31'
      };

      service.unblockCard(1).subscribe(card => {
        expect(card.status).toBe('ACTIVE');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1/unblock`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockCard);
    });
  });
});




