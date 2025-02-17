import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'news-angular';
  isAdminRole: boolean = false;
  constructor(private router: Router,
              private authService: AuthService) {}
  isAdminRoute(): boolean {
    let isValid: boolean = this.authService.hasRole('ADMIN')||this.authService.hasRole('USER');
    // if (isValid){
    //   isValid = false;
    // }
    return isValid;
  }
  ngOnInit() {
  }
}
