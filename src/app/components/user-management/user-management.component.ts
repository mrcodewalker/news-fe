import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from "../../services/user.service";
import { PageResponse } from "../article-management/article-management.component";
import { LoadingService } from "../../services/loading.service";
import { NotificationService } from "../../services/notification.service";
import { Common } from "../Common";
import {AuthService} from "../../services/auth.service";

export interface User {
  id: number;
  username: string;
  password: string;
  token: string | null;
  active: boolean;
  createdAt: string;
  role: 'USER' | 'ADMIN';
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  active: boolean = true;

  // Properties for password modal
  selectedUser: User | null = null;
  showPasswordModal = false;
  passwordForm: FormGroup;

  // Properties for registration modal
  showRegistrationModal = false;
  registrationForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['']
    }, { validator: this.checkPasswords });

    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['USER', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingService.show();
    this.userService.filterUsers(this.active, this.currentPage, this.pageSize)
      .subscribe((data: PageResponse<User>) => {
        this.users = data.content;
        this.totalPages = data.totalPages;
      });
    setTimeout(() => {
      this.loadingService.hide();
    }, Common.TIME_OUT);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  deleteUser(username: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(username).subscribe(() => {
        this.notificationService.show({
          message: 'Cập nhật thành công',
          duration: 5000,
          type: 'success'
        });
        this.users = this.users.filter(user => user.username.toLowerCase() !== username.toLowerCase());
      });
    }
  }
  isAdminRole(){
    return this.authService.hasRole('ADMIN');
  }
  openUser(user: User){
    user.active = true;
    if (user){
    this.userService.updateUser(user.username, user)
      .subscribe({
        next: (response: any) => {
          if (response.id) {
            this.closePasswordModal();
            this.notificationService.show({
              message: 'Cập nhật thành công',
              duration: 5000,
              type: 'success'
            });
          }
        }
      });
  }
  }
  // Password modal methods
  openPasswordModal(user: User): void {
    this.selectedUser = user;
    this.passwordForm.patchValue({
      password: '',
      confirmPassword: '',
      role: user.role
    });
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.selectedUser = null;
    this.passwordForm.reset();
  }

  resetPassword(): void {
    if (this.passwordForm.valid && this.selectedUser) {
      const newPassword = this.passwordForm.get('password')?.value;
      const newRole = this.passwordForm.get('role')?.value;
      this.selectedUser.password = newPassword;
      if (newRole !== this.selectedUser?.role) {
        this.selectedUser.role = newRole.toUpperCase();
      }
      this.userService.updateUser(this.selectedUser.username, this.selectedUser)
        .subscribe({
          next: (response: any) => {
            if (response.id) {
              this.closePasswordModal();
              this.notificationService.show({
                message: 'Cập nhật thành công',
                duration: 5000,
                type: 'success'
              });
            }
          }
        });
    }
  }

  // Registration modal methods
  openRegistrationModal(): void {
    this.registrationForm.reset({
      role: 'USER'
    });
    this.showRegistrationModal = true;
  }

  closeRegistrationModal(): void {
    this.showRegistrationModal = false;
    this.registrationForm.reset({
      role: 'USER'
    });
  }

  registerUser(): void {
    if (this.registrationForm.valid) {
      const newUser: User = {
        id: 0, // ID will be assigned by the server
        username: this.registrationForm.get('username')?.value,
        password: this.registrationForm.get('password')?.value,
        token: null,
        active: true,
        createdAt: new Date().toISOString(),
        role: this.registrationForm.get('role')?.value
      };

      this.loadingService.show();
      this.userService.register(newUser.username, newUser.password, newUser.role).subscribe({
        next: (response: any) => {
          if (response.id) {
            this.closeRegistrationModal();
            this.notificationService.show({
              message: 'Tạo tài khoản thành công',
              duration: 5000,
              type: 'success'
            });
            this.loadUsers();
          }
        },
        error: (error) => {
          this.notificationService.show({
            message: 'Tạo tài khoản thất bại: ' + (error.message || 'Lỗi không xác định'),
            duration: 5000,
            type: 'error'
          });
        },
        complete: () => {
          this.loadingService.hide();
        }
      });
    }
  }
  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }



  toggleActive(): void {
    this.active = !this.active;
    this.currentPage = 0; // Reset to first page when switching
    this.loadUsers();
  }
}
