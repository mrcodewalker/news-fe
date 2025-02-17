// interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {NotificationService} from "./notification.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.notificationService.show({
            type: 'error',
            message: 'Có lỗi xảy ra khi fetch data hoặc xác thực',
            duration: 5000
            }
          )
          this.router.navigate(['/']);
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicRequest(request: HttpRequest<any>): boolean {
    const publicUrls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/public'
    ];
    return publicUrls.some(url => request.url.includes(url));
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'vi-VN'
      }
    });
  }


  private handleAuthError(): void {
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.router.url,
        error: 'session_expired'
      }
    });
  }

  private handleForbiddenError(): void {
    this.router.navigate(['/forbidden'], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
  }
}
