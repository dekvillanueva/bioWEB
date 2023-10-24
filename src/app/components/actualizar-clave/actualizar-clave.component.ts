import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { ValidatorService } from 'src/app/services/validator.service';
import { UserService } from 'src/app/services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActualizarClaveDialogComponent } from '../actualizar-clave-dialog/actualizar-clave-dialog.component';


@Component({
  selector: 'app-actualizar-clave',
  templateUrl: './actualizar-clave.component.html',
  styleUrls: ['./actualizar-clave.component.scss'],
  providers: [ValidatorService]
})
export class ActualizarClaveComponent implements OnInit {

  changePassForm!: FormGroup;
  hide: any;
  user: any;
  resultadoPeticion: any;

  constructor(private fb: FormBuilder, private v: ValidatorService, private userService: UserService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.changePassForm = new FormGroup(
      {
        newPassword: new FormControl('', [Validators.required]),
        repeatNewPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.v.passwordMatch('newPassword', 'repeatNewPassword') }
    );
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
    const password = this.changePassForm.get('newPassword');
    const repeatPassword = this.changePassForm.get('repeatNewPassword');
    let user =
    {
      userPassword: password?.value,
      userPassword2: repeatPassword?.value
    }

    this.userService.changeUserPasswordLogin(user)
      .subscribe({
        next: data => {
          this.resultadoPeticion = data;
          if (this.resultadoPeticion.code == 200) {
            const dialogConfig = new MatDialogConfig();
            this.dialog.open(ActualizarClaveDialogComponent, dialogConfig);
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
