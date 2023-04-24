import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-detalle-mantenimientos-preventivos',
  templateUrl: './detalle-mantenimientos-preventivos.component.html',
  styleUrls: ['./detalle-mantenimientos-preventivos.component.scss']
})
export class DetalleMantenimientosPreventivosComponent implements OnInit {

  dataSourceDMP = new MatTableDataSource<any>();
  tipoDeEquipo: any;
  cantidadDeEquipos: any;

  displayedColumnsDMP: string[] = ['riesgo', 'equipo', 'vtoMP'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataSourceDMP.data = this.data;

    if (this.dataSourceDMP.data.length > 0) {

      this.cantidadDeEquipos = this.dataSourceDMP.data.length;

    }
  }


  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDMP.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
  }

}
