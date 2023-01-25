import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  resultadoPeticion: any;

  constructor(private userService: UserService, private cookieService: CookieService,
    private router: Router) {

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
