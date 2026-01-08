import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService, AllUsers, User } from './admin.service';
import { environment } from '../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should return all users (customers and employees)', () => {
      const mockUsers: AllUsers = {
        customers: [
          { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phoneNumber: '123456789' }
        ],
        employees: [
          { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phoneNumber: '987654321' }
        ]
      };

      service.getAllUsers().subscribe((users: AllUsers) => {
        expect(users.customers.length).toBe(1);
        expect(users.employees.length).toBe(1);
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('blockCustomer', () => {
    it('should block a customer', () => {
      const mockCustomer: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '123456789',
        active: false
      };

      service.blockCustomer(1).subscribe((customer: User) => {
        expect(customer.active).toBe(false);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/customers/1/block`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockCustomer);
    });
  });

  describe('unblockCustomer', () => {
    it('should unblock a customer', () => {
      const mockCustomer: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '123456789',
        active: true
      };

      service.unblockCustomer(1).subscribe((customer: User) => {
        expect(customer.active).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/customers/1/unblock`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockCustomer);
    });
  });

  describe('blockAccount', () => {
    it('should block an account', () => {
      const mockAccount = {
        id: 1,
        accountNumber: 'ACC001',
        status: 'BLOCKED'
      };

      service.blockAccount(1).subscribe((account: any) => {
        expect(account.status).toBe('BLOCKED');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/accounts/1/block`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockAccount);
    });
  });

  describe('activateAccount', () => {
    it('should activate an account', () => {
      const mockAccount = {
        id: 1,
        accountNumber: 'ACC001',
        status: 'ACTIVE'
      };

      service.activateAccount(1).subscribe((account: any) => {
        expect(account.status).toBe('ACTIVE');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/accounts/1/activate`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockAccount);
    });
  });

  describe('getAllAccounts', () => {
    it('should return all accounts', () => {
      const mockAccounts = [
        { id: 1, accountNumber: 'ACC001', balance: 1000 },
        { id: 2, accountNumber: 'ACC002', balance: 2000 }
      ];

      service.getAllAccounts().subscribe((accounts: any[]) => {
        expect(accounts.length).toBe(2);
        expect(accounts).toEqual(mockAccounts);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/accounts`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccounts);
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', () => {
      const mockTransactions = [
        { id: 1, type: 'DEPOSIT', amount: 100 },
        { id: 2, type: 'WITHDRAW', amount: 50 }
      ];

      service.getAllTransactions().subscribe((transactions: any[]) => {
        expect(transactions.length).toBe(2);
        expect(transactions).toEqual(mockTransactions);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/transactions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });
  });
});

