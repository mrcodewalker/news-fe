// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {NotificationService} from "../../services/notification.service";
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const loginAnimations = {
  fadeInAnimation: trigger('fadeInAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),

  inputAnimation: trigger('inputAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      animate('0.5s ease-out',
        keyframes([
          style({ opacity: 0, transform: 'translateX(-20px)', offset: 0 }),
          style({ opacity: 0.5, transform: 'translateX(10px)', offset: 0.7 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1 })
        ])
      )
    ]),
    state('invalid', style({
      transform: 'translateX(0)'
    })),
    state('valid', style({
      transform: 'translateX(0)'
    })),
    transition('* => invalid', [
      animate('0.2s ease-in-out', keyframes([
        style({ transform: 'translateX(-10px)', offset: 0.3 }),
        style({ transform: 'translateX(10px)', offset: 0.6 }),
        style({ transform: 'translateX(0px)', offset: 1.0 })
      ]))
    ])
  ]),

  buttonAnimation: trigger('buttonAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.95)' }),
      animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
    ]),
    state('disabled', style({
      opacity: 0.7,
      transform: 'scale(0.95)'
    })),
    state('enabled', style({
      opacity: 1,
      transform: 'scale(1)'
    })),
    transition('enabled <=> disabled', [
      animate('0.2s ease-in-out')
    ])
  ]),

  errorAnimation: trigger('errorAnimation', [
    transition(':enter', [
      style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }),
      animate('0.3s ease-out', style({ opacity: 1, height: '*', transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('0.3s ease-in', style({ opacity: 0, height: 0, transform: 'translateY(-10px)' }))
    ])
  ]),

  // Animation cho logo và tiêu đề
  titleAnimation: trigger('titleAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-30px)' }),
      animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ])
  ]),

  // Animation cho các hình vuông nền
  squareAnimation: trigger('squareAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0) rotate(0deg)' }),
      animate('1s cubic-bezier(0.4, 0, 0.2, 1)', style({
        opacity: 1,
        transform: 'scale(1) rotate(360deg)'
      }))
    ])
  ])
};
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    loginAnimations.fadeInAnimation,
    loginAnimations.inputAnimation,
    loginAnimations.buttonAnimation,
    loginAnimations.errorAnimation,
    loginAnimations.titleAnimation,
    loginAnimations.squareAnimation]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.hasRole('ADMIN')){
      this.router.navigate(['/secret/admin/management']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      try {
        this.isSubmitting = true;
        const data = await this.userService.login(
          this.loginForm.get('username')?.value,
          this.loginForm.get('password')?.value
        ).toPromise();

        if (data.id) {
          this.authService.setAuth(data);
          this.notificationService.show({
            message: 'Đăng nhập thành công!',
            type: 'success',
            duration: 3000
          });
          this.router.navigate(['/secret/admin/management']);
        }

        if (data.status === '404') {
          this.notificationService.show({
            message: 'Lịch sử cố đăng nhập đã được ghi lại bao gồm IP và địa chỉ',
            type: 'error',
            duration: 5000
          });
          this.router.navigate(['']);
        }
      } catch (error) {
        this.notificationService.show({
          message: 'Lịch sử cố đăng nhập đã được ghi lại bao gồm IP và địa chỉ',
          type: 'error',
          duration: 5000
        });
        this.router.navigate(['/']);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.notificationService.show({
        message: 'Vui lòng điền đầy đủ thông tin!',
        type: 'warning',
        duration: 4000
      });
    }
  }
}
