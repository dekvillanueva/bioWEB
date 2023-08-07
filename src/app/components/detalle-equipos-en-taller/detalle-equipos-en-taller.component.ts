import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-detalle-equipos-en-taller',
  templateUrl: './detalle-equipos-en-taller.component.html',
  styleUrls: ['./detalle-equipos-en-taller.component.scss']
})
export class DetalleEquiposEnTallerComponent implements OnInit {

  dataSourceDET = new MatTableDataSource<any>();
  tipoDeEquipo: any;
  cantidadDeEquipos: any;

  displayedColumnsDI: string[] = ['fechaET', 'equipoET', 'servicioET', 'estadoET',
  'diasET'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataSourceDET.data = this.data;  

    if(this.dataSourceDET.data.length > 0){
      this.cantidadDeEquipos = this.dataSourceDET.data.length;
    }

  }

  applyFilterET(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDET.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
  }

}
