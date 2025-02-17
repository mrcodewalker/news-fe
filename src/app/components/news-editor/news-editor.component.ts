import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuillModules, QuillEditorComponent } from 'ngx-quill';
import { HttpClient } from '@angular/common/http';
import ImageResize from 'quill-image-resize';
import Quill from 'quill';
import {NewsService} from "../../services/news.service";
import {NotificationService} from "../../services/notification.service";
import {ActivatedRoute} from "@angular/router";
import {LoadingService} from "../../services/loading.service";
import {Common} from "../Common";
import {PdfFile} from "../views-pdf/views-pdf.component";
import {getSourceFileOrError} from "@angular/compiler-cli";

Quill.register('modules/imageResize', ImageResize);
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}
@Component({
  selector: 'app-news-editor',
  templateUrl: './news-editor.component.html',
  styleUrls: ['./news-editor.component.scss']
})
export class NewsEditorComponent implements OnInit, AfterViewInit {
  @ViewChild(QuillEditorComponent, { static: true }) quillEditor!: QuillEditorComponent;
  @ViewChild('thumbnailImg') thumbnailImg: any;
  fileSelected: File | null = null;
  newsForm: FormGroup;
  thumbnailPreview: string | null = null;
  thumbnailFileName: string | null = null;
  thumbnailWidth: number = 0;
  fetchFileUrl: string | null = null;
  fetchFileName: string | null = null;
  originalThumbnailWidth: number = 0;
  thumbnailFile: File | null = null;
  isVisible: boolean = false;
  categories: Category[] = [];
  isEditMode: boolean = false;
  newsId: number = 1;
  selectedCategoryId: number | null = null;
  quillModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ],
    imageResize: {
      displaySize: true,
      modules: ['Resize', 'DisplaySize'],
      handleStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      displayStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      toolbarStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      parchment: Quill.import('parchment')
    },
    clipboard: {
      matchVisual: false,
    },
    keepAspectRatio: true
  };
  tags: { id: number; name: string }[] = [
    { id: 1, name: "Technology" },
    { id: 2, name: "Science" },
    { id: 3, name: "Health" },
    { id: 4, name: "Business" },
    { id: 5, name: "Entertainment" },
    { id: 6, name: "Sports" },
  ]
  thumbnailHeight: number = 0;
  originalThumbnailHeight: number = 0;
  selectedTags: { id: number; name: string }[] = []
  isTagSelectOpen = false

  toggleTagSelect() {
    this.isTagSelectOpen = !this.isTagSelectOpen
  }

  isTagSelected(tag: { id: number; name: string }): boolean {
    return this.selectedTags.some((selectedTag) => selectedTag.id === tag.id)
  }

  toggleTag(tag: { id: number; name: string }, event: Event) {
    event.stopPropagation()
    const index = this.selectedTags.findIndex((selectedTag) => selectedTag.id === tag.id)
    if (index > -1) {
      this.selectedTags.splice(index, 1)
    } else {
      this.selectedTags.push(tag)
    }
  }

  removeTag(tag: { id: number; name: string }) {
    const index = this.selectedTags.findIndex((selectedTag) => selectedTag.id === tag.id)
    if (index > -1) {
      this.selectedTags.splice(index, 1)
    }
  }
  handleFileUpload(file: File | null) {
    this.fileSelected = file;
  }
  handleFileSelected(file: PdfFile) {
    console.log(file)
    if (file) {
      this.fetchFileUrl = `${file.filePath}`;
      this.fetchFileName = `${file.originalName}`;
      const url = this.newService.viewImageUrl + this.fetchFileUrl;
      this.newService.urlToFile(url, this.fetchFileName)
        .then(file => {
          this.fileSelected = file;
        })
        .catch(error => {
          console.error("Error fetching file:", error);
        });
    }
    console.log("ABC"+file.filePath+file.originalName);
  }
  constructor(private fb: FormBuilder, private http: HttpClient,
              private newService: NewsService, private notificationService: NotificationService,
              private route: ActivatedRoute, private loadingService: LoadingService) {
    this.newsForm = this.fb.group({
      categoryId: [null, Validators.required],
      title: ['', Validators.required],
      summary: ['', Validators.required],
      content: ['', Validators.required],
      thumbnailId: [null],
      fileId: [null],
      status: ['DRAFT'],
    });
  }
  ngAfterViewInit() {
    if (this.thumbnailImg) {
      this.thumbnailImg.nativeElement.style.width = `${this.thumbnailWidth}px`;
      this.thumbnailImg.nativeElement.style.height = `${this.thumbnailHeight}px`;
    }
  }
  ngOnInit(): void {
    this.loadTags().then(r => this.loadCategories());
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.newsId = params['id'];
        this.isEditMode = true;
        this.loadNewsData(this.newsId);
      }
    });
  }
  async loadTags(): Promise<void>{
    const data = await this.newService.filterTags().toPromise();
    this.tags = data;
  }
  loadNewsData(id: number) {
    this.loadingService.show();
    this.newService.getNewsById(id).subscribe({
      next: (news) => {
        console.log(news)
        let content = news.content;
        content = content.replace(/src="\/uploads\/([^"]+)"/g, (match: string, p1: string) => {
          const imageUrl = `${this.newService.viewImageUrl}/uploads/${p1}`;
          return `src="${imageUrl}"`;
        });
        this.newsForm.patchValue({
          categoryId: news.categoryId,
          title: news.title,
          summary: news.summary,
          content: content,
          status: news.status.toUpperCase(),
          thumbnailId: news.thumbnailId
        });
        this.selectedTags = news.tag;
        console.log(this.newService.viewImageUrl+news.fileUrl)
        setTimeout(() => {
          this.newsForm.patchValue({ content: content })
          if (this.quillEditor && this.quillEditor.quillEditor) {
            this.quillEditor.quillEditor.clipboard.dangerouslyPasteHTML(content)
          }
        }, 0)
        if (this.quillEditor) {
          console.log(this.newsForm.get('content')?.value)
        }
        if (news.fileUrl && news.fileName){
          this.fetchFileUrl = news.fileUrl;
          this.fetchFileName = news.fileName;
        }
        if (news.thumbnailUrl) {
          const [width, height] = news.dimensions.split('x').map(Number);
          this.thumbnailWidth = width;
          this.thumbnailHeight = height;
          console.log(this.thumbnailWidth+"X"+ this.thumbnailHeight);
          this.thumbnailFileName = 'selected.jpg';
          this.thumbnailPreview = this.newService.viewImageUrl+news.thumbnailUrl;
          // this.newService.urlToFile(this.newService.viewImageUrl+news.fileUrl, news.fileName).then(file => {
          //   this.fileSelected = file;
          // });
        }
      },
      error: (error) => {
        console.error('Failed to load news:', error);
        this.notificationService.show({
          message: 'Không thể tải dữ liệu bài viết',
          type: 'error',
          duration: 5000
        });
      }
    });
    setTimeout(() => {
      this.loadingService.hide();
    }, Common.TIME_OUT);
  }
  resizeThumbnail() {
    console.log(this.thumbnailImg)
    setTimeout(() => {
      if (this.thumbnailImg) {
        this.thumbnailImg.nativeElement.style.setProperty('width', `${this.thumbnailWidth}px`, 'important');
        this.thumbnailImg.nativeElement.style.setProperty('height', `${this.thumbnailHeight}px`, 'important');
        console.log(this.thumbnailImg.nativeElement.style.width + " ABC " + this.thumbnailImg.nativeElement.style.height);
      }
    }, 0);
  }
  loadCategories() {
    this.newService.filterCategories()
      .subscribe({
        next: (response) => {
          this.categories = response;
          if (this.categories.length > 0) {
            this.newsForm.patchValue({
              categoryId: this.categories[0].id
            });
          }
        },
        error: (error) => {
          console.error('Failed to load categories:', error);
        }
      });
  }
  onCategoryChange(event: any) {
    const categoryId = event.target.value;
    this.newsForm.patchValue({
      categoryId: parseInt(categoryId)
    });
  }
  async onSubmit(event: any) {
    this.loadingService.show();
    if (this.thumbnailFile) {
      const resizedThumbnail = await this.resizeAndGetThumbnail();
      const thumbnailResponse = await this.newService.uploadImage(resizedThumbnail);
      this.newsForm.patchValue({ thumbnailId: thumbnailResponse.id });
    }
    if (this.fileSelected){
      const fileResponse = await this.newService.uploadImage(this.fileSelected);
      this.newsForm.patchValue({ fileId: fileResponse.id });
      console.log(fileResponse)
    } else {
      this.newsForm.patchValue({fileId: null});
    }
    if (this.newsForm.valid) {
      let content = this.newsForm.get('content')?.value;
      const serverUrlRegex = /src="[^"]*?(\/uploads\/[^"]+)"/g
      content = content.replace(serverUrlRegex, 'src="$1"')
      const updatedContent = await this.replaceBase64Images(content);
      this.newsForm.patchValue({ content: updatedContent });
      const formData = {
        ...this.newsForm.value,
        content: updatedContent,
        categoryId: parseInt(this.newsForm.get('categoryId')?.value),
        tags: this.selectedTags.map(tag => tag.id)
      };
      console.log(formData);
      if (!this.isEditMode) {
        this.newService.createNews(formData).subscribe({
          next: (response: any) => {
            console.log(response);
            if (response.id) {
              this.showNotification();
              this.newsForm.patchValue({
                content: '',
                title: '',
                summary: '',
                thumbnail: '',
              });
              this.selectedTags = [];
              this.fileSelected = null;
              this.fetchFileUrl = null;
              this.fetchFileName = null;
              this.clearThumbnail(event);
            }
          },
          error: (error: any) => {
            this.customNotification(error.error.message, 'error');
          }
        });
      } else {
        const localhostRegex = new RegExp(`${this.newService.viewImageUrl}`, "g")
        formData.content.replace(localhostRegex, "");
        console.log(formData.content)
        this.newService.updateNews(this.newsId, formData).subscribe({
          next: (response: any) => {
            console.log(response);
            if (response.id) {
              this.showNotification();
              this.newsForm.patchValue({
                content: '',
                title: '',
                summary: '',
                thumbnail: '',
              });
              this.selectedTags = [];
              this.fetchFileUrl = null;
              this.fetchFileName = null;
              this.fileSelected = null;
              this.clearThumbnail(event);
            }
          },
          error: (error: any) => {
            this.customNotification(error.error.message, 'error');
          }
        });
      }
    }
    setTimeout(() => {
      this.loadingService.hide();
    }, Common.TIME_OUT);
  }

  showNotification() {
    this.notificationService.show({
      message: 'Thao tác thành công!',
      type: 'success',
      duration: 5000
    });
  }
  customNotification(message: string, type: 'error' | 'success' | 'warning' | 'info'){
    this.notificationService.show({
      message: message,
      type: type,
      duration: 5000
    });
  }
  clearThumbnail(event: Event) {
    event.stopPropagation();
    this.thumbnailPreview = null;
    this.thumbnailFileName = null;

    const fileInput = document.getElementById('thumbnail') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async replaceBase64Images(content: string): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.getElementsByTagName('img');

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.getAttribute('src');
      if (src && src.startsWith('data:image')) {
        try {
          const file = await this.base64ToFile(src);
          const response = await this.newService.uploadImage(file);
          img.setAttribute('src', response.filePath);
          console.log(response)
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }

    return doc.body.innerHTML;
  }

  base64ToFile(dataurl: string): Promise<File> {
    return fetch(dataurl)
      .then(res => res.blob())
      .then(blob => {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const timestamp = new Date().getTime();
        const filename = `image_${timestamp}_${randomString}.jpg`;

        const file = new File([blob], filename, { type: "image/jpeg" });
        return file;
      });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.thumbnailFile = input.files[0];
      this.thumbnailFileName = this.thumbnailFile.name;
      this.previewThumbnail();
      // this.uploadImage(file).then(
      //   (response: any) => {
      //     this.newsForm.patchValue({ thumbnailId: response.id });
      //   },
      //   (error) => console.error('Upload failed:', error)
      // );
    }
  }
  previewThumbnail(): void {
    this.isVisible = true;
    if (this.thumbnailFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(this.thumbnailFile);
    }
  }

  private async resizeAndGetThumbnail(): Promise<File> {
    if (!this.thumbnailFile) {
      throw new Error('No thumbnail file selected');
    }

    if (this.thumbnailWidth !== this.originalThumbnailWidth ||
      this.thumbnailHeight !== this.originalThumbnailHeight) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }

            canvas.width = this.thumbnailWidth;
            canvas.height = this.thumbnailHeight;

            // Draw resized image
            ctx.drawImage(img, 0, 0, this.thumbnailWidth, this.thumbnailHeight);

            // Convert to file
            canvas.toBlob((blob) => {
              if (blob) {
                const resizedFile = new File([blob], this.thumbnailFile?.name || 'thumbnail.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, 'image/jpeg', 0.9);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        if (this.thumbnailFile)
        img.src = URL.createObjectURL(this.thumbnailFile);
      });
    }

    return this.thumbnailFile;
  }
  onThumbnailLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.originalThumbnailWidth = img.naturalWidth;
    this.originalThumbnailHeight = img.naturalHeight;
    if (!this.isEditMode){
      this.thumbnailWidth = this.originalThumbnailWidth;
      this.thumbnailHeight = this.originalThumbnailHeight;
    }
  }
  resetThumbnailSize(): void {
    this.thumbnailWidth = this.originalThumbnailWidth;
    this.thumbnailHeight = this.originalThumbnailHeight;
  }
}
