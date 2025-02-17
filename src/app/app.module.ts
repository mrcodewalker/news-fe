import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewsEditorComponent } from './components/news-editor/news-editor.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {QuillEditorComponent, QuillModule} from "ngx-quill";
import { NotificationComponent } from './components/notification/notification.component';
import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DraftEditorComponent } from './components/draft-editor/draft-editor.component';
import { ArticleManagementComponent } from './components/article-management/article-management.component';
import { ArticlePreviewModalComponent } from './components/article-preview-modal/article-preview-modal.component';
import {SafeHtmlPipe} from "./services/safe.html";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ArticlePostComponent } from './components/article-post/article-post.component';
import { ImageSliderComponent } from './components/image-slider/image-slider.component';
import { PdfImportComponent } from './components/pdf-import/pdf-import.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { HomeComponent } from './components/home/home.component';
import { ViewsPdfComponent } from './components/views-pdf/views-pdf.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import {CustomDatePipe} from "./services/custom.date.pipe";
import { LoginComponent } from './components/login/login.component';
import { StudentPostsTableComponent } from './components/student-posts-table/student-posts-table.component';
import {AuthInterceptor} from "./services/auth.interceptor";
import { UserManagementComponent } from './components/user-management/user-management.component';
import { NewsHeaderComponent } from './components/news-header/news-header.component';

@NgModule({
  declarations: [
    AppComponent,
    NewsEditorComponent,
    NotificationComponent,
    SidebarComponent,
    DraftEditorComponent,
    ArticleManagementComponent,
    ArticlePreviewModalComponent,
    SafeHtmlPipe,
    HeaderComponent,
    FooterComponent,
    ArticlePostComponent,
    ImageSliderComponent,
    PdfImportComponent,
    LoadingComponent,
    ArticleListComponent,
    HomeComponent,
    ViewsPdfComponent,
    ArticleDetailComponent,
    CustomDatePipe,
    LoginComponent,
    StudentPostsTableComponent,
    UserManagementComponent,
    NewsHeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    CKEditorModule,
    FormsModule,
    QuillModule.forRoot(),
    QuillEditorComponent,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
