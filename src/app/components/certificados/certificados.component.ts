import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DetalleCertificacionesComponent } from '../detalle-certificaciones/detalle-certificaciones.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

export interface Certificaciones {
  servicioId: number;
  servicio: string;
  total: number;
  vigentes: number;
  pendientes: number;
  vencimientos: number;
}

export interface CertificacionesVigentes {
  riesgo: number;
  servicioId: number;
  servicio: string;
  equipo: string;
  equipoId: number;
  vtoPerformance: string;
  vtoElectrica: string;
  certificado: string;
}



@Component({
  selector: 'app-certificados',
  templateUrl: './certificados.component.html',
  styleUrls: ['./certificados.component.scss']
})
export class CertificadosComponent implements OnInit {

  isShowingSpinner = false;
  dataSource = new MatTableDataSource<any>();
  dataSourceDC = new MatTableDataSource<any>();
  resultadoPeticion: any;
  serviceId: any;
  services: any;
  equipmentsArr: any;
  equiposCertificables: any[] = [];
  equiposCertificablesByService: any[] = [];
  equiposCertificablesVigentes: any[] = [];
  eqCertVigPorServicio: any[] = [];
  equiposCertificablesNoVigentes: any[] = [];
  eqCertNoVigPorServicio: any[] = [];
  datosCertificaciones: Certificaciones[] = [];
  datosCertificacionesVigentes: CertificacionesVigentes[] = [];
  datosCertificacionesNoVigentes: CertificacionesVigentes[] = [];
  totalCertificables: number;
  totalVigentes: number;
  totalPendientes: number;

