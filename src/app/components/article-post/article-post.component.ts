import { Component } from '@angular/core';
import {NewsService} from "../../services/news.service";

@Component({
  selector: 'app-article-post',
  templateUrl: './article-post.component.html',
  styleUrls: ['./article-post.component.scss']
})
export class ArticlePostComponent {
    images: string[] = [];
    constructor(private articleService: NewsService) {
      this.images = [`${this.articleService.viewImageUrl}/uploads/2025/02/11/5453af74-f07f-4a9b-b1c3-638c601abf35.jpeg`,
        `${this.articleService.viewImageUrl}/uploads/2025/02/11/51820260-09fd-4e3a-a263-c7ab424ac604.jpg`,
        `${this.articleService.viewImageUrl}/uploads/2025/02/11/61be0965-0209-48fc-a2d6-004ba7433322.jpg`,
        `${this.articleService.viewImageUrl}/uploads/2025/02/11/80726229-6a1e-419a-b43d-7400177b617b.jpg`,
        `${this.articleService.viewImageUrl}/uploads/2025/02/11/5d0878e8-5dd8-4122-a16c-cfd98bdfd9a6.jpg`,
        `${this.articleService.viewImageUrl}/uploads/2025/02/11/2346ab16-2092-46d5-aab8-d3d81bba25ec.jpeg`];
    }
}
