import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
  selector: 'app-detalle-equipos-taller',
  templateUrl: './detalle-equipos-taller.component.html',
  styleUrls: ['./detalle-equipos-taller.component.scss']
})
export class DetalleEquiposTallerComponent implements OnInit {

  dataSourceDET = new MatTableDataSource<any>();
  equiposEnTaller: any;
  cantidadDeEquipos: any;

  displayedColumnsDET: string[] = ['equipo', 'diasTaller'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 

    this.dataSourceDET.data = this.data;
    if (this.dataSourceDET.data.length > 0) {

      this.cantidadDeEquipos = this.dataSourceDET.data.length;
      
    }

  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDET.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
  }

}
