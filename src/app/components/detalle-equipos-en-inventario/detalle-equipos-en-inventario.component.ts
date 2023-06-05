import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-detalle-equipos-en-inventario',
  templateUrl: './detalle-equipos-en-inventario.component.html',
  styleUrls: ['./detalle-equipos-en-inventario.component.scss']
})
export class DetalleEquiposEnInventarioComponent implements OnInit {

  dataSourceDEE = new MatTableDataSource<any>();
  tipoDeEquipo: any;
  cantidadDeEquipos: any;

  displayedColumnsDI: string[] = ['equipo', 'servicio'];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 

    this.dataSourceDEE.data = this.data;  

    if(this.dataSourceDEE.data.length > 0){
      this.cantidadDeEquipos = this.dataSourceDEE.data.length;
    }

  }

  ngOnInit(): void {
  }

  applyFilterEE(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDEE.filter = filterValue.trim().toLowerCase();
  }

}
