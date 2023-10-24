import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';
import { API_URL } from 'src/app/constants';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LogoutDialogComponent } from '../logout-dialog/logout-dialog.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { UserMenuData } from './user-menu-data'

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {

  customerImage: any;
  apiUrl: string = API_URL;
  userLogged: any;
  isLogged: boolean = false;
  overlayOpened: boolean = false;
  resultadoPeticion: any;
  userMenuData = UserMenuData;


  constructor(private cookiesService: CookieService, private dataService: DataService,
    public dialog: MatDialog, private router: Router, private userService: UserService) {

  }

  ngOnInit(): void {

    //CHECK IF USER IS STILL LOGGED
    this.userService.getUserCustomers()
      .subscribe({
        next: data => {
          this.resultadoPeticion = data;

          if (this.resultadoPeticion.code != 200) {
            this.router.navigate(["login"]);
          }
        },
        error: error => {
          console.error(error);
        }
      });


    //NOTIFICA SI HAY CLIENTE PARA CARGAR SU LOGO 
    this.dataService.getCustomerNotifier().subscribe((value: Object) => {
      if (value != -1) {
        this.customerImage = value;
      } else {
        this.customerImage = null;
      }
    });

    //NOTIFICA SI HAY USUARIO
    this.dataService.getUserNotifier().subscribe((value: Object) => {
      if (value && value != -1) {
        this.userLogged = value;
        this.isLogged = true;
      } else {
        this.userLogged = null;
        this.isLogged = false;
      }
    });
  }

  openDialog() {
    this.overlayOpened = !this.overlayOpened;
  }

  userOverlayClick(event: any) {
    if (event.target.id === "Cerrar sesión") {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = { user: this.cookiesService.get("name") };
      dialogConfig.width = "350px";
      this.dialog.open(LogoutDialogComponent, dialogConfig);
      this.overlayOpened = false;
    }else if(event.target.id === "Cambiar clave"){
      this.router.navigate(["cambiar-clave"]);
      this.overlayOpened = false;
    }
  }

}


