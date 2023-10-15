import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-cambiar-clave',
  templateUrl: './cambiar-clave.component.html',
  styleUrls: ['./cambiar-clave.component.scss']
})
export class CambiarClaveComponent implements OnInit {

  public changePassForm: FormGroup;

  hide: any;

  constructor() { 
    this.changePassForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required])
    });

  }

  ngOnInit(): void {
  }

  // function call on submit login form
  submitLoginForm(loginFormValue: any) {
    if (this.changePassForm.valid) {
      this.buttonChangePassAction()
    }
  };

  //method for error in login
  public hasError = (controlName: string, errorName: string) => {
    return this.changePassForm.controls[controlName].hasError(errorName);
  };

  //function post API for user login
  buttonChangePassAction() {
  }

}
