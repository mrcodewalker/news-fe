import {booleanAttribute, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../environments/environment";
import {User} from "../components/user-management/user-management.component";

@Injectable({
  providedIn: 'root'
})
export class UserService{
  private loginUrl = environment.apiUrl+"user/login";
  private registerUrl = environment.apiUrl+"user/register";
  private filterUserUrl = environment.apiUrl+"user/filter";
  private deleteUserUrl = environment.apiUrl+"user/delete";
  private updateUserUrl = environment.apiUrl+"user/update";
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.loginUrl}`, body);
  }
  register(username: string, password: string, role: string): Observable<any>{
    const body = { username, password, role };
    return this.http.post(`${this.registerUrl}`, body);
  }
  filterUsers(active: boolean, page: number, size: number): Observable<any>{
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('active', active);
    return this.http.post(this.filterUserUrl, null, {params});
  }
  deleteUser(username: string): Observable<any>{
    return this.http.delete(this.deleteUserUrl+`/${username}`);
  }
  updateUser(username: string, user: User): Observable<any>{
    return this.http.put(this.updateUserUrl+`/${username}`,user);
  }
  constructor(private http: HttpClient) {
  }
}
