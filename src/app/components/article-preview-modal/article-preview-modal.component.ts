import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { NewsService } from '../../services/news.service';
import { Article } from '../article-management/article-management.component';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-article-preview-modal',
  template: `
    <div class="modal-overlay" *ngIf="article" (click)="closeModal($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ article.title }}</h2>
          <button class="modal-close" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="article-preview-thumbnail">
            <img [src]="article.thumbnailUrl" [alt]="article.title">
          </div>

          <div class="article-preview-meta">
            <div class="meta-item">
              <i class="fas fa-folder"></i>
              <span>{{ article.categoryName }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatDate(article.publishedAt) }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-eye"></i>
              <span>{{ article.viewCount }} lượt xem</span>
            </div>
            <div class="meta-item status">
              <span class="status-badge" [class]="getStatusColor(article.status)">
                {{ article.status.toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="file-badge" *ngIf="article.fileName && article.fileId">
            <div class="file-icon">
              <i class="fas fa-file-pdf"></i>
            </div>
            <div class="file-info">
              <span class="file-name">{{ article.fileName }}</span>
              <span class="file-id">ID: {{ article.fileId }}</span>
            </div>
            <button class="preview-toggle" (click)="togglePreview()">
              <i *ngIf="!showPreview" class="fa fa-eye"></i>
              <i *ngIf="showPreview" class="fa fa-eye-low-vision"></i>
              {{ showPreview ? 'Ẩn Preview' : 'Hiện Preview' }}
            </button>
          </div>
          <div *ngIf="showPreview && pdfSrc" class="pdf-preview">
            <iframe [src]="pdfSrc" frameborder="0" width="100%" height="500px"></iframe>
          </div>
          <div class="article-preview-summary">
            <h3>Tóm tắt</h3>
            <p>{{ article.summary }}</p>
          </div>

          <div class="article-preview-content"
               [innerHTML]="sanitizer.bypassSecurityTrustHtml(article.content)">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" (click)="closeModal()">Đóng</button>
          <button class="btn-edit" (click)="editArticle()">
            <i class="fas fa-edit"></i>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['article-preview-modal.component.scss']
})
export class ArticlePreviewModalComponent implements OnInit{
  @Input() article: Article | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Article>();
  showPreview = false;
  pdfSrc: SafeResourceUrl | null = null;
  constructor(private newsService: NewsService,
              public sanitizer: DomSanitizer) {
  }
  ngOnInit() {
    console.log(this.article);
    if (this.article) {
      console.log(this.sanitizer.bypassSecurityTrustHtml(this.article.content));
    }
  }
  togglePreview(): void {
    this.showPreview = !this.showPreview
    if (this.showPreview && this.article && this.article.fileUrl && this.article.fileName) {
      this.newsService.urlToFile(this.newsService.viewImageUrl+this.article.fileUrl, this.article.fileName).then((file: File) => {
        const fileURL = URL.createObjectURL(file)
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL)
      })
    }
  }
  getSafeHtml(content: string) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  closeModal(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close.emit();
  }

  editArticle(): void {
    if (this.article) {
      this.edit.emit(this.article);
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

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'info';
      default: return 'default';
    }
  }
}
