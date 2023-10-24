import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss']
})
export class ForgotPasswordDialogComponent implements OnInit {

  constructor(private router: Router, public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>) { }

  ngOnInit(): void {
  }

  goToLogin(): void {
    this.router.navigate(["login"]);
    this.close();
  }

  close() {
    this.dialogRef.close();
  }

}
