// sidebar.component.ts
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-sidebar',
  template: `
    <app-header *ngIf="!isVisible"></app-header>
    <div class="sidebar-container" *ngIf="isVisible">
      <div class="sidebar" [class.expanded]="isExpanded">
        <nav>
          <div class="toggle-btn-container">
            <button class="toggle-btn" (click)="toggleSidebar()">
              <i class="fas" [class.fa-chevron-left]="isExpanded" [class.fa-chevron-right]="!isExpanded"></i>
            </button>
          </div>
          <!-- Menu phía trên -->
          <ul class="top-menu">
            <li>
              <a routerLink="/secret/admin/editor" routerLinkActive="active">
                <i class="fas fa-home"></i>
                <span *ngIf="isExpanded">Đăng bài</span>
              </a>
            </li>
            <li>
              <a *ngIf="this.authService.hasRole('ADMIN')" routerLink="/secret/admin/user/management" routerLinkActive="active">
                <i class="fas fa-user-alt"></i>
                <span *ngIf="isExpanded">Quản lý người dùng</span>
              </a>
            </li>
          </ul>

          <ul class="bottom-menu">
            <li>
              <a routerLink="/secret/admin/management" routerLinkActive="active">
                <i class="fas fa-cog"></i>
                <span *ngIf="isExpanded">Quản lý bài viết</span>
              </a>
            </li>
            <li>
              <a routerLinkActive="active" (click)="signOut()">
                <i class="fas fa-sign-out"></i>
                <span *ngIf="isExpanded">Đăng xuất</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="content" [class.expanded]="isExpanded" [class.with-sidebar]="isVisible">
      <router-outlet></router-outlet>
    </div>
    <app-footer *ngIf="!isVisible"></app-footer>
  `,
  styles: [`
    .sidebar-container {
      position: relative;
    }
    @media (max-width: 768px) {
      .hide-mobile{
        display: none;
      }
    }
    .sidebar {
      width: 60px;
      height: 100vh;
      background: #333;
      color: white;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
    }

    .sidebar.expanded {
      width: 200px;
    }

    nav {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .top-menu, .bottom-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .top-menu {
      flex-grow: 0;
    }

    .bottom-menu {
      flex-grow: 0;
    }

    .toggle-btn-container {
      flex-grow: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 15px 0;
      margin: 10px 0;
      border-top: 1px solid #444;
      border-bottom: 1px solid #444;
    }

    .toggle-btn {
      background: transparent;
      color: white;
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .toggle-btn:hover {
      background: #444;
      border-radius: 4px;
    }

    .content {
      transition: margin-left 0.3s ease;
      //padding: 20px;
    }

    .content.with-sidebar {
      margin-left: 60px;
    }

    .content.with-sidebar.expanded {
      margin-left: 200px;
    }

    nav ul li {
      padding: 0;
    }

    nav ul li a {
      display: flex;
      align-items: center;
      padding: 15px;
      color: white;
      text-decoration: none;
      white-space: nowrap;
    }

    nav ul li a:hover {
      background: #444;
    }

    nav ul li a.active {
      background: #555;
    }

    nav ul li a i {
      width: 30px;
      text-align: center;
    }

    nav ul li a span {
      margin-left: 10px;
      opacity: 1;
      transition: opacity 0.2s ease;
    }
  `]
})
export class SidebarComponent implements OnInit{
  isExpanded = false;
  isVisible: boolean = false;
  specialCase: string[] = [
    'secret/admin/editor',
    'secret/admin/draft/editor',
    'secret/admin/management',
    'secret/admin/user/management',
    'news/edit',
    '/secret/admin/sidebar'
  ]
  constructor(protected authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
    this.isVisible = (this.authService.hasRole('ADMIN')||this.authService.hasRole('USER'));
  }
  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = window.location.href;
      console.log(currentUrl);

      this.isVisible = this.specialCase.some(specialUrl => currentUrl.includes(specialUrl));

      if (this.isVisible) {
        console.log('URL matches a special case!');
      } else {
        console.log('URL does not match any special case.');
      }
    });
  }

  signOut(){
    this.authService.logout();
    this.router.navigate(['/']);
  }
  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }
}
