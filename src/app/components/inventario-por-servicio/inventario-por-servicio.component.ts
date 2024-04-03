import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { DetalleInventarioPorServicioComponent } from '../detalle-inventario-por-servicio/detalle-inventario-por-servicio.component';

export interface Inventario {
  deviceTypeId: string;
  riesgo: string;
  tipo: string;
  total: number;
  serviceId: string;
}

export interface DetalleInventario {
  tipo: string;
  marca: string;
  modelo: string;
  serie: string;
  servicio: string;
}

@Component({
  selector: 'app-inventario-por-servicio',
  templateUrl: './inventario-por-servicio.component.html',
  styleUrls: ['./inventario-por-servicio.component.scss']
})
export class InventarioPorServicioComponent implements OnInit {

  servicio: string;
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

  urlParams: any;

  isShowingSpinner = false;

  displayedColumnsI: string[] = ['riesgo', 'tipo', 'total'];

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy, private _Activatedroute: ActivatedRoute,
    public dialog: MatDialog) {

    this.servicio = "";
    this.serviceId = ((<any>this.location)._platformLocation.location.href).split("?")[1];
    this.totalDeEquipos = 0;

  }

  selectedRow(row: any) {
    this.rowSelected = row;

    this.dashboardService.getUserEquipments().subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if (this.resultadoPeticion.code == 200) {
          this.datosDetalleInventario.length = 0;
          this.dataSourceDI.data.length = 0;
          this.equiposPorTipo = this.resultadoPeticion.data;

          this.equiposPorTipo = this.equiposPorTipo.filter((eq: any) => (eq.type===row.tipo)&&(eq.services_id===row.serviceId))
          
          for(let equipo of this.equiposPorTipo){
            this.datosDetalleInventario.push({
              tipo: equipo.type,
              marca: equipo.brand,
              modelo: equipo.model,
              serie: equipo.serial,
              servicio: "--"
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

  backClicked(event: Event) {
    this.location.back();
  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceI.filter = filterValue.trim().toLowerCase();
  }

  openDialog(datos: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data  = datos;
    
    this.dialog.open(DetalleInventarioPorServicioComponent, dialogConfig);  
  }

  ngOnInit(): void {

    //show spinner
    this.isShowingSpinner = true;

    this.urlParams = this._Activatedroute.paramMap.subscribe(params => {
      
      if(params.get('name') != null){
        this.servicio = params.get('name')!;
        this.serviceId = params.get('id');
        console.log(this.serviceId);
      }else{
        this.servicio = '';
        this.serviceId = -1;
      }

      //list equipos por servicio agrupados por tipo
      this.dashboardService.getEquipmentByServicesGroupByType(this.serviceId).subscribe({
        next: data => {
          this.resultadoPeticion = data;
          if (this.resultadoPeticion.code == 200) {
            this.devicesByType = this.resultadoPeticion.data;

            this.totalDeEquipos = 0;
            for (let device of this.devicesByType) {
              this.datosInventario.push({
                deviceTypeId: device.equipment_types_id,
                riesgo: device.class,
                tipo: device.name,
                total: device.count,
                serviceId: this.serviceId
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

    });


  }


}
