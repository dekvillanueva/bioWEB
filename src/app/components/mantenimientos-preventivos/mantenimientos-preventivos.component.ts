import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';


export interface MantenimientosPreventivos {
  servicioMP: string;
  totalMP: number;
  vigentesMP: number;
  pendientesMP: number;
  vencimientosMP: number;
}

@Component({
  selector: 'app-mantenimientos-preventivos',
  templateUrl: './mantenimientos-preventivos.component.html',
  styleUrls: ['./mantenimientos-preventivos.component.scss']
})
export class MantenimientosPreventivosComponent implements OnInit {

  serviceId: any;
  isShowingSpinner = false;
  totalDevices: number;
  dataSourceMP = new MatTableDataSource<any>();
  resultadoPeticion: any;
  services: any;
  equipmentsArr: any;
  equiposConMantenimiento: any[] = [];
  datosMantenimientos: MantenimientosPreventivos[] = [];

  totalMantenimiento: number;
  totalVigentes: number;
  totalPendientes: number;

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy,
    private router: Router, private userService: UserService) {
    
      this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];
      this.totalDevices = 0;
      this.totalMantenimiento = 0;
      this.totalPendientes = 0;
      this.totalVigentes = 0;
  }

  backClicked(event: Event) {
    this.location.back();
  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceMP.filter = filterValue.trim().toLowerCase();
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
    //list all devices from data base by customerID
    this.dashboardService.getServicesNumbers(this.serviceId).subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.services = this.resultadoPeticion.data;
          this.equipmentsArr = this.resultadoPeticion.detail;

          //get maintainable devices
          for (let device of this.equipmentsArr) {
            if (device.maintainable === "Yes") {
              this.equiposConMantenimiento.push(device);
            }
          }

          //get services for all devices
          for (let service of this.services) {
            let devConMantenimiento = 0;
            let devMantVigentes = 0;
            let devMantPorVencer = 0;

            //get maintainable devices by services
            for (let i = 0; i < this.equiposConMantenimiento.length; i++) {
              if (parseInt(this.equiposConMantenimiento[i].services_id) == parseInt(service.services_id)) {
                devConMantenimiento = devConMantenimiento + 1;

                //mantenimientos vigentes
                if (this.equiposConMantenimiento[i].maintenance_date != null &&
                  this.equiposConMantenimiento[i].maintenance_date > this.equiposConMantenimiento[i].now) {

                  devMantVigentes = devMantVigentes + 1;

                }

                //mantenimientos por vencer
                if (this.equiposConMantenimiento[i].maintenance_date != null) {
                  let diff = differenceInDays(this.equiposConMantenimiento[i].now, this.equiposConMantenimiento[i].maintenance_date);
                  if (diff > 0 && diff <= 30) {
                    devMantPorVencer = devMantPorVencer + 1;
                  }
                }
              }
            }

            this.datosMantenimientos.push(
              {
                servicioMP: service.service,
                totalMP: devConMantenimiento,
                vigentesMP: devMantVigentes,
                pendientesMP: (devConMantenimiento - devMantVigentes),
                vencimientosMP: devMantPorVencer
              }
            );

            this.totalMantenimiento =  this.totalMantenimiento + devConMantenimiento;
            this.totalVigentes = this.totalVigentes + devMantVigentes;
            this.totalPendientes = this.totalMantenimiento - this.totalVigentes;

          }

          console.log(this.datosMantenimientos);

          this.dataSourceMP.data = this.datosMantenimientos;
          this.isShowingSpinner = false;

        } else {
          console.log("Codigo: " + this.resultadoPeticion.code);
        }
      },
      error: error => {
        console.error(error);
      }
    });


  }

  displayedColumnsMP: string[] = ['servicioMP', 'totalMP', 'vigentesMP', 'pendientesMP',
                                  'vencimientosMP'];

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
