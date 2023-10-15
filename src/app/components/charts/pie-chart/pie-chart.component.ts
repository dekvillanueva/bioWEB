import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'node_modules/chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { LocationStrategy } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DetalleEquiposEnTallerComponent } from '../../detalle-equipos-en-taller/detalle-equipos-en-taller.component';
import { DetalleEquiposEnInventarioComponent } from '../../detalle-equipos-en-inventario/detalle-equipos-en-inventario.component';


export interface DetalleEquiposTaller {
  fechaET: string;
  equipoET: string;
  servicioET: string;
  estadoET: string;
  diasET: number;
  fallaET: string;
}

export interface DetalleEquiposElectromedicos {
  equipo: string;
  servicio: string
}

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})

export class PieChartComponent implements OnInit {

  serviceId: any;
  equipmentsArr: any;
  resultadoPeticion: any;
  customer: any;
  customerTickets: any;

  isShowingSpinner = false;

  equiposCertificables: any[] = [];
  equiposCertificablesVigentes: any[] = [];
  equiposCertificablesNoVigentes: any[] = [];

  datosDetalleEquiposTallerMasCienDias: DetalleEquiposTaller[] = [];
  datosDetalleEquiposTallerMenosCienDias: DetalleEquiposTaller[] = [];

  datosDetalleEquiposElectromedicosPropios: DetalleEquiposElectromedicos[] = [];
  datosDetalleEquiposElectromedicosAlquilados: DetalleEquiposElectromedicos[] = [];
  datosDetalleEquiposElectromedicosComodatos: DetalleEquiposElectromedicos[] = [];
  datosDetalleEquiposElectromedicosOtros: DetalleEquiposElectromedicos[] = [];

  dataSourceDETMasCienDias = new MatTableDataSource<any>();
  dataSourceDETMenosCienDias = new MatTableDataSource<any>();

  dataSourceDEEPropios = new MatTableDataSource<any>();
  dataSourceDEEAlquilados = new MatTableDataSource<any>();
  dataSourceDEEComodato = new MatTableDataSource<any>();
  dataSourceDEEOtros = new MatTableDataSource<any>();

  totalCertificables: number;
  totalVigentes: number;
  totalPendientes: number;

  userEquipments: any;
  equiposTaller: any[] = [];
  equiposTallerMasCienDias: any[] = [];
  equiposTallerMenosCienDias: any[] = [];
  equiposElectromedicosPropios: any[] = [];
  equiposElectromedicosAlquilados: any[] = [];
  equiposElectromedicosComodato: any[] = [];
  equiposElectromedicosOtros: any[] = [];
  equiposConMantenimiento: any[] = [];


  constructor(private dashboardService: DashboardService, private location: LocationStrategy,
    private router: Router, public dialog: MatDialog, private dataService: DataService) {

    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];

