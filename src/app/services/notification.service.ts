export interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationConfig | null>(null);
  notification$: Observable<NotificationConfig | null> = this.notificationSubject.asObservable();

  show(config: NotificationConfig): void {
    this.notificationSubject.next(config);

    if (config.duration !== 0) {
      setTimeout(() => {
        this.hide();
      }, config.duration || 3000);
    }
  }

  hide(): void {
    this.notificationSubject.next(null);
  }
}
