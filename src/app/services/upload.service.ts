import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {environment} from "../environments/environment";

export interface UploadAdapter {
  upload(): Promise<{ default: string }>;
  abort(): void;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API_URL}/upload/image`, formData);
  }

  createUploadAdapter(loader: any): UploadAdapter {
    return new CustomUploadAdapter(loader, this);
  }
}

class CustomUploadAdapter implements UploadAdapter {
  constructor(
    private loader: any,
    private uploadService: UploadService
  ) {}

  upload(): Promise<{ default: string }> {
    return new Promise((resolve, reject) => {
      this.loader.file.then((file: File) => {
        this.uploadService.uploadImage(file).subscribe(
          (response: any) => {
            resolve({
              default: response.url
            });
          },
          error => {
            reject(error);
          }
        );
      });
    });
  }

  abort(): void {}
}
