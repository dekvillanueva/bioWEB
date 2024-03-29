import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CambiarClaveDialogComponent } from '../cambiar-clave-dialog/cambiar-clave-dialog.component';

@Component({
  selector: 'app-cambiar-clave',
  templateUrl: './cambiar-clave.component.html',
  styleUrls: ['./cambiar-clave.component.scss'],
  providers: [ValidatorService]
})
export class CambiarClaveComponent implements OnInit {

  public changePassForm: FormGroup;  

  resultadoPeticion: any;
  hide: any;

  constructor(private v: ValidatorService, private userService: UserService, 
    private formBuilder: FormBuilder, public dialog: MatDialog) {

    this.changePassForm = new FormGroup(
      {
        password: new FormControl("", [Validators.required]),
        newPassword: new FormControl("", [Validators.required, Validators.minLength(6)]),
        repeatNewPassword: new FormControl("", [Validators.required])
      },
      { validators: this.v.passwordMatch('newPassword', 'repeatNewPassword') }
    );
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

    const password = this.changePassForm.get('password');
    const newPassword = this.changePassForm.get('newPassword');
    const repeatNewPassword = this.changePassForm.get('repeatNewPassword');
    let user =
    {
      userPassword: password?.value,
      userNewPassword: newPassword?.value,
      userNewPassword2: repeatNewPassword?.value
    }

    this.userService.changeUserPassword(user)
      .subscribe({
        next: data => {
          this.resultadoPeticion = data;
          if (this.resultadoPeticion.code == 200) {
            const dialogConfig = new MatDialogConfig();
            this.dialog.open(CambiarClaveDialogComponent, dialogConfig);
          } else if (this.resultadoPeticion.code == 409) {
            this.changePassForm.get('repeatNewPassword')?.setErrors({ apiErr: true });
          } else {
            this.changePassForm.get('repeatNewPassword')?.setErrors({ apiErr: true });
          }
        },
        error: error => {
          console.error(error);
        }
      });
  }
}
