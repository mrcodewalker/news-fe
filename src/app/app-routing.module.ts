import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {NewsEditorComponent} from "./components/news-editor/news-editor.component";
import {DraftEditorComponent} from "./components/draft-editor/draft-editor.component";
import {ArticleManagementComponent} from "./components/article-management/article-management.component";
import {ArticlePostComponent} from "./components/article-post/article-post.component";
import {HomeComponent} from "./components/home/home.component";
import {ArticleDetailComponent} from "./components/article-detail/article-detail.component";
import {LoginComponent} from "./components/login/login.component";
import {AdminGuard} from "./services/admin.guard";
import {SidebarComponent} from "./components/sidebar/sidebar.component";
import {UserManagementComponent} from "./components/user-management/user-management.component";
import {UserGuard} from "./services/user.guard";

const routes: Routes = [
  { path: 'secret/admin/editor', component:  NewsEditorComponent, canActivate: [AdminGuard]},
  { path: 'secret/admin/draft/editor', component:  DraftEditorComponent, canActivate: [AdminGuard]},
  { path: 'secret/admin/management', component:  ArticleManagementComponent, canActivate: [AdminGuard]},
  { path: 'secret/admin/sidebar', component:  SidebarComponent, canActivate: [AdminGuard]},
  { path: 'news/edit/:id', component: NewsEditorComponent, canActivate: [AdminGuard] },
  { path: 'secret/admin/user/management', component: UserManagementComponent, canActivate: [UserGuard] },
  { path: 'category/:id', component: HomeComponent },
  { path: 'article/detail/:slug', component: ArticleDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