    this.totalCertificables = 0;
    this.totalVigentes = 0;
    this.totalPendientes = 0;

  }


  createChart(etiquetas: string[], datos: number[], titulo: string, id: string): void {

    Chart.register(...registerables);
    const data = {
      labels: etiquetas,
      datasets: [{
        label: 'Dataset',
        data: datos,
        backgroundColor: [
          'rgb(66, 165, 245)',
          'rgb(255, 61, 0)',
          'rgb(255, 167, 38)',
          'rgb(102, 187, 106)'
        ],
        hoverOffset: 4
      }]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          display: false
        }
      },
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          padding: {
            top: 5,
            bottom: 20
          },
          font: {
            size: 18
          }
        }
      },
      'onClick': (evt: any, items: any) => {

        if (items) {
          if (evt.chart.config._config.options.plugins.title.text === "Mant. Preventivos") {
            this.router.navigate(["mantenimientos-preventivos"]);
          } else if (evt.chart.config._config.options.plugins.title.text === "Certificaciones") {
            this.router.navigate(["certificados"]);
          } else if (evt.chart.config._config.data.labels[items[0].index] === "Menor a 100 días") {
            this.openDialog(this.dataSourceDETMenosCienDias.data, "EquiposEnTaller");
          } else if (evt.chart.config._config.data.labels[items[0].index] === "Mayor a 100 días") {
            this.openDialog(this.dataSourceDETMasCienDias.data, "EquiposEnTaller");
          } else if (evt.chart.config._config.data.labels[items[0].index] === "Propio") {
            this.openDialog(this.dataSourceDEEPropios.data, "Inventario");
          } else if (evt.chart.config._config.data.labels[items[0].index] === "Alquilado") {
            this.openDialog(this.dataSourceDEEAlquilados.data, "Inventario");
          } else if (evt.chart.config._config.data.labels[items[0].index] === "Comodato") {
            this.openDialog(this.dataSourceDEEComodato.data, "Inventario");
          } else if (evt.chart.config._config.data.labels[items[0].index] === "Otros") {
            this.openDialog(this.dataSourceDEEOtros.data, "Inventario");
          }
        }
      }
    }

    const config: ChartConfiguration = {
      type: 'pie',
      data: data,
      options: options
    }


    const chartItemEquipos: ChartItem = document.getElementById(id) as ChartItem;
    let pieChart = new Chart(chartItemEquipos, config);

  }

  showMatPreventivos(): void {

  }

  ngOnInit(): void {

    this.searchData();

  }

  searchData(): void {

    //show spinner
    this.isShowingSpinner = true;



    this.dashboardService.getServicesNumbers(this.serviceId).subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if (this.resultadoPeticion.code == 200) {
          this.equipmentsArr = this.resultadoPeticion.detail;

          let propio = 0;
          let comodato = 0;
          let alquilado = 0;
          let otros = 0;

          let devCertificables = 0;
          let devCertVigentes = 0;
          let devCertPorVencer = 0;

          let mayor100Dias = 0;
          let menor100Dias = 0;

          let devMantVigentes = 0;
          let devMantPorVencer = 0;

          this.equiposElectromedicosPropios.length = 0;
          this.equiposElectromedicosAlquilados.length = 0;
          this.equiposElectromedicosComodato.length = 0;
          this.equiposElectromedicosOtros.length = 0;

          this.dataSourceDEEPropios.data.length = 0;
          this.dataSourceDEEAlquilados.data.length = 0;
          this.dataSourceDEEComodato.data.length = 0;
          this.dataSourceDEEOtros.data.length = 0;

          for (let equipo of this.equipmentsArr) {
            if (equipo.propio.includes('Propio')) {
              this.equiposElectromedicosPropios.push(equipo);
              this.dataSourceDEEPropios.data.push({
                equipo: equipo.equipment,
                servicio: equipo.service
              })
              propio++;
            } else if (equipo.propio.includes('Alquilado')) {
              this.equiposElectromedicosAlquilados.push(equipo);
              this.dataSourceDEEAlquilados.data.push({
                equipo: equipo.equipment,
                servicio: equipo.service
              })
              alquilado++;
            } else if (equipo.propio.includes('Comodato')) {
              this.equiposElectromedicosComodato.push(equipo);
              this.dataSourceDEEComodato.data.push({
                equipo: equipo.equipment,
                servicio: equipo.service
              })
              comodato++;
            } else {
              this.equiposElectromedicosOtros.push(equipo);
              this.dataSourceDEEOtros.data.push({
                equipo: equipo.equipment,
                servicio: equipo.servicie
              })
              otros++
            }

            if (equipo.certificable === "Yes" || equipo.certificable_elec === "Yes") {
              this.equiposCertificables.push(equipo);
            }
          }

          //get maintainable devices
          for (let device of this.equipmentsArr) {
            if (device.maintainable === "Yes") {
              this.equiposConMantenimiento.push(device);
            }
          }

          //get maintainable devices by services
          for (let i = 0; i < this.equiposConMantenimiento.length; i++) {

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

          devCertificables = this.equiposCertificables.length;

          for (let i = 0; i < this.equiposCertificables.length; i++) {
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
              }
            }

          }

          //PARA EQUIPOS EN TALLER

          //NOTIFICA SI HAY USUARIO LOGGEADO
          this.dataService.getCustomerNotifier().subscribe((value: Object) => {
            if (value != -1) {
              this.customer = value;
            } else {
              this.customer = null;
            }
          });

          //list all tickets from OTRS by customerID

          //     next: data => {
          //       this.resultadoPeticion = data;
          //       if (this.resultadoPeticion.code == 200) {
          //         this.customerTickets = this.resultadoPeticion.data;
          //         this.equiposTaller.length = 0;

          //         this.customerTickets = this.customerTickets.filter((ti: any) => {
          //           return !ti.equipo.includes("ERROR");
          //         });

          //         for (let ticket of this.customerTickets) {

          //           this.equiposTaller.push(ticket);
          //           let diff = differenceInDays(ticket.create_time, ticket.now);

          //           this.datosEquiposTaller.push({
          //             fechaET: ticket.create_time,
          //             equipoET: ticket.equipo,
          //             servicioET: ticket.servicio,
          //             estadoET: ticket.estado,
          //             diasET: diff,
          //             fallaET: ticket.falla
          //           })
          //         }

          //         this.totalDeEquipos = this.equiposTaller.length;
          //         this.dataSource.data = this.datosEquiposTaller;
          //       } else {
          //         console.log("Código: " + this.resultadoPeticion.code);
          //       }

          //       this.isShowingSpinner = false;
          //     },
          //     error: error => {
          //       console.error(error);
          //     }
          //   });
          // }

          //list all tickets from OTRS by customerID

          if (this.customer != null) {
            this.dashboardService.getTicketsByCustomer(this.customer.code).subscribe({
              next: data => {
                this.resultadoPeticion = data;

                if (this.resultadoPeticion.code == 200 || this.resultadoPeticion.code == 205) {
                  this.customerTickets = this.resultadoPeticion.data;
                  this.equiposTaller.length = 0;
                  this.equiposTallerMenosCienDias.length = 0;
                  this.equiposTallerMasCienDias.length = 0;
                  this.datosDetalleEquiposTallerMasCienDias.length = 0;
                  this.datosDetalleEquiposTallerMenosCienDias.length = 0;
                  this.dataSourceDETMasCienDias.data.length = 0;
                  this.dataSourceDETMenosCienDias.data.length = 0;

                  if (this.customerTickets != null) {
                    this.customerTickets = this.customerTickets.filter((ti: any) => {
                      return !ti.equipo.includes("ERROR");
                    });

                    for (let ticket of this.customerTickets) {

                      this.equiposTaller.push(ticket);
                      let diff = differenceInDays(ticket.create_time, ticket.now);

                      if (diff >= 100) {
                        mayor100Dias++;
                        this.equiposTallerMasCienDias.push(ticket);

                        this.datosDetalleEquiposTallerMasCienDias.push({
                          fechaET: ticket.create_time,
                          equipoET: ticket.equipo,
                          servicioET: ticket.servicio,
                          estadoET: ticket.estado,
                          diasET: diff,
                          fallaET: ticket.falla
                        });
                      } else {
                        menor100Dias++;
                        this.equiposTallerMenosCienDias.push(ticket);

                        this.datosDetalleEquiposTallerMenosCienDias.push({
                          fechaET: ticket.create_time,
                          equipoET: ticket.equipo,
                          servicioET: ticket.servicio,
                          estadoET: ticket.estado,
                          diasET: diff,
                          fallaET: ticket.falla
                        });
                      }
                    }
                  }


                  this.dataSourceDETMasCienDias.data = this.datosDetalleEquiposTallerMasCienDias;
                  this.dataSourceDETMenosCienDias.data = this.datosDetalleEquiposTallerMenosCienDias;

                  let etiquetasEquipos = ["Propio", "Alquilado", "Comodato", "Otros"];
                  let datosEquipos = [propio, alquilado, comodato, otros];
                  let tituloEquipos = "Total Equipos Electromédicos";
                  let idEquipos = "chart-equipos";
                  let etiquetasCertificaciones = ["Vigentes", "Pendientes", "A vencer"];
                  let datosCertificaciones = [devCertVigentes, devCertificables - devCertVigentes, devCertPorVencer];
                  let tituloCertificaciones = "Certificaciones";
                  let idCertificaciones = "chart-certificaciones";
                  let etiquetasEquiposTaller = ["Menor a 100 días", "Mayor a 100 días"];
                  let datosEquiposTaller = [menor100Dias, mayor100Dias];
                  let tituloEquiposTaller = "Equipos en taller";
                  let idEquiposTaller = "chart-equipos-taller";
                  let etiquetasPreventivos = ["Vigentes", "Pendientes", "A vencer"];
                  let datosPreventivos = [devMantVigentes, this.equiposConMantenimiento.length - devMantVigentes, devMantPorVencer];
                  let tituloPreventivos = "Mant. Preventivos";
                  let idPreventivos = "chart-preventivos";

                  let etiquetas = [];
                  let datos = [];
                  let ids = [];
                  let titulos = [];

                  etiquetas.push(etiquetasEquipos);
                  etiquetas.push(etiquetasCertificaciones);
                  etiquetas.push(etiquetasEquiposTaller);
                  etiquetas.push(etiquetasPreventivos);
                  datos.push(datosEquipos);
                  datos.push(datosCertificaciones);
                  datos.push(datosEquiposTaller);
                  datos.push(datosPreventivos);
                  titulos.push(tituloEquipos);
                  titulos.push(tituloCertificaciones);
                  titulos.push(tituloEquiposTaller);
                  titulos.push(tituloPreventivos);
                  ids.push(idEquipos);
                  ids.push(idCertificaciones);
                  ids.push(idEquiposTaller);
                  ids.push(idPreventivos);

                  for (let i = 0; i < 4; i++) {
                    this.createChart(etiquetas[i], datos[i], titulos[i], ids[i]);
                  }

                } else if (this.resultadoPeticion.code == 403) {
                  this.router.navigate(["login"])
                } else if (this.resultadoPeticion.code == 205) {
                  console.log(this.resultadoPeticion);
                }
              },
              error: error => {
                console.error(error);
              }

            });
          }
        } else if (this.resultadoPeticion.code == 403) {
          this.router.navigate(["login"])
        }
        this.isShowingSpinner = false;
      },
      error: error => {
        console.error(error);
      }
    });
  }

  openDialog(datos: any, tipo: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = datos;

    if (tipo === "EquiposEnTaller") {
      this.dialog.open(DetalleEquiposEnTallerComponent, dialogConfig);
    } else {
      this.dialog.open(DetalleEquiposEnInventarioComponent, dialogConfig);
    }

  }

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
