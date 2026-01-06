import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountService, Account, CreateAccountRequest } from './account.service';
import { environment } from '../../environments/environment';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountService]
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllAccounts', () => {
    it('should return array of accounts', () => {
      const mockAccounts: Account[] = [
        {
          id: 1,
          accountNumber: 'ACC001',
          accountType: 'CHECKING',
          balance: 1000,
          status: 'ACTIVE'
        },
        {
          id: 2,
          accountNumber: 'ACC002',
          accountType: 'SAVINGS',
          balance: 2000,
          status: 'ACTIVE'
        }
      ];

      service.getAllAccounts().subscribe(accounts => {
        expect(accounts.length).toBe(2);
        expect(accounts).toEqual(mockAccounts);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/accounts`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccounts);
    });
  });

  describe('getAccountById', () => {
    it('should return account by id', () => {
      const mockAccount: Account = {
        id: 1,
        accountNumber: 'ACC001',
        accountType: 'CHECKING',
        balance: 1000,
        status: 'ACTIVE'
      };

      service.getAccountById(1).subscribe(account => {
        expect(account).toEqual(mockAccount);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/accounts/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccount);
    });
  });

  describe('getAccountsByCustomer', () => {
    it('should return accounts for customer', () => {
      const mockAccounts: Account[] = [
        {
          id: 1,
          accountNumber: 'ACC001',
          accountType: 'CHECKING',
          balance: 1000,
          status: 'ACTIVE'
        }
      ];

      service.getAccountsByCustomer(1).subscribe(accounts => {
        expect(accounts.length).toBe(1);
        expect(accounts).toEqual(mockAccounts);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/accounts/customer/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccounts);
    });
  });

  describe('createAccount', () => {
    it('should create a new account', () => {
      const createRequest: CreateAccountRequest = {
        accountType: 'CHECKING',
        customerId: 1
      };
      const mockAccount: Account = {
        id: 1,
        accountNumber: 'ACC001',
        accountType: 'CHECKING',
        balance: 0,
        status: 'ACTIVE'
      };

      service.createAccount(createRequest).subscribe(account => {
        expect(account).toEqual(mockAccount);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/accounts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockAccount);
    });
  });
});

