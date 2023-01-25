import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seguimientos',
  templateUrl: './seguimientos.component.html',
  styleUrls: ['./seguimientos.component.scss']
})
export class SeguimientosComponent implements OnInit {

  resultadoPeticion: any;

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy, private router: Router, 
    private userService: UserService) { 

    }


  backClicked(event: Event) {
    this.location.back();
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

  }

}
