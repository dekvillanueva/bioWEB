import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-detalle-inventario-por-servicio',
  templateUrl: './detalle-inventario-por-servicio.component.html',
  styleUrls: ['./detalle-inventario-por-servicio.component.scss']
})
export class DetalleInventarioPorServicioComponent implements OnInit {

  dataSourceDI = new MatTableDataSource<any>();
  tipoDeEquipo: any;
  cantidadDeEquipos: any;

  displayedColumnsDI: string[] = ['marca', 'modelo', 'serie'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataSourceDI.data = this.data;
    if (this.dataSourceDI.data.length > 0) {
      this.tipoDeEquipo = this.dataSourceDI.data[0].tipo;
      this.cantidadDeEquipos = this.dataSourceDI.data.length;
    }

  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDI.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
  }

}
