import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { AuthService, LoginRequest } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let platformId: Object;

  beforeEach(() => {
    platformId = 'browser';
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: platformId }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token in localStorage', () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' },
        role: 'CUSTOMER'
      };
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(loginRequest.email, loginRequest.password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('authToken')).toBe('test-token');
        expect(localStorage.getItem('userRole')).toBe('CUSTOMER');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register a new customer', () => {
      const mockCustomer = {
        id: 1,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User'
      };

      service.register(mockCustomer).subscribe(response => {
        expect(response).toEqual(mockCustomer);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCustomer);
      req.flush(mockCustomer);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('authToken', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('authToken', 'test-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if no token exists', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null if no user exists', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user id from current user', () => {
      const mockUser = { id: 123, email: 'test@example.com' };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      expect(service.getCurrentUserId()).toBe(123);
    });

    it('should return null if no user exists', () => {
      expect(service.getCurrentUserId()).toBeNull();
    });
  });

  describe('getCurrentRole', () => {
    it('should return role from localStorage', () => {
      localStorage.setItem('userRole', 'ADMIN');
      expect(service.getCurrentRole()).toBe('ADMIN');
    });

    it('should return null if no role exists', () => {
      expect(service.getCurrentRole()).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true if role is ADMIN', () => {
      localStorage.setItem('userRole', 'ADMIN');
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false if role is not ADMIN', () => {
      localStorage.setItem('userRole', 'CUSTOMER');
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('isEmployee', () => {
    it('should return true if role is EMPLOYEE', () => {
      localStorage.setItem('userRole', 'EMPLOYEE');
      expect(service.isEmployee()).toBe(true);
    });

    it('should return false if role is not EMPLOYEE', () => {
      localStorage.setItem('userRole', 'CUSTOMER');
      expect(service.isEmployee()).toBe(false);
    });
  });

  describe('isCustomer', () => {
    it('should return true if role is CUSTOMER', () => {
      localStorage.setItem('userRole', 'CUSTOMER');
      expect(service.isCustomer()).toBe(true);
    });

    it('should return false if role is not CUSTOMER', () => {
      localStorage.setItem('userRole', 'ADMIN');
      expect(service.isCustomer()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all localStorage items', () => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('currentUser', '{"id": 1}');
      localStorage.setItem('userRole', 'CUSTOMER');

      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('userRole')).toBeNull();
    });
  });
});




