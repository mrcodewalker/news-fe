// header.component.ts
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-news-header',
  templateUrl: './news-header.component.html',
  styleUrls: ['./news-header.component.scss']
})
export class NewsHeaderComponent implements OnInit {
  currentDate: Date = new Date();
  weatherIcon: string = 'fa-sun';
  temperature: number = 25;
  location: string = 'Hà Nội';

  quotes: string[] = [
    "Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.",
    "Giáo dục là vũ khí mạnh nhất mà bạn có thể sử dụng để thay đổi thế giới.",
    "Đầu tư vào kiến thức luôn mang lại lợi nhuận tốt nhất.",
    "Học từ ngày hôm qua, sống cho ngày hôm nay, hy vọng cho ngày mai.",
    "Tri thức là sức mạnh. Thông tin là sức mạnh giải phóng. Giáo dục là tiền đề của tiến bộ.",
    "Mục đích của giáo dục là thay thế một tâm trí trống rỗng bằng một tâm trí cởi mở.",
    "Giáo dục là hộ chiếu để đến tương lai, vì ngày mai thuộc về những người chuẩn bị cho nó ngay từ hôm nay.",
    "Học không bao giờ là muộn. Bạn có thể tìm thời gian. Vấn đề là bạn phải có ý chí.",
    "Giáo dục là nền tảng của sự tiến bộ trong mọi xã hội, trong mọi gia đình.",
    "Học tập không phải là một nghĩa vụ: đó là cánh cửa mở ra thế giới."
  ];

  randomQuote: string = '';
  searchTerm: string = '';
  notificationCount: number = 3;

  contactInfo = {
    hotline: '024.3753.3659',
    email: 'khaothi@napa.vn',
    address: '77 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    phone: '024.3753.3659'
  };
  humidity: number = 75;
  windSpeed: number = 15;
  forecast: string = 'Có mưa rào vào buổi chiều';
  constructor() { }

  ngOnInit(): void {
    this.getRandomQuote();
    this.simulateWeather();

    // Auto update date time every minute
    interval(60000)
      .pipe(
        startWith(0),
        map(() => new Date())
      )
      .subscribe(date => {
        this.currentDate = date;
      });
  }

  getRandomQuote(): void {
    const index = Math.floor(Math.random() * this.quotes.length);
    this.randomQuote = this.quotes[index];
  }

  simulateWeather(): void {
    const weathers = ["sunny", "cloudy", "rainy", "stormy"];
    const icons = ["fa-sun", "fa-cloud", "fa-cloud-rain", "fa-bolt"];
    const index = Math.floor(Math.random() * weathers.length);
    this.weatherIcon = icons[index];
    this.temperature = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
  }

  onSearch(): void {
    console.log('Searching for:', this.searchTerm);
  }

  formatVietnameseDate(date: Date): string {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const day = days[date.getDay()];
    const dateNum = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}, ngày ${dateNum}/${month}/${year}`;
  }
}
