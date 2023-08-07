import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { tick } from '@angular/core/testing';

export interface EquiposTaller {
  fechaET: string;
  equipoET: string;
  servicioET: string;
  estadoET: string;
  diasET: number;
  fallaET: string;
}

@Component({
  selector: 'app-equipos-taller',
  templateUrl: './equipos-taller.component.html',
  styleUrls: ['./equipos-taller.component.scss']
})
export class EquiposTallerComponent implements OnInit {

  isShowingSpinner = false;
  dataSource = new MatTableDataSource<any>();
  resultadoPeticion: any;
  userEquipments: any;
  customerTickets: any;
  equiposTaller: any[] = [];
  datosEquiposTaller: EquiposTaller[] = [];
  totalDeEquipos: number;
  customer: any;

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy,
    private router: Router, 
    private userService: UserService) {

      this.totalDeEquipos = 0;

  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

    //NOTIFICA SI HAY USUARIO LOGGEADO
    this.dataService.getCustomerNotifier().subscribe((value: Object) => {
      if (value!=-1) {
        this.customer = value;
      }else{
        this.customer = null;
      }
    });

    //show spinner
    this.isShowingSpinner = true;
    
    //list all tickets from OTRS by customerID

    if(this.customer != null){
      this.dashboardService.getTicketsByCustomer(this.customer.code).subscribe({

        next: data => {
          this.resultadoPeticion = data;
          if(this.resultadoPeticion.code == 200){
            this.customerTickets = this.resultadoPeticion.data;
            this.equiposTaller.length = 0;

            this.customerTickets = this.customerTickets.filter((ti : any) => {
              return !ti.equipo.includes("ERROR");
            });

            for(let ticket of this.customerTickets){
              this.equiposTaller.push(ticket); 
              let diff = differenceInDays(ticket.create_time, ticket.now);

              this.datosEquiposTaller.push({
                fechaET: ticket.create_time,
                equipoET: ticket.equipo,
                servicioET: ticket.servicio,
                estadoET: ticket.estado,
                diasET: diff,
                fallaET: ticket.falla
              })
            }

            this.totalDeEquipos = this.equiposTaller.length;
            this.dataSource.data = this.datosEquiposTaller;
          }else{
            console.log("Código: " + this.resultadoPeticion.code);
          }
          
          this.isShowingSpinner = false;
        },
        error: error => {
          console.error(error);
        }
      });
    }
  }

  displayedColumns: string[] = ['fechaET', 'equipoET', 'servicioET', 'estadoET',
    'diasET'];

}

function differenceInDays(firstdate: String, seconddate: String) {
  let dt1 = firstdate.split('-');
  let dt2 = seconddate.split('-');
  let one = new Date(parseInt(dt1[0]), parseInt(dt1[1]), parseInt(dt1[2]));
  let two = new Date(parseInt(dt2[0]), parseInt(dt2[1]), parseInt(dt2[2]));

  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;

  return Math.floor(days);
};
