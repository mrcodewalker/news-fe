export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import {NewsService} from "../../services/news.service";
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {LoadingService} from "../../services/loading.service";
import {Common} from "../Common";
export interface Article {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnailId: number;
  thumbnailUrl: string;
  dimensions: string;
  tag: {id: number;
    name: string;
    slug: string}[]
  viewCount: number;
  status: string;
  publishedAt: string;
  updatedAt: string;
  fileUrl: string;
  fileName: string;
  fileId: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
}
@Component({
  selector: 'app-article-management',
  templateUrl: './article-management.component.html',
  styleUrls: ['./article-management.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px) scale(0.95)'
        }),
        animate('0.4s cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 1,
          transform: 'translateY(0) scale(1)'
        }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(20px) scale(0.95)'
        }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(20px) scale(0.95)'
          }),
          stagger(80, [
            animate('0.4s cubic-bezier(0.4, 0, 0.2, 1)', style({
              opacity: 1,
              transform: 'translateY(0) scale(1)'
            }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ArticleManagementComponent implements OnInit {
  articles: Article[] = [];
  previewArticle: Article | null = null;
  loading = false;
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;
  filteredArticles: Article[] = [];
  keyword = "";
  categories: { id: number; name: string }[] = [];
  selectedCategory: number | null = null;
  tags: {id: number, name: string, slug: string}[] = [];
  constructor(private articleService: NewsService,
              private router: Router,
              private notificationService: NotificationService,
              private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadCategories().then(r => this.loadArticles());
  }
  filterByCategory(event: any): void {
    this.selectedCategory = event.target.value;
    this.currentPage = 0;
    this.loadArticles();
  }
  async loadCategories(): Promise<void> {
    const data = await this.articleService.filterCategories().toPromise();
    this.categories = data;
    this.selectedCategory = 0;
    console.log(this.categories)
    console.log(this.selectedCategory)
  }

  currentFilter: string = 'all';

  filterArticles(status: string): void {
    this.currentFilter = status;
    this.currentPage = 0;
    this.loadArticles();
  }
  openPreviewModal(article: Article): void {
    const previewArticle = { ...article };

    previewArticle.content = previewArticle.content.replace(
      /src="(\/uploads\/[^"]+)"/g,
      `src="${this.articleService.viewImageUrl}$1"`
    );

    this.previewArticle = previewArticle;
  }
  closePreviewModal(): void {
    this.previewArticle = null;
  }

  handleEditFromPreview(article: Article): void {
    this.closePreviewModal();
    this.editArticle(article);
  }
  async deleteItem(article: Article){
    const data = await this.articleService.deleteNews(article.id).toPromise();
    this.loadArticles();
    this.showNotification();
  }
  async changeStatus(article: Article){
    article.status = 'draft';
    const data = await this.articleService.draftNew(article.id).toPromise();
    this.loadArticles();
    this.showNotification();
  }
  showNotification() {
    this.notificationService.show({
      message: 'Thao tác thành công!',
      type: 'success',
      duration: 5000
    });
  }
  editArticle(article: Article){
    this.router.navigate([`news/edit/${article.id}`]);
  }
  createNewArticle(){
    this.router.navigate(['secret/admin/editor']);
  }
  getStatusCount(status: string): number {
    return this.articles.filter(article =>
      article.status.toLowerCase() === status.toLowerCase()
    ).length;
  }
  loadArticles(): void {
    this.loadingService.show();
    this.loading = true;
    console.log(this.selectedCategory)
    if (this.selectedCategory!==null)
    this.articleService.getArticles(this.keyword, this.currentFilter, this.selectedCategory, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Article>) => {
          this.articles = response.content;
          this.articles.map((s: any) => {
            if (s.thumbnailUrl){
              s.thumbnailUrl = this.articleService.viewImageUrl+s.thumbnailUrl;
            }
            return s;
          })
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading articles:', error);
          this.loading = false;
        }
      });
    setTimeout(() => {
      this.loadingService.hide();
    }, Common.TIME_OUT);
  }
  onKeywordSearch(): void {
    this.currentPage = 0
    this.loadArticles()
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadArticles();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'info';
      default: return 'default';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
