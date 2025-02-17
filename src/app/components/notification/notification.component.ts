import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs';
import {animate, keyframes, style, transition, trigger} from '@angular/animations';
import {NotificationConfig, NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-notification',
  template: `
    <div class="notification-overlay" *ngIf="notification" [@fadeInOut]>
      <div class="notification-container"
           [@bounceIn]
           [ngClass]="notification.type">
        <div class="notification-icon">
          <i [class]="getIcon()"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ getTitle() }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <div class="notification-close" (click)="closeNotification()">
          <i class="fas fa-times"></i>
        </div>
        <div class="notification-progress" *ngIf="notification.duration !== 0"
             [@progressBar]="{ value: ':leave', params: { duration: notification.duration || 3000 }}">
        </div>
      </div>
    </div>
  `,
  styleUrls: ['notification.component.scss']
  ,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        animate('600ms ease-out', keyframes([
          style({ transform: 'scale(0.3)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.3 }),
          style({ transform: 'scale(0.9)', offset: 0.6 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ]),
      transition(':leave', [
        animate('300ms ease-in', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(0.9)', offset: 0.2 }),
          style({ transform: 'scale(0)', offset: 1 })
        ]))
      ])
    ]),
    trigger('progressBar', [
      transition(':leave', [
        style({ width: '100%' }),
        animate('{{ duration }}ms linear', style({ width: '0%' }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: NotificationConfig | null = null;
  private subscription: Subscription | undefined;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$
      .subscribe(notification => {
        this.notification = notification;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getIcon(): string {
    switch (this.notification?.type) {
      case 'success':
        return 'fas fa-check-circle fa-2x';
      case 'error':
        return 'fas fa-times-circle fa-2x';
      case 'warning':
        return 'fas fa-exclamation-triangle fa-2x';
      case 'info':
        return 'fas fa-info-circle fa-2x';
      default:
        return 'fas fa-info-circle fa-2x';
    }
  }

  getTitle(): string {
    switch (this.notification?.type) {
      case 'success':
        return 'Thành công!';
      case 'error':
        return 'Lỗi!';
      case 'warning':
        return 'Cảnh báo!';
      case 'info':
        return 'Thông tin';
      default:
        return 'Thông báo';
    }
  }

  closeNotification(): void {
    this.notificationService.hide();
  }
}
