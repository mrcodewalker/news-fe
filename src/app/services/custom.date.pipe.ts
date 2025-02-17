import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds

    if (diff < 60) {
      return 'vừa xong';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} phút trước`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} giờ trước`;
    }

    // Return formatted date for older dates
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
