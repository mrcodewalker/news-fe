import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {NewsService} from "../../services/news.service";
import {Article, PageResponse, Tag} from "../article-management/article-management.component";
import {LoadingService} from "../../services/loading.service";
import {Common} from "../Common";
import {animate, animation, query, stagger, style, transition, trigger, useAnimation} from "@angular/animations";
import {Router} from "@angular/router";
export const fadeIn = animation([
  style({ opacity: 0, transform: 'translateY(20px)' }),
  animate('{{duration}} {{easing}}',
    style({ opacity: 1, transform: 'translateY(0)' }))
]);
interface ContactInfo {
  hotline: string;
  email: string;
  address: string;
  phone: string;
}
export const LIST_ANIMATIONS = [
  trigger('listAnimation', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger('60ms', [
          animate('0.4s ease-out',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),

  trigger('cardAnimation', [
    transition(':enter', [
      useAnimation(fadeIn, {
        params: {
          duration: '400ms',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      })
    ])
  ])
];
@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  animations: [LIST_ANIMATIONS]
})
export class ArticleListComponent implements OnInit, OnChanges {
  @Input() categoryId?: number;
  contactInfo: ContactInfo = {
    hotline: '024.3753.3659',
    email: 'khaothi@napa.vn',
    address: '77 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    phone: '024.3753.3659'
  };
  currentYear = new Date().getFullYear();
  articles: Article[] = [];
  animationState = 'in';
  loading = true;
  currentPage = 0;
  pageSize = 9;
  totalPages = 0;
  activeTag: Tag | null = null;
  searchTerms = new Subject<string>();
  searchTerm = '';
  currentDate!: Date;
  weatherIcon = "sunny"
  weatherIconClass = "fa-sun"
  temperature = 25
  location: string = 'Hà Nội';
  randomQuote = "Hãy đọc tin tức mỗi ngày để cập nhật thông tin mới nhất!"
  quotes: string[] = [
    "Tin tức là bức tranh của thế giới trong từng khoảnh khắc.",
    "Đọc tin tức giúp bạn kết nối với thế giới.",
    "Kiến thức là sức mạnh, và tin tức là nguồn kiến thức.",
    "Mỗi ngày là một câu chuyện mới, hãy đọc để khám phá.",
    "Thông tin là chìa khóa của sự thành công.",
  ]
  constructor(protected articleService: NewsService,
              private loadingService: LoadingService,
              private router: Router) {
    this.searchTerms.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadArticles();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && changes['categoryId'].currentValue !== undefined) {
      this.currentPage = 0;
      this.loadArticles();
    }
  }
  isTableData(id: number | undefined){
    return id===2||id===3||id===4||id===5;
  }
  viewDetail(article: Article){
    this.router.navigate([`/article/detail/${article.slug}`]);
  }
  ngOnInit(): void {
    this.currentDate = new Date();
    this.getRandomQuote();
    this.simulateWeather();
  }
  getRandomQuote() {
    const index = Math.floor(Math.random() * this.quotes.length)
    this.randomQuote = this.quotes[index]
  }

  getNewQuote() {
    this.getRandomQuote()
  }
  simulateWeather() {
    const weathers = ["sunny", "cloudy", "rainy", "stormy"]
    const icons = ["fa-sun", "fa-cloud", "fa-cloud-rain", "fa-bolt"]
    const index = Math.floor(Math.random() * weathers.length)
    this.weatherIcon = weathers[index]
    this.weatherIconClass = icons[index]
    this.temperature = Math.floor(Math.random() * (35 - 15 + 1)) + 15
  }
  loadArticles(): void {
    console.log(this.categoryId);
    if (!this.categoryId) return;

    this.loadingService.show();
    this.loading = true;

    this.articleService.getArticlesByCategory(this.categoryId, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Article>) => {
          this.articles = response.content;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading articles:', error);
          this.loading = false;
        }
      });

    setTimeout(() => this.loadingService.hide(), 500);
  }
  downloadFile(article: any) {
    const fileUrl = this.articleService.viewImageUrl + article.fileUrl;

    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = article.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('File download error:', error));
  }

  onSearch(term: string): void {
    this.searchTerms.next(term);
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.loadArticles();
  }

  toggleTag(tag: Tag): void {
    this.activeTag = this.activeTag?.id === tag.id ? null : tag;
    this.currentPage = 0;
    this.loadArticles();
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      if (
        i === 0 || // First page
        i === this.totalPages - 1 || // Last page
        (i >= this.currentPage - 2 && i <= this.currentPage + 2) // Pages around current
      ) {
        pages.push(i);
      }
    }
    return pages;
  }
}
