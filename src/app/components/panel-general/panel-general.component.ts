import { Component, OnInit, Inject} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DetalleEquiposTallerComponent } from '../detalle-equipos-taller/detalle-equipos-taller.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';



export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

export interface Inventario {
  servicioId: number;
  servicio: string;
  inventario: number;
  taller: number;
}

export interface Certificaciones {
  totalC: number;
  vigentesC: number;
  pendientesC: number;
  vencimientosC: number;
}

export interface MantenimientosPreventivos {
  totalP: number;
  vigentesP: number;
  pendientesP: number;
  vencimientosP: number;
}

export interface EquiposTaller {
  equipo: string;
  diasTaller: number;
}


@Component({
  selector: 'app-panel-general',
  templateUrl: './panel-general.component.html',
  styleUrls: ['./panel-general.component.scss']
})



export class PanelGeneralComponent implements OnInit {

  resultadoPeticion: any;
  services: any;
  serviceId: any;

  dataSourceI: any;
  dataSourceC: any;
  dataSourceMP: any;
  equipmentsArr: any;

  customer: any;
  customerTickets: any;

  totalDevices: number;
  equiposTaller: any[] = [];
  datosInventario: Inventario[] = [];
  equiposCertificables: any[] = [];
  equiposCertificablesVigentes: any[] = [];
  equiposCertificablesByService: any[] = [];
  datosCertificaciones: Certificaciones[] = [];
  equiposConMantenimiento: any[] = [];
  datosMantenimientos: MantenimientosPreventivos[] = [];
  totalVigentes: number;
  totalPendientes: number;
  datosEquiposTaller: EquiposTaller[] = [];

  isShowingSpinner = false;

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy, public dialog: MatDialog,
    private router: Router, private userService: UserService) {
      
    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];
    
    this.totalDevices = 0;
    this.totalPendientes = 0;
    this.totalVigentes = 0;

  }

  openDialog(element: any) {
    //show spinner
    this.isShowingSpinner = true;
    this.datosEquiposTaller.length = 0;

    for(let eq of this.equiposTaller){
      if(eq.servicio === element.servicio){
        
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

  selectedRow(row: any) {
    console.log('selectedRow', row)
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

    //NOTIFICA SI HAY USUARIO LOGGEADO
    this.dataService.getCustomerNotifier().subscribe((value: Object) => {
      if (value!=-1) {
        this.customer = value;
      }else{
        this.customer = null;
      }
    });

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
            }
          }else{
            console.log("Código: " + this.resultadoPeticion.code);
          }
        },
        error: error => {
          console.error(error);
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
                  if (this.equiposCertificables[i].certificate_expiration_date_elec > this.equiposCertificables[i].now ||
                    this.equiposCertificables[i].certificate_expiration_date_elec == null) {
                      if (this.equiposCertificables[i].certificate_expiration_date_elec_format != null &&
                        this.equiposCertificables[i].certificate_expiration_date_format != null) {
                        this.equiposCertificablesVigentes.push(this.equiposCertificables[i]);
                        devCertVigentes = devCertVigentes + 1;
                        this.totalVigentes = this.totalVigentes + 1;
                      }
                  }
                } else if (this.equiposCertificables[i].certificable_elec == "No") {
                  if (this.equiposCertificables[i].certificate_expiration_date > this.equiposCertificables[i].now ||
                    this.equiposCertificables[i].certificate_expiration_date == null) {
                      if (this.equiposCertificables[i].certificate_expiration_date_elec_format != null &&
                        this.equiposCertificables[i].certificate_expiration_date_format != null) {
                        this.equiposCertificablesVigentes.push(this.equiposCertificables[i]);
                        devCertVigentes = devCertVigentes + 1;
                        this.totalVigentes = this.totalVigentes + 1;
                      }
                  }
                } else {
                  if ((this.equiposCertificables[i].certificate_expiration_date > this.equiposCertificables[i].now &&
                    this.equiposCertificables[i].certificate_expiration_date_elec > this.equiposCertificables[i].now) ||
                    (this.equiposCertificables[i].certificate_expiration_date > this.equiposCertificables[i].now &&
                      this.equiposCertificables[i].certificate_expiration_date_elec == null) ||
                    (this.equiposCertificables[i].certificate_expiration_date_elec > this.equiposCertificables[i].now &&
                      this.equiposCertificables[i].certificate_expiration_date == null)) {
                        if (this.equiposCertificables[i].certificate_expiration_date_elec_format != null &&
                          this.equiposCertificables[i].certificate_expiration_date_format != null) {
                          this.equiposCertificablesVigentes.push(this.equiposCertificables[i]);
                          devCertVigentes = devCertVigentes + 1;
                          this.totalVigentes = this.totalVigentes + 1;
                        }
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
            }

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

            this.datosInventario.push(
              {
                servicioId: service.services_id,
                servicio: service.service,
                inventario: parseInt(service.count),
                taller: devInTaller
              }
            );

            this.datosCertificaciones.push(
              {
                totalC: devCertificables,
                vigentesC: devCertVigentes,
                pendientesC: (devCertificables - devCertVigentes),
                vencimientosC: devCertPorVencer
              }
            );

            this.datosMantenimientos.push(
              {
                totalP: devConMantenimiento,
                vigentesP: devMantVigentes,
                pendientesP: (devConMantenimiento - devMantVigentes),
                vencimientosP: devMantPorVencer
              }
            );

          }

          this.dataSourceI = this.datosInventario;
          this.dataSourceC = this.datosCertificaciones;
          this.dataSourceMP = this.datosMantenimientos;
          
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



  displayedColumnsI: string[] = ['servicio', 'inventario', 'taller'];

  displayedColumnsC: string[] = ['totalC', 'vigentesC', 'pendientesC', 'vencimientosC'];

  displayedColumnsMP: string[] = ['totalP', 'vigentesP', 'pendientesP', 'vencimientosP'];

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
