import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false)
  loading$ = this.loadingSubject.asObservable()

  show() {
    console.log('Loading shown');
    this.loadingSubject.next(true);
  }

  hide() {
    console.log('Loading hidden');
    this.loadingSubject.next(false);
  }
}

