import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DetalleEquiposTallerComponent } from '../detalle-equipos-taller/detalle-equipos-taller.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { DetalleCertificacionesComponent } from '../detalle-certificaciones/detalle-certificaciones.component';
import { DetalleMantenimientosPreventivosComponent } from '../detalle-mantenimientos-preventivos/detalle-mantenimientos-preventivos.component';



export interface TablaGeneral{
  servicioId: number;
  servicio: string;
  inventario: number;
  taller: number;
  totalC: number;
  vigentesC: number;
  pendientesC: number;
  vencimientosC: number; 
  totalP: number;
  vigentesP: number;
  pendientesP: number;
  vencimientosP: number;
}

export interface EquiposTaller {
  equipo: string;
  diasTaller: number;
}

export interface Certificaciones {
  riesgo: number;
  servicioId: number;
  servicio: string;
  equipo: string;
  equipoId: number;
  vtoPerformance: string;
  vtoElectrica: string;
  certificado: string;
}


export interface Mantenimientos {
  riesgo: number;
  servicioId: number;
  servicio: string;
  equipo: string;
  equipoId: number;
  vtoMP: string;
}

@Component({
  selector: 'app-vista-general',
  templateUrl: './vista-general.component.html',
  styleUrls: ['./vista-general.component.scss']
})

export class VistaGeneralComponent implements OnInit {

  resultadoPeticion: any;
  services: any;
  serviceId: any;

  dataSourceTG: any;

  equipmentsArr: any;
  customer: any;
  customerTickets: any;

  totalDevices: number;
  equiposTaller: any[] = [];
  datosInventario: TablaGeneral[] = [];
  equiposCertificables: any[] = [];
  equiposCertificablesVigentes: any[] = [];
  equiposCertificablesNoVigentes: any[] = [];
  equiposCertificablesPorVencer: any[] = [];
  equiposCertificablesByService: any[] = [];
  equiposConMantenimiento: any[] = [];
  equiposConMantenimientoVigente: any [] = [];
  equiposConMantenimientoNoVigente: any [] = [];
  equiposConMantenimientoPorVencer: any [] = [];
  totalVigentes: number;
  totalPendientes: number;
  datosEquiposTaller: EquiposTaller[] = [];
  eqCertVigPorServicio: any[] = [];
  eqCertNoVigPorServicio: any[] = [];
  equiposPorRiesgo: any;
  equiposPorRiesgoArr: any[] = [];
  datosCertificacionesTotales: Certificaciones[] = [];
  datosCertificacionesVigentes: Certificaciones[] = [];
  datosCertificacionesNoVigentes: Certificaciones[] = [];
  datosCertificacionesPorVencer: Certificaciones[] = [];
  datosMantenimientosTotales: Mantenimientos[] = [];
  datosMantenimientosVigentes: Mantenimientos[] = [];
  datosMantenimientosNoVigentes: Mantenimientos[] = [];
  datosMantenimientosPorVencer: Mantenimientos[] = [];

  dataSourceDC = new MatTableDataSource<any>();
  dataSourceDM = new MatTableDataSource<any>();

