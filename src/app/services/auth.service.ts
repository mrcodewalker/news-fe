// models/auth.model.ts
export interface User {
  id: number;
  username: string;
  token: string;
  active: boolean;
  createdAt: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface DecodedToken {
  uid: number;
  role: UserRole;
  iat: number;
  sub: string;
  exp: number;
  iss: string;
  aud: string;
}

// services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'auth_user';
  private readonly TOKEN_KEY = 'auth_token';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Lưu thông tin user khi đăng nhập thành công
  public setAuth(user: User): void {
    // Lưu toàn bộ thông tin user
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    // Lưu riêng token để dễ truy cập
    localStorage.setItem(this.TOKEN_KEY, user.token);
    this.currentUserSubject.next(user);
  }

  // Lấy thông tin user từ localStorage
  public getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.AUTH_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Lấy token từ localStorage
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }


  // Kiểm tra role của user
  public hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  // Lấy thông tin user hiện tại
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Lấy username của user hiện tại
  public getCurrentUsername(): string | null {
    return this.currentUserSubject.value?.username || null;
  }

  // Đăng xuất
  public logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  // Cập nhật thông tin user
  public updateUser(user: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      this.setAuth(updatedUser);
    }
  }

  public updateToken(newToken: string): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, token: newToken };
      this.setAuth(updatedUser);
    }
  }
}
