import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import { Category } from "../news-editor/news-editor.component";
import { animate, style, transition, trigger } from '@angular/animations';
import { NewsService } from "../../services/news.service";
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
export interface MenuItem {
  id: number;
  name: string;
  route: string;
  icon: string;
}
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})

export class HeaderComponent implements OnInit, AfterViewInit {
  categories: Category[] = [];
  isMobileMenuOpen = false;
  isScrolled = false;
  selectedCategorySlug: string | null = null;
  selectedCategoryId: number = 2;

  constructor(
    private newsService: NewsService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSelectedCategory();
    });
  }
  contactInfo = {
    hotline: '024.3753.3659',
    email: 'khaothi@napa.vn'
  };

  menuItems: MenuItem[] = [];
  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 0;
  }
  ngAfterViewInit() {
    const headerHeight = this.elementRef.nativeElement.querySelector('.header').offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

    window.addEventListener('resize', () => {
      const newHeaderHeight = this.elementRef.nativeElement.querySelector('.header').offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${newHeaderHeight}px`);
    });
  }
  ngOnInit() {
    this.loadData().then(() => {
      this.updateSelectedCategory();
    });
  }

  async loadData(): Promise<void> {
    const data = await this.newsService.filterCategories().toPromise();
    this.categories = data;
    this.menuItems = data;
    this.menuItems.forEach((r: any) => {
      r.route = `/category/${r.id}`;
      if (r.id===1){
        r.icon = 'fas fa-home';
      }
      if (r.id===2){
        r.icon = 'fas fa-calendar-alt';
      }
      if (r.id===3){
        r.icon = 'fas fa-poll';
      }
      if (r.id===4){
        r.icon = 'fa fa-list-alt';
      }
      if (r.id===5){
        r.icon = 'fas fa-book';
      }
      if (r.id===6){
        r.icon = 'fas fa-bullhorn';
      }
      if (r.id===7){
        r.icon = 'fas fa-question-circle';
      }
    })
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  updateSelectedCategory() {
    const currentUrl = this.router.url;
    const categoryUrlRegex = /\/category\/([^\/]+)/;
    const match = currentUrl.match(categoryUrlRegex);
    this.selectedCategorySlug = match ? match[1] : null;
  }

  isSelected(categoryId: number): boolean {
    return this.selectedCategoryId === categoryId;
  }

  selectCategory(categorySlug: string, index: number) {
    this.selectedCategorySlug = categorySlug;
    this.selectedCategoryId = index;
    console.log(this.selectedCategorySlug)
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }
}
