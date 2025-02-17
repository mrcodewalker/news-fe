import {environment} from "../environments/environment";

export interface NewsArticle {
  categoryId: number;
  title: string;
  summary: string;
  content: string;
  thumbnailId: number;
  status: string;
}

export interface NewsFormData {
  categoryId: number;
  title: string;
  summary: string;
  content: string;
  thumbnailId: number | null;
  status: string;
}

// src/app/features/news/services/news.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Article, PageResponse} from "../components/article-management/article-management.component";
import {PdfFile} from "../components/views-pdf/views-pdf.component";

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly createArticleURL = environment.apiUrl+"article/create";
  private filterCategoryUrl = environment.apiUrl+"category/filter";
  private getArticleByIdUrl = environment.apiUrl+"article/view";
  public viewImageUrl = environment.apiUrl+"media_file";
  private updateArticleUrl = environment.apiUrl+"article/update";
  private filterPageUrl = environment.apiUrl+"article/filter/page";
  private deleteMappingUrl = environment.apiUrl+"article/delete";
  private filterTagsUrl = environment.apiUrl+"tag/filter";
  private uploadFileUrl = environment.apiUrl+"media_file/upload";
  private getPdfFileUrl = environment.apiUrl+"media_file/views/pdf";
  private getArticleBySlugUrl = environment.apiUrl+"article/slug";
  private incrementViewUrl = environment.apiUrl+"article";
  private getArticleByCategoryUrl = environment.apiUrl+"article/category";
  private draftUrl = environment.apiUrl+"article/draft";

  constructor(private http: HttpClient) {}

  createNews(newsData: any): Observable<any> {
    return this.http.post(`${this.createArticleURL}`, newsData);
  }
  async urlToFile(url: string, fileName: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }
  getPdfFiles(){
    return this.http.get<PdfFile[]>(`${this.getPdfFileUrl}`);
  }
  incrementView(id: number){
    return this.http.post<any>(this.incrementViewUrl+`/increment/${id}`, null);
  }
  getArticlesByCategory(category: number, page: number, pageSize: number): Observable<PageResponse<Article>>{
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    return this.http.get<PageResponse<Article>>(this.getArticleByCategoryUrl+`/${category}`, { params });
  }
  getArticles(keyword: string, filter: string, category: number, page: number, pageSize: number): Observable<PageResponse<Article>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('filter', filter)
      .set('keyword', keyword)
      .set('category', category)
      .set('size', pageSize.toString());

    return this.http.get<PageResponse<Article>>(this.filterPageUrl, { params });
  }
  deleteNews(id: number): Observable<any>{
    return this.http.delete(this.deleteMappingUrl+`/${id}`);
  }
  updateNews(id: number, newsData: any): Observable<any>{
    return this.http.post(`${this.updateArticleUrl}/${id}`, newsData);
  }
  draftNew(id: number): Observable<any>{
    const params = new HttpParams()
      .set('id', id);
    return this.http.get(`${this.draftUrl}`,  {params});

  }
  getNewsById(id: number): Observable<any> {
    return this.http.get(`${this.getArticleByIdUrl}/${id}`);
  }
  getArticleBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.getArticleBySlugUrl}/${slug}`);
  }
  filterCategories(): Observable<any> {
    return this.http.get(this.filterCategoryUrl);
  }
  filterTags(): Observable<any> {
    return this.http.get(this.filterTagsUrl);
  }
  uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      this.http.post<any>(`${this.uploadFileUrl}`, formData)
        .toPromise()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          alert("Tên file đã bị trùng, đặt tên file khác");
          reject(error);
        });
    });
  }

}
