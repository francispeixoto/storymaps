import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  showSuccess(message: string): void {
    const toast: Toast = { message, type: 'success' };
    this.addToast(toast);
  }

  showError(message: string): void {
    const toast: Toast = { message, type: 'error' };
    this.addToast(toast);
  }

  private addToast(toast: Toast): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    setTimeout(() => {
      this.removeToast(toast);
    }, 3000);
  }

  private removeToast(toast: Toast): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t !== toast));
  }
}
