import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {NewsService} from "../../services/news.service";

@Component({
  selector: 'app-pdf-import',
  template: `
    <div class="pdf-import-container">
      <!-- Main Import Button or Selected File Display -->
      <div *ngIf="!hasSelectedFile"
           class="import-button"
           (click)="openModal()">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Import PDF
      </div>

      <!-- Selected File Display (Outside Modal) -->
      <div *ngIf="hasSelectedFile" class="selected-file-display">
        <div class="file-info">
          <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="file-name">{{selectedFile?.name}}</span>
          <span class="file-size">({{getFileSize(selectedFile?.size || 0)}})</span>
        </div>
        <button type="button" class="preview-button" (click)="togglePreview()">
          <i class="fa fa-eye"></i>
          {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
        </button>
        <button type="button" class="remove-file-button" (click)="removeFile()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div *ngIf="showPreview && pdfSrc && this.selectedFile" class="pdf-preview">
        <iframe [src]="pdfSrc" width="100%" height="600px"></iframe>
      </div>
      <!-- Modal Overlay -->
      <div *ngIf="isModalOpen"
           [@modalAnimation]
           class="modal-overlay">

        <!-- Modal Content -->
        <div class="modal-content"
             [class.show]="isModalOpen">

          <!-- Modal Header -->
          <div class="modal-header">
            <h2>Import PDF File</h2>
            <button type="button" (click)="closeModal()" class="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Drag & Drop Zone -->
          <div
            class="dropzone"
            [class.dragging]="isDragging"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)">

            <div class="dropzone-content">
              <!-- PDF Icon -->
              <svg class="pdf-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>

              <div class="upload-text">
                <p class="primary-text">Drag and drop your PDF here</p>
                <p class="secondary-text">or</p>
              </div>

              <label class="browse-button">
                <input
                  type="file"
                  accept=".pdf"
                  (change)="onFileSelected($event)">
                <span>Browse Files</span>
              </label>

              <p class="file-requirements">
                Maximum file size: 10MB
              </p>
            </div>
          </div>

          <!-- Selected File Preview -->
          <div *ngIf="selectedFile" class="file-preview">
            <div class="file-info">
              <div class="file-details">
                <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div class="file-text">
                  <p class="file-name">{{selectedFile.name}}</p>
                  <p class="file-size">{{getFileSize(selectedFile.size)}}</p>
                </div>
              </div>
              <button type="button"
                (click)="removeFile()"
                class="remove-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button type="button"
              (click)="closeModal()"
              class="cancel-button">
              Cancel
            </button>
            <button type="button"
              [disabled]="!selectedFile"
              (click)="uploadFile()"
              class="upload-button">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./pdf-import.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PdfImportComponent implements OnChanges{
  @Output() fileUploaded = new EventEmitter<File | null>();
  @Input() fileSelected: File | null = null;
  @Input() fileString: string | null = null;
  @Input() fileName: string | null = null;
  @Input() editMode: boolean | null = null;
  isModalOpen = false;
  isDragging = false;
  selectedFile: File | null = null;
  hasSelectedFile = false;
  pdfSrc: SafeUrl | null = null;
  showPreview = false;
  constructor(private sanitizer: DomSanitizer,
              private newService: NewsService) {}
  openModal(): void {
    if (!this.hasSelectedFile) {
      this.isModalOpen = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.fileSelected){
      this.handleFile(this.fileSelected);
      return;
    }
    console.log("VAO R")
    console.log(this.fileName+"/"+this.fileString)
    if (this.fileName === null && this.fileString === null) {
      this.selectedFile = null;
      this.hasSelectedFile = false;
      return;
    }

    if ((changes['fileName'] || changes['fileString']) &&
      this.fileName && this.fileString) {
      const url = this.newService.viewImageUrl + this.fileString;
      this.newService.urlToFile(url, this.fileName)
        .then(file => {
          this.handleFile(file);
        })
        .catch(error => {
          console.error("Error fetching file:", error);
        });
    }
  }
  closeModal(): void {
    this.isModalOpen = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('File size should not exceed 10MB');
      return;
    }

    this.selectedFile = file;
    this.hasSelectedFile = true;
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    if (this.selectedFile) {
      this.fileUploaded.emit(this.selectedFile);
    }
    // this.closeModal();
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  removeFile(): void {
    this.fileName = null;
    this.fileString = null;
    this.selectedFile = null;
    this.hasSelectedFile = false;
    this.pdfSrc = null;
    this.showPreview = false;
    this.fileUploaded.emit(null);
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.fileUploaded.emit(this.selectedFile);
      this.closeModal();
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
