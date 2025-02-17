import { Component, type OnInit } from "@angular/core";
import { LoadingService } from "../../services/loading.service";

@Component({
  selector: "app-loading",
  template: `
    <div class="loading-overlay" *ngIf="loading$ | async">
      <div class="loading-content">
        <svg class="education-loader" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle class="orbit" cx="50" cy="50" r="45" />
          <g class="graduate">
            <path d="M50 20 L60 35 H40 Z" />
            <rect x="45" y="35" width="10" height="15" />
          </g>
          <g class="book">
            <path d="M30 70 L70 70 L70 85 L65 80 L60 85 L55 80 L50 85 L45 80 L40 85 L35 80 L30 85 Z" />
            <path class="page" d="M35 70 L65 70 L65 75 L35 75 Z" />
          </g>
          <g class="pencil">
            <rect x="45" y="25" width="10" height="40" transform="rotate(45 50 50)" />
            <polygon points="38.5,61.5 35,65 39,68.5" transform="rotate(45 50 50)" />
          </g>
          <circle class="atom-orbit" cx="50" cy="50" r="15" />
          <circle class="electron" cx="50" cy="35" r="3" />
        </svg>
        <h2 class="loading-text">Đang tải tri thức...</h2>
      </div>
    </div>
  `,
  styleUrls: ["./loading.component.scss"],
})
export class LoadingComponent implements OnInit {
  loading$ = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {
    this.loading$.subscribe((isLoading) => {
    });
  }
}
