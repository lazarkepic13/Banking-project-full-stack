import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService, Transaction } from './transaction.service';
import { environment } from '../../environments/environment';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTransactions', () => {
    it('should return array of transactions', () => {
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: 'DEPOSIT',
          amount: 100,
          status: 'COMPLETED'
        }
      ];

      service.getAllTransactions().subscribe(transactions => {
        expect(transactions.length).toBe(1);
        expect(transactions).toEqual(mockTransactions);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', () => {
      const mockTransaction: Transaction = {
        id: 1,
        type: 'DEPOSIT',
        amount: 100,
        status: 'COMPLETED'
      };

      service.getTransactionById(1).subscribe(transaction => {
        expect(transaction).toEqual(mockTransaction);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransaction);
    });
  });

  describe('getTransactionsByAccount', () => {
    it('should return transactions for account', () => {
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: 'DEPOSIT',
          amount: 100,
          status: 'COMPLETED'
        }
      ];

      service.getTransactionsByAccount(1).subscribe(transactions => {
        expect(transactions.length).toBe(1);
        expect(transactions).toEqual(mockTransactions);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/account/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });
  });

  describe('createTransaction', () => {
    it('should create a new transaction', () => {
      const mockTransaction: Transaction = {
        type: 'DEPOSIT',
        amount: 100,
        toAccount: { id: 1 }
      };
      const mockResponse: Transaction = {
        id: 1,
        type: 'DEPOSIT',
        amount: 100,
        status: 'COMPLETED',
        toAccount: { id: 1 }
      };

      service.createTransaction(mockTransaction).subscribe(transaction => {
        expect(transaction).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTransaction);
      req.flush(mockResponse);
    });
  });

  describe('createDeposit', () => {
    it('should create a deposit transaction', () => {
      const mockResponse: Transaction = {
        id: 1,
        type: 'DEPOSIT',
        amount: 100,
        status: 'COMPLETED'
      };

      service.createDeposit(1, 100, 'Test deposit').subscribe(transaction => {
        expect(transaction).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.type).toBe('DEPOSIT');
      expect(req.request.body.amount).toBe(100);
      expect(req.request.body.toAccount.id).toBe(1);
      expect(req.request.body.description).toBe('Test deposit');
      req.flush(mockResponse);
    });
  });

  describe('createWithdraw', () => {
    it('should create a withdraw transaction', () => {
      const mockResponse: Transaction = {
        id: 1,
        type: 'WITHDRAW',
        amount: 50,
        status: 'COMPLETED'
      };

      service.createWithdraw(1, 50, 'Test withdraw').subscribe(transaction => {
        expect(transaction).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.type).toBe('WITHDRAW');
      expect(req.request.body.amount).toBe(50);
      expect(req.request.body.fromAccount.id).toBe(1);
      expect(req.request.body.description).toBe('Test withdraw');
      req.flush(mockResponse);
    });
  });

  describe('createTransfer', () => {
    it('should create a transfer transaction', () => {
      const mockResponse: Transaction = {
        id: 1,
        type: 'TRANSFER',
        amount: 75,
        status: 'COMPLETED'
      };

      service.createTransfer(1, 2, 75, 'Test transfer').subscribe(transaction => {
        expect(transaction).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/transactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.type).toBe('TRANSFER');
      expect(req.request.body.amount).toBe(75);
      expect(req.request.body.fromAccount.id).toBe(1);
      expect(req.request.body.toAccount.id).toBe(2);
      expect(req.request.body.description).toBe('Test transfer');
      req.flush(mockResponse);
    });
  });
});




