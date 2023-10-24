import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from 'src/app/services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public forgotPassForm: FormGroup;

  private user: any
  resultadoPeticion: any;

  constructor(private formBuilder: FormBuilder, private userService: UserService, public dialog: MatDialog) {
    this.forgotPassForm = this.formBuilder.group({
      user: ["", [Validators.required]]
    });
  }

  ngOnInit(): void {
  }

  //method for error 
  public hasError = (controlName: string, errorName: string) => {
    return this.forgotPassForm.controls[controlName].hasError(errorName);
  };

  // function call on submit button click
  submitLoginForm(loginFormValue: any) {
    if (this.forgotPassForm.valid) {
      this.buttonLoginAction()
    }
  };

  //function post API for user forgot password
  buttonLoginAction() {
    this.user = {
      userName: this.forgotPassForm.controls["user"].value,
    };

    if (this.forgotPassForm.get('user') != null) {
      this.userService.forgotPassword(this.user)
        .subscribe({
          next: data => {
            this.resultadoPeticion = data;
            if (this.resultadoPeticion.code == 200) {
              const dialogConfig = new MatDialogConfig();
              this.dialog.open(ForgotPasswordDialogComponent, dialogConfig);
            } else if (this.resultadoPeticion.code == 409) {
              this.forgotPassForm.get('user')?.setErrors({ apiErr: true });
            }else{
              console.log("..." + this.resultadoPeticion.code);
            }
          },
          error: error => {
            console.error(error);
          }
        });
    }
  }
}
