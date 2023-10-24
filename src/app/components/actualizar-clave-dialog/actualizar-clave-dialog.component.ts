import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actualizar-clave-dialog',
  templateUrl: './actualizar-clave-dialog.component.html',
  styleUrls: ['./actualizar-clave-dialog.component.scss']
})
export class ActualizarClaveDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ActualizarClaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private cookiesService: CookieService,
     private router: Router, private dataService: DataService) {

  }

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
