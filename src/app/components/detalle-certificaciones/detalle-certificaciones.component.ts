import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-detalle-certificaciones',
  templateUrl: './detalle-certificaciones.component.html',
  styleUrls: ['./detalle-certificaciones.component.scss']
})
export class DetalleCertificacionesComponent implements OnInit {

  dataSourceDC = new MatTableDataSource<any>();
  tipoDeEquipo: any;
  cantidadDeEquipos: any;


  displayedColumnsDC: string[] = ['riesgo', 'equipo', 'vtoPerformance', 'vtoElectrica', 'certificado'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 
    this.dataSourceDC.data = this.data;  
    
    if (this.dataSourceDC.data.length > 0) {

      this.cantidadDeEquipos = this.dataSourceDC.data.length;
      
    }
  }

  applyFilterI(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDC.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {


  }

}
