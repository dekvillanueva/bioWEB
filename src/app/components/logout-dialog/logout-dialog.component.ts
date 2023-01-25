import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss']
})
export class LogoutDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LogoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private cookiesService: CookieService,
     private router: Router, private dataService: DataService) {

  }

  ngOnInit() {

  }

  close() {
    this.dialogRef.close();
  }

  logout() {

    this.cookiesService.delete('name');
    this.cookiesService.delete('token');
    this.cookiesService.delete('idp');
    this.cookiesService.delete('idc');
    this.cookiesService.delete('company');

    this.dataService.setUserNotifier(-1);
    this.dataService.setCustomerNotifier(-1);

    this.router.navigate(["login"]);

    this.dialogRef.close();

  }

}
