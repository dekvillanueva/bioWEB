import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  user: any;
  resultadoPeticion: any;
  isLogin: boolean;
  title = "Biotrust Web Login";
  hide: any;
  userLogged: any;
  public loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private userService: UserService, 
    private cookieService: CookieService, private dataService: DataService, 
    private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required])
    });

    this.isLogin = false;
  }

  ngOnInit() {

  }

  //function post API for user login
  buttonLoginAction() {
    this.user = {
      userName: this.loginForm.controls["email"].value,
      userPassword: this.loginForm.controls["password"].value
    };

    this.userService.getUserLogin(this.user)
      .subscribe({
        next: data => {
          this.resultadoPeticion = data;
          if (this.resultadoPeticion.code == 200) {
            this.cookieService.set("uid", this.resultadoPeticion.data.id);
            this.cookieService.set("token", this.resultadoPeticion.data.token);
            this.cookieService.set("name", this.resultadoPeticion.data.user);
            this.cookieService.set("idp", this.resultadoPeticion.data.profiles_id);
            this.cookieService.set("idc", this.resultadoPeticion.data.companies_id);
            this.cookieService.set("company", this.resultadoPeticion.data.company);
						
            this.userLogged = this.resultadoPeticion.data;
            this.notifyForChange();

            if (this.resultadoPeticion.data.firstlogin != 0) {
              this.router.navigate(["select-customer"])
            } else {
              this.router.navigate(["actualizar-clave"]);
            }
          } else {
            alert(this.resultadoPeticion.description);
          }

        },
        error: error => {
          console.error(error);
        }
      });
  }

  //method for error in login
  public hasError = (controlName: string, errorName: string) => {
    return this.loginForm.controls[controlName].hasError(errorName);
  };

  // function call on submit login form
  submitLoginForm(loginFormValue: any) {
    if (this.loginForm.valid) {
      this.buttonLoginAction()
    }
  };

  //function to notify toolbar component about user logged
  notifyForChange() {
    this.dataService.setUserNotifier(this.userLogged);
  }

  //
  forgotPassword(){
    this.router.navigate(["forgot-password"]);
  }
  
}
