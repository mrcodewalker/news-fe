import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  contactInfo = {
    hotline: '024.3753.3659',
    email: 'khaothi@napa.vn',
    address: '77 Nguyễn Chí Thanh, Đống Đa, Hà Nội'
  };
  onNewsletterSubmit(event: Event) {
    event.preventDefault();
  }
}
