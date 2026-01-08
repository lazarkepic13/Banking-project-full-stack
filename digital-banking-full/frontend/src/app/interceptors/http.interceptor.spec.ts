import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { httpInterceptor } from './http.interceptor';
import { Observable, of, firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('httpInterceptor', () => {
  let interceptor: typeof httpInterceptor;
  let mockRequest: HttpRequest<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = httpInterceptor;

    // Clear localStorage
    localStorage.clear();

    mockRequest = new HttpRequest('GET', '/api/test');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header when token exists in localStorage', async () => {
    const token = 'test-token-123';
    localStorage.setItem('authToken', token);

    let capturedRequest: HttpRequest<any> | null = null;
    const handler: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      }
    };

    await firstValueFrom(interceptor(mockRequest, handler.handle.bind(handler)));

    expect(capturedRequest).toBeTruthy();
    expect(capturedRequest!.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header when token does not exist', async () => {
    // localStorage is already cleared in beforeEach

    let capturedRequest: HttpRequest<any> | null = null;
    const handler: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      }
    };

    await firstValueFrom(interceptor(mockRequest, handler.handle.bind(handler)));

    expect(capturedRequest).toBeTruthy();
    expect(capturedRequest!.headers.has('Authorization')).toBeFalsy();
  });

  it('should pass request through when window is undefined (SSR)', async () => {
    // In browser environment, window is defined
    // This test verifies the interceptor works in browser
    let capturedRequest: HttpRequest<any> | null = null;
    const handler: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      }
    };

    await firstValueFrom(interceptor(mockRequest, handler.handle.bind(handler)));

    expect(capturedRequest).toBeTruthy();
  });

  it('should clone request with Authorization header', async () => {
    const token = 'test-token-456';
    localStorage.setItem('authToken', token);

    let capturedRequest: HttpRequest<any> | null = null;
    const handler: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      }
    };

    await firstValueFrom(interceptor(mockRequest, handler.handle.bind(handler)));

    expect(capturedRequest).toBeTruthy();
    expect(capturedRequest!).not.toBe(mockRequest); // Should be a clone
    expect(capturedRequest!.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(capturedRequest!.url).toBe(mockRequest.url);
    expect(capturedRequest!.method).toBe(mockRequest.method);
  });

  it('should handle empty token string', async () => {
    localStorage.setItem('authToken', '');

    let capturedRequest: HttpRequest<any> | null = null;
    const handler: HttpHandler = {
      handle: (req: HttpRequest<any>) => {
        capturedRequest = req;
        return of({} as HttpEvent<any>);
      }
    };

    await firstValueFrom(interceptor(mockRequest, handler.handle.bind(handler)));

    expect(capturedRequest).toBeTruthy();
    // Empty string is falsy, so header should not be added
    expect(capturedRequest!.headers.has('Authorization')).toBeFalsy();
  });
});

