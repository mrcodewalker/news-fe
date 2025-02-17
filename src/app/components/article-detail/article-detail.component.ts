// article-detail.component.ts
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {animate, style, transition, trigger} from "@angular/animations";
import {NewsService} from "../../services/news.service";
import {LoadingService} from "../../services/loading.service";
import {Common} from "../Common";
import {NotificationService} from "../../services/notification.service";

interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

interface Article {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  fileUrl?: string;
  fileId?: number;
  fileName?: string;
  thumbnailId?: number;
  thumbnailUrl?: string;
  dimensions?: string;
  viewCount: number;
  status: string;
  publishedAt: string;
  updatedAt: string;
  tag: Tag[];
}

@Component({
  selector: 'app-article-detail',
  template: `
    <div class="article-container" *ngIf="article" [@fadeInUp]>
      <!-- Hero Section -->
      <div class="hero-section" [style.backgroundImage]="'url(' + this.newsService.viewImageUrl + article.thumbnailUrl + ')'">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="category-badge">{{article.categoryName}}</div>
            <h1 class="title">{{article.title}}</h1>
            <div class="metadata">
              <span class="date">{{article.publishedAt | customDate}}</span>
              <span class="dot">•</span>
              <span class="date">{{ article.publishedAt | date: 'HH:mm dd/MM/yyyy' }}</span>
              <span class="dot">•</span>
              <span class="views">{{article.viewCount}} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper">
        <div class="pin-container">
          <i class="fas fa-thumbtack pin-icon"></i>
        </div>
        <div class="main-column">
          <!-- Tags -->

          <div class="tags-container">
            <span class="tag" *ngFor="let tag of article.tag">
              #{{tag.name}}
            </span>
          </div>

          <!-- Summary -->
          <div class="summary">
            {{article.summary}}
          </div>

          <!-- Article Content -->
          <div class="article-content" [innerHTML]="sanitizedContent">
          </div>

<!--          <div class="file-attachment" *ngIf="this.newsService.viewImageUrl+article.fileUrl">-->
<!--            <i class="fas fa-file-pdf"></i>-->
<!--            <a [href]="this.newsService.viewImageUrl+article.fileUrl" target="_blank">-->
<!--              {{article.fileName}}-->
<!--            </a>-->
<!--          </div>-->
          <div class="file-section" *ngIf="article.fileUrl">
            <h3 class="file-section-title">Tài liệu đính kèm</h3>
            <div class="file-attachment" (click)="openPdfInNewTab()">
              <div class="file-icon">
                <i class="fas fa-file-pdf"></i>
              </div>
              <div class="file-info">
                <div class="file-name">{{article.fileName}}</div>
                <div class="file-meta">PDF Document • Click để xem trực tuyến</div>
              </div>
              <button
                 class="download-button"
                 (click)="downloadFile($event, article)">
                <i class="fas fa-download"></i>
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
          <div class="author-section">
            <div class="author-info">
              <img src="/assets/images/logo.jpg" alt="HCMA Logo" class="author-logo">
              <div class="author-details">
                <h3><i class="fas fa-user-tie"></i> {{ authorInfo.name }}</h3>
                <p><i class="fas fa-university"></i> {{ authorInfo.institution }}</p>
                <div class="contact-info">
                  <p><i class="fas fa-phone"></i> Hotline: {{ authorInfo.hotline }}</p>
                  <p><i class="fas fa-map-marker-alt"></i> Địa chỉ: {{ authorInfo.address }}</p>
                </div>
              </div>
            </div>
          </div>


          <!-- Article Footer -->
          <div class="article-footer">
            <div class="certification-badge">
              <i class="fas fa-certificate"></i>
              <span>Thông tin chính thống từ Học viện Hành chính và Quản trị Công</span>
            </div>

            <div class="article-meta">
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>Đăng tải: {{article.publishedAt | date:'HH:mm dd/MM/yyyy'}}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-eye"></i>
                <span>{{article.viewCount}} lượt xem</span>
              </div>
              <div class="meta-item" *ngIf="article.updatedAt !== article.publishedAt">
                <i class="fas fa-edit"></i>
                <span>Cập nhật: {{article.updatedAt | date:'HH:mm dd/MM/yyyy'}}</span>
              </div>
            </div>

            <div class="share-section">
              <h4>Chia sẻ bài viết</h4>
              <div class="share-buttons">
                <button class="share-button facebook">
                  <i class="fab fa-facebook-f"></i>
                </button>
                <button class="share-button twitter">
                  <i class="fab fa-twitter"></i>
                </button>
                <button class="share-button linkedin">
                  <i class="fab fa-linkedin-in"></i>
                </button>
                <button class="share-button copy-link" (click)="copyArticleLink()">
                  <i class="fas fa-link"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-column">
          <div class="sidebar-section">
            <h3>Bài viết liên quan</h3>
            <div class="related-posts">
              <div class="related-post" *ngFor="let post of relatedPosts" (click)="navigateToArticle(post.slug)">
                <div class="related-post-image" [style.backgroundImage]="'url(' + this.newsService.viewImageUrl + post.thumbnailUrl + ')'">
                </div>
                <div class="related-post-content">
                  <div class="related-post-category">{{post.categoryName}}</div>
                  <h4 class="related-post-title">{{post.title}}</h4>
                  <div class="related-post-metadata">
                    <span>{{post.publishedAt | customDate}}</span>
                    <span class="dot">•</span>
                    <span>{{post.publishedAt | date:'HH:mm dd/MM/yyyy'}}</span>
                    <span class="dot">•</span>
                    <span>{{post.viewCount}} lượt xem</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['article-detail.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ArticleDetailComponent implements OnInit {
  authorInfo = {
    name: "TRUNG TÂM KHẢO THÍ VÀO BẢO ĐẢM CHẤT LƯỢNG",
    institution: "Học viện Hành chính và Quản trị công",
    hotline: "0243.8343223",
    address: "77 Nguyễn Chí Thanh, Đống Đa, Hà Nội",
  }
  article: Article | null = null;
  relatedPosts: Article[] = [];
  sanitizedContent: any;
  slug: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    protected newsService: NewsService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}
  openPdfInNewTab() {
    window.open(this.newsService.viewImageUrl + this.article?.fileUrl, '_blank');
  }
  copyArticleLink(){
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.show({
        message: 'Đã sao chép thành công',
        type: 'success',
        duration: 1500
      })
    }).catch(err => {
      this.notificationService.show({
        message: 'Sao chép thất bại',
        type: 'error',
        duration: 1500
      })
    });
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      console.log('Slug:', this.slug);
    });
    if (this.slug===''){
      return;
    }
    this.fetchArticle();
  }

  async fetchArticle(): Promise<void> {
    this.loadingService.show();
    const data = await this.newsService.getArticleBySlug(this.slug).toPromise();
    this.article = data.response;
    if (this.article) {
      console.log(this.article.content)
      this.article.content = this.article.content.replace(/src="\/uploads\/([^"]+)"/g, (match: string, p1: string) => {
        const imageUrl = `${this.newsService.viewImageUrl}/uploads/${p1}`;
        return `src="${imageUrl}"`;
      });
      console.log(this.article.content)
    }
    this.relatedPosts = data.related;
    if (this.article) {
      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content)
    }
    setTimeout(() => {
      this.loadingService.hide()
    }, Common.TIME_OUT);
  }
  downloadFile(event: any, article: any) {
    event.stopPropagation();
    const fileUrl = this.newsService.viewImageUrl + article.fileUrl;

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
  navigateToArticle(slug: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate(['/article/detail', slug]);
    });
  }
}