  isShowingSpinner = false;

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy, public dialog: MatDialog,
    private router: Router, private userService: UserService) {

    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];

    this.totalDevices = 0;
    this.totalPendientes = 0;
    this.totalVigentes = 0;

  }


  openDialogEquiposEnTaller(element: any) {
    //show spinner
    this.isShowingSpinner = true;
    this.datosEquiposTaller.length = 0;

    for (let eq of this.equiposTaller) {
      if (eq.servicio === element.servicio) {

        let diasT = differenceInDays(eq.create_time, eq.now);

        this.datosEquiposTaller.push({
          equipo: eq.equipo,
          diasTaller: diasT
        });
      }
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.datosEquiposTaller;

    this.dialog.open(DetalleEquiposTallerComponent, dialogConfig);
    this.isShowingSpinner = false;
  }

  getCertificacionesTotales(element: any){

    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDC.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }

        for (let eq of this.equiposCertificables) {
          let riesgo;
          if (eq.services_id == element.servicioId) {
            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {
              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            this.datosCertificacionesTotales.push({

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

        this.datosCertificacionesTotales = this.datosCertificacionesTotales.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDC.data = this.datosCertificacionesTotales;
        this.openDialogCertificaciones(this.dataSourceDC.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });

  }

  getCertificacionesVigentes(element: any) {
    this.eqCertVigPorServicio.length = 0;
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDC.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
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
          if (eq.services_id == element.servicioId) {
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
        this.openDialogCertificaciones(this.dataSourceDC.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });
  }

  getCertificacionesPendientes(element: any) {

    this.eqCertNoVigPorServicio.length = 0;
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDC.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
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
          if (eq.services_id == element.servicioId) {

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
        this.openDialogCertificaciones(this.dataSourceDC.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });
  }

  getCertificacionesPorVencer(element: any) {

    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDC.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }

        for (let eq of this.equiposCertificablesPorVencer) {
          let riesgo;
          if (eq.services_id == element.servicioId) {

            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {
              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            this.datosCertificacionesPorVencer.push({

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

        this.datosCertificacionesPorVencer.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDC.data = this.datosCertificacionesPorVencer;
        this.openDialogCertificaciones(this.dataSourceDC.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });
  }

  getMantenimientosTotales(element: any){
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDM.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }
        
        for (let eq of this.equiposConMantenimiento) {
          let riesgo;
          if (eq.services_id == element.servicioId) {
            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {

              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            this.datosMantenimientosTotales.push({
              riesgo: riesgo,
              servicioId: eq.services_id,
              servicio: eq.service,
              equipo: eq.equipment,
              equipoId: eq.id,
              vtoMP: eq.maintenance_date
            });
          }
        }

        this.datosMantenimientosTotales = this.datosMantenimientosTotales.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDM.data = this.datosMantenimientosTotales;
        this.openDialogMantenimientos(this.dataSourceDM.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });  
  }

  getMantenimientosVigentes(element: any){
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDM.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }
        
        for (let eq of this.equiposConMantenimientoVigente) {
          let riesgo;
          if (eq.services_id == element.servicioId) {
            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {

              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            //this.eqMPVigPorServicio.push(eq);

            this.datosMantenimientosVigentes.push({
              riesgo: riesgo,
              servicioId: eq.services_id,
              servicio: eq.service,
              equipo: eq.equipment,
              equipoId: eq.id,
              vtoMP: eq.maintenance_date
            });
          }
        }

        this.datosMantenimientosVigentes = this.datosMantenimientosVigentes.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDM.data = this.datosMantenimientosVigentes;
        this.openDialogMantenimientos(this.dataSourceDM.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });
  }

  getMantenimientosNoVigentes(element: any){
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDM.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }
        
        for (let eq of this.equiposConMantenimientoNoVigente) {
          let riesgo;
          if (eq.services_id == element.servicioId) {
            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {

              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            //this.eqMPVigPorServicio.push(eq);

            this.datosMantenimientosVigentes.push({
              riesgo: riesgo,
              servicioId: eq.services_id,
              servicio: eq.service,
              equipo: eq.equipment,
              equipoId: eq.id,
              vtoMP: eq.maintenance_date
            });
          }
        }

        this.datosMantenimientosVigentes = this.datosMantenimientosVigentes.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDM.data = this.datosMantenimientosVigentes;
        this.openDialogMantenimientos(this.dataSourceDM.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });
  }

  getMantenimientosPorVencer(element: any){
    //show spinner
    this.isShowingSpinner = true;
    this.dataSourceDM.data.length = 0;

    this.dashboardService.getEquipmentByServicesGroupByType(element.servicioId).subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if (this.resultadoPeticion.code == 200) {
          this.equiposPorRiesgo = this.resultadoPeticion.data;
          for (let e of this.equiposPorRiesgo) {
            this.equiposPorRiesgoArr.push(e);
          }
        }
        
        for (let eq of this.equiposConMantenimientoPorVencer) {
          let riesgo;
          if (eq.services_id == element.servicioId) {
            riesgo = '';
            //datos para agregar la clase de riesgo
            for (let dev of this.equiposPorRiesgoArr) {

              if (eq.equipment.includes(dev.name)) {
                riesgo = dev.class;
                break;
              }
            }

            this.datosMantenimientosPorVencer.push({
              riesgo: riesgo,
              servicioId: eq.services_id,
              servicio: eq.service,
              equipo: eq.equipment,
              equipoId: eq.id,
              vtoMP: eq.maintenance_date
            });
          }
        }

        this.datosMantenimientosPorVencer = this.datosMantenimientosPorVencer.sort(function (a: any, b: any) {
          var x = a.riesgo > b.riesgo ? -1 : 1;
          return x;
        });

        this.dataSourceDM.data = this.datosMantenimientosPorVencer;
        this.openDialogMantenimientos(this.dataSourceDM.data);

        this.isShowingSpinner = false;

      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });
  }

  openDialogCertificaciones(datos: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = datos;
    this.dialog.open(DetalleCertificacionesComponent, dialogConfig);
  }

  openDialogMantenimientos(datos: any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = datos;
    this.dialog.open(DetalleMantenimientosPreventivosComponent, dialogConfig);  
  }

  ngOnInit(): void {
    //CHECK IF USER IS STILL LOGGED
    this.userService.getUserCustomers()
      .subscribe({
        next: data => {
          this.resultadoPeticion = data;
          if (this.resultadoPeticion.code != 200) {
            this.router.navigate(["login"]);
          } else {
            //list all tickets from OTRS by customerID

            if (this.customer != null) {
              this.dashboardService.getTicketsByCustomer(this.customer.code).subscribe({

                next: data => {
                  this.resultadoPeticion = data;
                  if (this.resultadoPeticion.code == 200) {
                    this.customerTickets = this.resultadoPeticion.data;
                    this.equiposTaller.length = 0;

                    this.customerTickets = this.customerTickets.filter((ti: any) => {
                      return !ti.equipo.includes("ERROR");
                    });

                    for (let ticket of this.customerTickets) {
                      this.equiposTaller.push(ticket);
                      let diff = differenceInDays(ticket.create_time, ticket.now);
                    }
                  } else {
                    console.log("Código: " + this.resultadoPeticion.code);
                  }
                },
                error: error => {
                  console.error(error);
                  this.router.navigate(["login"]);
                }
              });
            }

            //list all devices from data base by customerID
            this.dashboardService.getServicesNumbers(this.serviceId).subscribe({
              next: data => {
                this.resultadoPeticion = data;

                if (this.resultadoPeticion.code == 200) {
                  this.services = this.resultadoPeticion.data;
                  this.equipmentsArr = this.resultadoPeticion.detail;


                  //get devices in taller
                  for (let device of this.equipmentsArr) {
                    if (device.certificable === "Yes" || device.certificable_elec === "Yes") {
                      this.equiposCertificables.push(device);
                    }
                    if (device.maintainable === "Yes") {
                      this.equiposConMantenimiento.push(device);
                    }
                  }

                  //get services for all devices
                  for (let service of this.services) {

                    this.totalDevices = this.totalDevices + parseInt(service.count);
                    let devInTaller = 0
                    let devCertificables = 0;
                    let devCertVigentes = 0;
                    let devCertPorVencer = 0;
                    let devConMantenimiento = 0;
                    let devMantVigentes = 0;
                    let devMantPorVencer = 0;

                    //get devices in taller by service
                    for (let i = 0; i < this.equiposTaller.length; i++) {
                      if (this.equiposTaller[i].servicio === service.service) {
                        devInTaller = devInTaller + 1;
                      }
                    }

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

                        //próximos vencimientos
                        if (this.equiposCertificables[i].certificate_expiration_date != null &&
                          this.equiposCertificables[i].certificate_expiration_date_elec != null) {
                          let diff1 = differenceInDays(this.equiposCertificables[i].now, this.equiposCertificables[i].certificate_expiration_date);
                          let diff2 = differenceInDays(this.equiposCertificables[i].now, this.equiposCertificables[i].certificate_expiration_date_elec);
                          if ((diff1 > 0 && diff1 <= 30) || (diff2 > 0 && diff2 <= 30)) {
                            devCertPorVencer = devCertPorVencer + 1;
                            this.equiposCertificablesPorVencer.push(this.equiposCertificables[i]);
                          }
                        }

                      }
                    }

                    //get maintainable devices by services
                    for (let i = 0; i < this.equiposConMantenimiento.length; i++) {
                      if (parseInt(this.equiposConMantenimiento[i].services_id) == parseInt(service.services_id)) {
                        devConMantenimiento = devConMantenimiento + 1;

                        //mantenimientos vigentes
                        if (this.equiposConMantenimiento[i].maintenance_date != null &&
                          this.equiposConMantenimiento[i].maintenance_date > this.equiposConMantenimiento[i].now) {

                          this.equiposConMantenimientoVigente.push(this.equiposConMantenimiento[i]);
                          devMantVigentes = devMantVigentes + 1;
                        }else{
                          this.equiposConMantenimientoNoVigente.push(this.equiposConMantenimiento[i])
                        }

                        //mantenimientos por vencer
                        if (this.equiposConMantenimiento[i].maintenance_date != null) {
                          let diff = differenceInDays(this.equiposConMantenimiento[i].now, this.equiposConMantenimiento[i].maintenance_date);
                          if (diff > 0 && diff <= 30) {
                            devMantPorVencer = devMantPorVencer + 1;
                            this.equiposConMantenimientoPorVencer.push(this.equiposConMantenimiento[i]);
                          }
                        }
                      }


                    }

                    this.datosInventario.push(
                      {
                        servicioId: service.services_id,
                        servicio: service.service,
                        inventario: parseInt(service.count),
                        taller: devInTaller,                      
                        totalC: devCertificables,
                        vigentesC: devCertVigentes,
                        pendientesC: (devCertificables - devCertVigentes),
                        vencimientosC: devCertPorVencer,
                        totalP: devConMantenimiento,
                        vigentesP: devMantVigentes,
                        pendientesP: (devConMantenimiento - devMantVigentes),
                        vencimientosP: devMantPorVencer
                      }
                    );

                  }

                  this.dataSourceTG = this.datosInventario;

                  this.isShowingSpinner = false;

                } else {
                  console.log("Codigo: " + this.resultadoPeticion.code);
                }
              },
              error: error => {
                console.error(error);
                this.isShowingSpinner = false;
                this.router.navigate(["login"]);
              }
            });
          }
        },
        error: error => {
          console.error(error);
          this.isShowingSpinner = false;
          this.router.navigate(["login"]);
        }
      });

    //show spinner
    this.isShowingSpinner = true;

    //NOTIFICA SI HAY USUARIO LOGGEADO
    this.dataService.getCustomerNotifier().subscribe((value: Object) => {
      if (value != -1) {
        this.customer = value;
      } else {
        this.customer = null;
      }
    });
  }

  displayedColumnsTG: string[] = ['servicio', 'inventario', 'taller', 'totalC', 'vigentesC', 
                                  'pendientesC', 'vencimientosC', 'totalP', 'vigentesP', 'pendientesP', 'vencimientosP'];

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