  equiposPorRiesgo: any;
  equiposPorRiesgoArr: any[] = [];


  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy, public dialog: MatDialog,
    private router: Router, 
    private userService: UserService) {

    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];

    this.totalCertificables = 0;
    this.totalVigentes = 0;
    this.totalPendientes = 0;

  }


  backClicked(event: Event) {
    this.location.back();
  }

  getVigentes(servicio: any) {
    this.eqCertVigPorServicio.length = 0;
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDC.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(servicio.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }

        for (let eq of this.equiposCertificablesVigentes) {
          let riesgo;
          if (eq.services_id == servicio.servicioId) {
            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {
              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            this.eqCertVigPorServicio.push(eq);

            this.datosCertificacionesVigentes.push({

              riesgo: riesgo,
              servicioId: eq.services_id,
              servicio: eq.service,
              equipo: eq.equipment,
              equipoId: eq.id,
              vtoPerformance: eq.certificate_expiration_date_format,
              vtoElectrica: eq.certificate_expiration_date_elec_format,
              certificado: eq.idCertificados

            });


          }
        }

        this.datosCertificacionesVigentes = this.datosCertificacionesVigentes.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDC.data = this.datosCertificacionesVigentes;
        this.openDialog(this.dataSourceDC.data);

        this.isShowingSpinner = false;


      },
      error: error => {
        console.error(error);
      }
    });

  }

  getPendientes(servicio: any) {

    this.eqCertNoVigPorServicio.length = 0;
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDC.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(servicio.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }


        for (let eq of this.equiposCertificablesNoVigentes) {
          let riesgo;
          if (eq.services_id == servicio.servicioId) {

            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {
              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            this.eqCertNoVigPorServicio.push(eq);

            this.datosCertificacionesNoVigentes.push({

              riesgo: riesgo,
              servicioId: eq.services_id,
              servicio: eq.service,
              equipo: eq.equipment,
              equipoId: eq.id,
              vtoPerformance: eq.certificate_expiration_date_format,
              vtoElectrica: eq.certificate_expiration_date_elec_format,
              certificado: eq.idCertificados

            });

          }
        }

        this.datosCertificacionesNoVigentes.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });


        this.dataSourceDC.data = this.datosCertificacionesNoVigentes;
        this.openDialog(this.dataSourceDC.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
      }
    });


  }

  openDialog(datos: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = datos;

    this.dialog.open(DetalleCertificacionesComponent, dialogConfig);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

          for (let device of this.equipmentsArr) {
            if (device.certificable === "Yes" || device.certificable_elec === "Yes") {
              this.equiposCertificables.push(device);
            }
          }

          this.totalCertificables = this.equiposCertificables.length;

          //get services for all devices
          for (let service of this.services) {

            let devCertificables = 0;
            let devCertVigentes = 0;
            let devCertPorVencer = 0;

            //get certified devices by services
            for (let i = 0; i < this.equiposCertificables.length; i++) {
              if (parseInt(this.equiposCertificables[i].services_id) == parseInt(service.services_id)) {
                this.equiposCertificablesByService.push(this.equiposCertificables[i]);
                devCertificables = devCertificables + 1;

                //certificaciones vigentes
                if (this.equiposCertificables[i].certificable == "No") {
                  if (this.equiposCertificables[i].certificate_expiration_date_elec > this.equiposCertificables[i].now) {

                    if (this.equiposCertificables[i].certificate_expiration_date_elec_format != null) {
                      this.equiposCertificablesVigentes.push(this.equiposCertificables[i]);
                      devCertVigentes = devCertVigentes + 1;
                      this.totalVigentes = this.totalVigentes + 1;
                    }
                  } else {

                    this.equiposCertificablesNoVigentes.push(this.equiposCertificables[i]);

                  }
                } else if (this.equiposCertificables[i].certificable_elec == "No") {
                  if (this.equiposCertificables[i].certificate_expiration_date > this.equiposCertificables[i].now) {
                    if (this.equiposCertificables[i].certificate_expiration_date_format != null) {
                      this.equiposCertificablesVigentes.push(this.equiposCertificables[i]);
                      devCertVigentes = devCertVigentes + 1;
                      this.totalVigentes = this.totalVigentes + 1;
                    }
                  } else {
                    this.equiposCertificablesNoVigentes.push(this.equiposCertificables[i]);
                  }

                } else {
                  if ((this.equiposCertificables[i].certificate_expiration_date > this.equiposCertificables[i].now &&
                    this.equiposCertificables[i].certificate_expiration_date_elec > this.equiposCertificables[i].now)) {

                    if (this.equiposCertificables[i].certificate_expiration_date_elec_format != null &&
                      this.equiposCertificables[i].certificate_expiration_date_format != null) {
                      this.equiposCertificablesVigentes.push(this.equiposCertificables[i]);
                      devCertVigentes = devCertVigentes + 1;
                      this.totalVigentes = this.totalVigentes + 1;
                    }
                  } else {
                    this.equiposCertificablesNoVigentes.push(this.equiposCertificables[i]);
                  }

                }

                // //certificaciones NO vigentes
                // if(this.equiposCertificables[i].certificate_expiration_date < this.equiposCertificables[i].now
                //     || this.equiposCertificables[i].certificate_expiration_date_elec < this.equiposCertificables[i].now){

                //       this.equiposCertificablesNoVigentes.push(this.equiposCertificables[i]);

                // }

                //próximos vencimientos
                if (this.equiposCertificables[i].certificate_expiration_date != null &&
                  this.equiposCertificables[i].certificate_expiration_date_elec != null) {
                  let diff1 = differenceInDays(this.equiposCertificables[i].now, this.equiposCertificables[i].certificate_expiration_date);
                  let diff2 = differenceInDays(this.equiposCertificables[i].now, this.equiposCertificables[i].certificate_expiration_date_elec);
                  if ((diff1 > 0 && diff1 <= 30) || (diff2 > 0 && diff2 <= 30)) {
                    devCertPorVencer = devCertPorVencer + 1;
                  }
                }

              }
            }

            this.totalPendientes = this.totalCertificables - this.totalVigentes;

            this.datosCertificaciones.push(
              {
                servicioId: service.services_id,
                servicio: service.service,
                total: devCertificables,
                vigentes: devCertVigentes,
                pendientes: (devCertificables - devCertVigentes),
                vencimientos: devCertPorVencer
              }
            );

          }


          this.dataSource.data = this.datosCertificaciones;
          this.isShowingSpinner = false;

        } else {
          console.log("Codigo: " + this.resultadoPeticion.code);
        }
      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });

  }

  displayedColumns: string[] = ['servicio', 'total', 'vigentes', 'pendientes', 'vencimientos'];

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

function sort_by_key(array: any, key: any) {
  return array.sort(function (a: any, b: any) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
};
