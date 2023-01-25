import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DetalleInventarioComponent } from '../detalle-inventario/detalle-inventario.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';



export interface Inventario {
  deviceTypeId: string;
  tipo: string;
  total: number;
}

export interface DetalleInventario {
  tipo: string;
  marca: string;
  modelo: string;
  serie: string;
  servicio: string;
  propietario: string;
}


@Component({
  selector: 'app-inventarios',
  templateUrl: './inventarios.component.html',
  styleUrls: ['./inventarios.component.scss']
})

export class InventariosComponent implements OnInit {

  servicio: String;
  resultadoPeticion: any;
  devicesByType: any;
  equiposPorTipo: any;
  dataSourceI = new MatTableDataSource<any>();
  dataSourceDI = new MatTableDataSource<any>();
  datosDetalleInventario: DetalleInventario[] = [];
  datosInventario: Inventario[] = [];
  services: any;
  serviceId: any;
  totalDeEquipos: number;
  rowSelected: any;

  equipmentsArr: any;

  isShowingSpinner = false;

  displayedColumnsI: string[] = ['tipo', 'total'];

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy, public dialog: MatDialog,
    private router: Router, private userService: UserService) {

    this.servicio = "Default";
    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];
    this.totalDeEquipos = 0;

  }

  selectedRow(row: any) {
    this.rowSelected = row;

    //show spinner
    this.isShowingSpinner = true;

    this.dashboardService.getServicesNumbers(this.serviceId).subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.services = this.resultadoPeticion.data;
          this.equipmentsArr = this.resultadoPeticion.detail;

          this.dashboardService.getEquipmentsByType(this.rowSelected.deviceTypeId).subscribe({
            next: data => {
              this.resultadoPeticion = data;
              if (this.resultadoPeticion.code == 200) {
                this.datosDetalleInventario.length = 0;
                this.dataSourceDI.data.length = 0;
                this.equiposPorTipo = this.resultadoPeticion.data;

                for (let equipo of this.equiposPorTipo) {

                  let eqConMasDatos = this.equipmentsArr.filter((eq: any) => (eq.equipment.includes(equipo.brand) &&
                    eq.equipment.includes(equipo.model) && eq.equipment.includes(equipo.serial)));

                  this.datosDetalleInventario.push({
                    tipo: equipo.type,
                    marca: equipo.brand,
                    modelo: equipo.model,
                    serie: equipo.serial,
                    servicio: eqConMasDatos[0].service,
                    propietario: eqConMasDatos[0].propio
                  })
                }
                
                this.dataSourceDI.data = this.datosDetalleInventario;
                this.openDialog(this.dataSourceDI.data);
              }
            },
            error: error => {
              console.error(error);
            }
          });

        }
        this.isShowingSpinner = false;
      },
      error: error => {
        console.error(error);
      }
    });

  }

  backClicked(event: Event) {
    this.location.back();
  }

  openDialog(datos: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = datos;

    this.dialog.open(DetalleInventarioComponent, dialogConfig);
  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceI.filter = filterValue.trim().toLowerCase();
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

    //list equipos por tipos
    this.dashboardService.getEquipmentsByTypeGroup().subscribe({
      next: data => {
        this.resultadoPeticion = data;
        if (this.resultadoPeticion.code == 200) {
          this.devicesByType = this.resultadoPeticion.data;
          this.totalDeEquipos = 0;
          for (let device of this.devicesByType) {
            this.datosInventario.push({
              deviceTypeId: device.equipment_types_id,
              tipo: device.name,
              total: device.count
            })
            this.totalDeEquipos = this.totalDeEquipos + parseInt(device.count);
          }
          this.dataSourceI.data = this.datosInventario;
          this.isShowingSpinner = false;
        }
      },
      error: error => {
        console.error(error);
      }
    });
  }
}
