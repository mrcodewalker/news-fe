import {Component, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { NewsService } from "../../services/news.service";
import { trigger, state, style, animate, transition } from '@angular/animations';

export interface PdfFile {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  dimensions: any;
  createdAt: string;
}

@Component({
  selector: 'app-views-pdf',
  templateUrl: './views-pdf.component.html',
  styleUrls: ['./views-pdf.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: 'translateY(-20px)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ViewsPdfComponent implements OnInit {
  pdfFiles: PdfFile[] = []
  selectedFile: PdfFile | null = null
  previewFileName: string | null = null
  isModalOpen = false
  @Output() fileSelected = new EventEmitter<PdfFile>()

  constructor(private pdfService: NewsService) {}

  ngOnInit(): void {
    this.loadPdfFiles()
  }

  loadPdfFiles(): void {
    this.pdfService.getPdfFiles().subscribe(
      (files: PdfFile[]) => {
        this.pdfFiles = files
      },
      (error) => {
        console.error("Error loading PDF files:", error)
      },
    )
  }

  openModal(): void {
    this.isModalOpen = true
  }

  closeModal(): void {
    this.isModalOpen = false
    this.selectedFile = null
  }

  previewFile(file: PdfFile): void {
    this.previewFileName = file.fileName
    setTimeout(() => {
      this.previewFileName = null
    }, 3000)
  }

  selectFile(file: PdfFile): void {
    this.selectedFile = file;
    console.log(this.selectedFile);
  }

  onDoneClick(): void {
    if (this.selectedFile) {
      this.fileSelected.emit(this.selectedFile);
      this.closeModal()
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + " B"
    if (size < 1048576) return (size / 1024).toFixed(2) + " KB"
    return (size / 1048576).toFixed(2) + " MB"
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }
}
