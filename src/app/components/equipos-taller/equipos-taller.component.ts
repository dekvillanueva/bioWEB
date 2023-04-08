import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

export interface EquiposTaller {
  tipoET: string;
  marcaET: string;
  modeloET: string;
  serieET: string;
  servicioET: string;
  diasET: number;
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
  equiposTaller: any[] = [];
  datosEquiposTaller: EquiposTaller[] = [];
  totalDeEquipos: number;

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

    //show spinner
    this.isShowingSpinner = true;
    //list all devices from database by customerID
    this.dashboardService.getUserEquipments().subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.userEquipments = this.resultadoPeticion.data;
          this.equiposTaller.length = 0;

          for (let equipment of this.userEquipments) {

            if (parseInt(equipment.workshop) > 0) {
              this.equiposTaller.push(equipment);

              let diff = differenceInDays(equipment.workshop_date, equipment.now);

              this.datosEquiposTaller.push(
                {
                  tipoET: equipment.type,
                  marcaET: equipment.brand,
                  modeloET: equipment.model,
                  serieET: equipment.serial,
                  servicioET: equipment.service,
                  diasET: diff
                }
              );
            }
          }

          this.totalDeEquipos = this.equiposTaller.length;

          this.dataSource.data = this.datosEquiposTaller;

        } else {
          console.log("Codigo: " + this.resultadoPeticion.code);
        }

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
      }

    });


  }

  displayedColumns: string[] = ['fechaET', 'servicioET', 'tipoET', 'serieET', 'servicioET',
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
