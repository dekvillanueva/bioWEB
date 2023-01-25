import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'node_modules/chart.js';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { Router } from '@angular/router';

export interface Servicio {
  value: string;
  viewValue: string;
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

  isShowingSpinner = false;

  equiposCertificables: any[] = [];
  equiposCertificablesVigentes: any[] = [];
  equiposCertificablesNoVigentes: any[] = [];

  totalCertificables: number;
  totalVigentes: number;
  totalPendientes: number;

  userEquipments: any;
  equiposTaller: any[] = [];
  equiposConMantenimiento: any[] = [];

  constructor(private dashboardService: DashboardService, private location: LocationStrategy, private router: Router) {

    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];

    this.totalCertificables = 0;
    this.totalVigentes = 0;
    this.totalPendientes = 0;

  }

  servicios: Servicio[] = [
    { value: 'UTI-0', viewValue: 'UTI' },
    { value: 'Neonatología-1', viewValue: 'NEONATOLOGIA' },
    { value: 'Quirófano-2', viewValue: 'QUIRÓFANO' },
  ];

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
      }
    }

    const config: ChartConfiguration = {
      type: 'pie',
      data: data,
      options: options
    }

    const chartItemEquipos: ChartItem = document.getElementById(id) as ChartItem
    new Chart(chartItemEquipos, config);

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

          for (let equipo of this.equipmentsArr) {
            if (equipo.propio.includes('Propio')) {
              propio++;
            } else if (equipo.propio.includes('Alquilado')) {
              alquilado++;
            } else if (equipo.propio.includes('Comodato')) {
              comodato++;
            } else {
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

                    if (diff >= 100) {
                      mayor100Dias++;
                    } else {
                      menor100Dias++;
                    }

                  }
                }

                let etiquetasEquipos = ["Propio", "Alquilado", "Comodato", "otros"];
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

              } else if(this.resultadoPeticion.code == 403){
                this.router.navigate(["login"])
              }
            },
            error: error => {
              console.error(error);
            }

          });

        } else if(this.resultadoPeticion.code == 403){
          this.router.navigate(["login"])
        }
        this.isShowingSpinner = false;
      },
      error: error => {
        console.error(error);
      }
    });
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
