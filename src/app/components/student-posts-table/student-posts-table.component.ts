import {Component, HostListener, Input, type OnInit} from "@angular/core"
import { trigger, state, style, transition, animate } from "@angular/animations"
import {NewsService} from "../../services/news.service";
import {NotificationService} from "../../services/notification.service";

interface Post {
  id: number
  title: string
  updatedAt: string
  viewCount: number
  fileUrl: string | null
  fileName: string | null
  fileId: number | null
  publishedAt: string
  content: string
  tag: { id: number; name: string; slug: string }[]
  categoryName: string
}

@Component({
  selector: "app-student-posts-table",
  template: `
    <div class="table-container" *ngIf="posts.length>0">
      <table class="student-posts-table">
        <thead>
        <tr>
          <th>Title</th>
          <th class="hide-mobile">Last Updated</th>
          <th class="hide-mobile">Views</th>
          <th class="hide-mobile">File</th>
          <th class="hide-mobile">Download</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let post of posts; let i = index"
            [@rowAnimation]="'in'"
            [class.even]="i % 2 === 0"
            [class.odd]="i % 2 !== 0" (click)="openModal(post)">
          <td>
            <a class="title-link">
              <span class="title-text" [title]="post.title">{{ truncateTitle(post.title) }}</span>
            </a>
            <div class="mobile-details">
              <div class="date-container">
                <i class="fas fa-clock clock-icon"></i>
                <span class="date-text">{{ formatDate(post.updatedAt) }}</span>
              </div>
              <div class="views-container">
                <i class="fas fa-eye eye-icon"></i>
                <span class="views-text">{{ post.viewCount }}</span>
              </div>
              <div class="file-container">
                <a *ngIf="post.fileUrl" (click)="viewFile(post.fileUrl)" target="_blank" class="file-link">
                  <i class="fas fa-file-alt file-icon"></i>
                  <span class="file-text">{{ post.fileName || 'Download' }}</span>
                </a>
                <span *ngIf="!post.fileUrl" class="no-file">No file</span>
              </div>
              <div class="download-container">
                <button *ngIf="post.fileUrl" (click)="downloadFile(post)" class="download-button">
                  <i class="fas fa-download download-icon"></i>
                  <span class="download-text">Download</span>
                </button>
                <span *ngIf="!post.fileUrl" class="no-file">No file</span>
              </div>
            </div>
          </td>
          <td class="hide-mobile">
            <div class="date-container">
              <i class="fas fa-clock clock-icon"></i>
              <span class="date-text">{{ formatDate(post.updatedAt) }}</span>
            </div>
          </td>
          <td class="hide-mobile">
            <div class="views-container">
              <i class="fas fa-eye eye-icon"></i>
              <span class="views-text">{{ post.viewCount }}</span>
            </div>
          </td>
          <td class="hide-mobile">
            <a *ngIf="post.fileUrl" (click)="viewFile(post.fileUrl)" target="_blank" class="file-link">
              <i class="fas fa-file-alt file-icon"></i>
              <span class="file-text">{{ post.fileName || 'Download' }}</span>
            </a>
            <span *ngIf="!post.fileUrl" class="no-file">No file</span>
          </td>
          <td class="hide-mobile">
            <button *ngIf="post.fileUrl" (click)="downloadFile(post)" class="download-button">
              <i class="fas fa-download download-icon"></i>
              <span class="download-text">Download</span>
            </button>
            <span *ngIf="!post.fileUrl" class="no-file">No file</span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="modal" *ngIf="selectedPost" [@modalAnimation]>
      <div class="modal-content">
        <button class="close-btn" (click)="closeModal()">
          <i class="fa fa-times"></i> Close
        </button>
        <h2>{{ selectedPost.title }}</h2>
        <p class="post-meta">
          <span class="category">{{ selectedPost.categoryName }}</span>
          <span class="date">{{ formatDate(selectedPost.updatedAt) }}</span>
          <span class="views">{{ selectedPost.viewCount }} views</span>
        </p>
        <div class="file-badge" *ngIf="selectedPost.fileName && selectedPost.fileId" (click)="viewFile(selectedPost.fileUrl)">
          <div class="file-icon-temp">
            <i class="fas fa-file-pdf"></i>
          </div>
          <div class="file-info">
            <span class="file-name">{{ selectedPost.fileName }}</span>
            <span class="file-id">ID: {{ selectedPost.fileId }}</span>
          </div>
        </div>
        <div class="post-content" [innerHTML]="selectedPost.content"></div>
        <div class="post-tags">
          <span *ngFor="let tag of selectedPost.tag" class="tag">{{ tag.name }}</span>
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
        <div class="article-footer">
          <div class="certification-badge">
            <i class="fas fa-certificate"></i>
            <span>Thông tin chính thống từ Học viện Hành chính và Quản trị Công</span>
          </div>

          <div class="article-meta">
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>Đăng tải: {{selectedPost.publishedAt | date:'HH:mm dd/MM/yyyy'}}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-eye"></i>
              <span>{{selectedPost.viewCount}} lượt xem</span>
            </div>
            <div class="meta-item" *ngIf="selectedPost.updatedAt !== selectedPost.publishedAt">
              <i class="fas fa-edit"></i>
              <span>Cập nhật: {{selectedPost.updatedAt | date:'HH:mm dd/MM/yyyy'}}</span>
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
<!--          <button class="preview-toggle" (click)="viewFile(selectedPost.fileUrl)">-->
<!--            <i class="fa fa-eye"></i>-->
<!--            {{ 'Chi tiết' }}-->
<!--          </button>-->
      </div>
    </div>
  `,
  styleUrls: ["./student-posts-table.component.scss"],
  animations: [
    trigger("rowAnimation", [
      state("in", style({ opacity: 1, transform: "translateX(0)" })),
      transition(":enter", [style({ opacity: 0, transform: "translateX(-10px)" }), animate("0.3s ease-out")]),
    ]),
    trigger("modalAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0.9)" }),
        animate("0.3s ease-out", style({ opacity: 1, transform: "scale(1)" })),
      ]),
      transition(":leave", [animate("0.3s ease-in", style({ opacity: 0, transform: "scale(0.9)" }))]),
    ]),
  ],
})
export class StudentPostsTableComponent implements OnInit {
  @Input() posts: Post[] = []
  selectedPost: Post | null = null;
  authorInfo = {
    name: "TRUNG TÂM KHẢO THÍ VÀO BẢO ĐẢM CHẤT LƯỢNG",
    institution: "Học viện Hành chính và Quản trị công",
    hotline: "0243.8343223",
    address: "77 Nguyễn Chí Thanh, Đống Đa, Hà Nội",
  }
  constructor(private newsService: NewsService,
              private notificationService: NotificationService) {
  }
  ngOnInit() {
    setTimeout(() => {
      this.posts = [...this.posts]
    }, 100)
  }
  copyArticleLink(){
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.show({
        message: 'Đã sao chép thành công',
        type: 'success',
        duration: 500
      })
    }).catch(err => {
      this.notificationService.show({
        message: 'Sao chép thất bại',
        type: 'error',
        duration: 500
      })
    });
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })
  }

  truncateTitle(title: string): string {
    return title.length > 50 ? title.slice(0, 47) + "..." : title
  }

  downloadFile(post: Post) {
    const fileUrl = this.newsService.viewImageUrl + post.fileUrl;

    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = post.fileName || 'pdf_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('File download error:', error));
  }
  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.selectedPost) {
      this.closeModal()
    }
  }
  viewFile(fileUrl: string | null) {
    if (fileUrl===null){
      return;
    }
    const fullUrl = this.newsService.viewImageUrl + fileUrl
    window.open(fullUrl, "_blank")
  }

  openModal(post: Post) {
    this.newsService.incrementView(post.id).subscribe({
      next: (response: any) => {

      }
    });
    if (post) {
      post.content = post.content.replace(/src="\/uploads\/([^"]+)"/g, (match: string, p1: string) => {
        const imageUrl = `${this.newsService.viewImageUrl}/uploads/${p1}`;
        return `src="${imageUrl}"`;
      });
    }
    this.selectedPost = post
  }

  closeModal() {
    this.selectedPost = null
  }
}
