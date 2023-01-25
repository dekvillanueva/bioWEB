import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private customerNotifier: BehaviorSubject<Object> = new BehaviorSubject<Object>(false);
  private userNotifier: BehaviorSubject<Object> = new BehaviorSubject<Object>(false);

  public getCustomerNotifier(): Observable<Object> {
    return this.customerNotifier.asObservable();
  }

  public getUserNotifier(): Observable<Object> {
    return this.userNotifier.asObservable();
  }

  public setCustomerNotifier(value: Object): void {
    this.customerNotifier.next(value);
  }

  public setUserNotifier(value: Object): void {
    this.userNotifier.next(value);
  }

  constructor() { }
}
