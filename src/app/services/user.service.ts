import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  apiResponse : any;
  config : any;

  constructor(private http: HttpClient, private cookiesService:CookieService) { 
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get('token'),
        'SID': this.cookiesService.get('uid'),
        'CID': this.cookiesService.get('idc')}  
    }
  
  }
  
  getUserLogin (user: any){
		return this.http.post(API_URL+'users/login/', user);
	};

  getUserCustomers(){
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get('token'),
        'SID': this.cookiesService.get('uid'),
        'CID': this.cookiesService.get('idc')}  
    }
    return this.http.get(API_URL+"users/customers/logged/", this.config);
  }

  changeUserPassword(options: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get('token'),
        'SID': this.cookiesService.get('uid'),
        'CID': this.cookiesService.get('idc')}  
    }
		return this.http.post(API_URL +"users/change-password/", options, this.config);
	};

  changeUserPasswordLogin(options: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get('token'),
        'SID': this.cookiesService.get('uid'),
        'CID': this.cookiesService.get('idc')}  
    }

		return this.http.post(API_URL +"users/login/change-password/", options, this.config);
	};

  forgotPassword(options: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get('token'),
        'SID': this.cookiesService.get('uid'),
        'CID': this.cookiesService.get('idc')}  
    }
		return this.http.post(API_URL +"users/forgot-password/", options, this.config);
	};

}
