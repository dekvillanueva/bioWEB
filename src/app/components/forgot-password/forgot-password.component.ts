import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public forgotPassForm: FormGroup;

  constructor() {
    this.forgotPassForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
    });
   }

  ngOnInit(): void {
  }

  //method for error in login
  public hasError = (controlName: string, errorName: string) => {
    return this.forgotPassForm.controls[controlName].hasError(errorName);
  };

  // function call on submit login form
  submitLoginForm(loginFormValue: any) {
    if (this.forgotPassForm.valid) {
      this.buttonLoginAction()
    }
  };

  //function post API for user login
  buttonLoginAction() {
  }

}
