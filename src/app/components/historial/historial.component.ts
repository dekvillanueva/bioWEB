import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DatePipe, LocationStrategy } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { debounceTime } from "rxjs/operators";
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';


export interface TipoDeEquipo {
  id: number;
  name: string;
}

export interface Marca {
  id: number;
  name: string;
}

export interface Modelo {
  id: number;
  name: string;
}

export interface Serie {
  id: number;
  name: string;
}

export interface SearchOption {
  etypeId: number;
  brandId: number;
  modelId: number;
  serialId: number;
};

export interface Historial {
  fechaH: string;
  servicioH: string;
  tipoH: string;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

  myControlT: FormControl;
  myControlM: FormControl;
  myControlMo: FormControl;
  myControlS: FormControl;

  optionsTipos: TipoDeEquipo[] = [];
  optionsMarcas: Marca[] = [];
  optionsModelos: Modelo[] = [];
  optionsSeries: Serie[] = [];
  optionsEquipment: SearchOption[] = [];

  datosHistorial: Historial[] = [];

  filteredOptionsTipos: Observable<TipoDeEquipo[]>;
  filteredOptionsMarcas: Observable<Marca[]>;
  filteredOptionsModelos: Observable<Modelo[]>;
  filteredOptionsSeries: Observable<Serie[]>;

  resultadoPeticion: any;
  tiposDeEquipos: any;
  marcasDeEquipos: any;
  modeloDeEquipos: any;
  serieDeEquipos: any;
  equiposPorTipo: any;
  equiposFiltrados: any;
  equiposFiltradosModelos: any;
  historialList: any;


  tipoSeleccionado: TipoDeEquipo;
  marcaSeleccionada: Marca;
  modeloSeleccionado: Modelo;
  serieSeleccionada: Serie;

  isShowingSpinner = false;

  constructor(private cookiesService: CookieService, private dashboardService: DashboardService,
    private dataService: DataService, private location: LocationStrategy,
    private router: Router, private userService: UserService) {

    this.tipoSeleccionado = { id: 0, name: "" };
    this.marcaSeleccionada = { id: 0, name: "" };
    this.modeloSeleccionado = { id: 0, name: "" };
    this.serieSeleccionada = { id: 0, name: "" };

    this.myControlT = new FormControl('');
    this.myControlM = new FormControl('');
    this.myControlMo = new FormControl('');
    this.myControlS = new FormControl('');

    this.filteredOptionsTipos = this.myControlT.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterT(name as string) : this.optionsTipos.slice();
      }),
    );

    this.filteredOptionsMarcas = this.myControlM.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterM(name as string) : this.optionsMarcas.slice();
      }),
    );

    this.filteredOptionsModelos = this.myControlMo.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterMo(name as string) : this.optionsModelos.slice();
      }),
    );

    this.filteredOptionsSeries = this.myControlS.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterS(name as string) : this.optionsSeries.slice();
      }),
    );

  }

  backClicked(event: Event) {
    this.location.back();
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
          this.tiposDeEquipos = this.resultadoPeticion.data;
          this.optionsTipos.length = 0;

          for (let device of this.tiposDeEquipos) {
            this.optionsTipos.push(device)
          }

          this.isShowingSpinner = false;
        }
      },
      error: error => {
        console.error(error);
        this.isShowingSpinner = false;
      }
    });

  }

  displayedColumns: string[] = ['fechaH', 'servicioH', 'tipoH'];

  //get tipo de equipo function
  getTipo(tipo: any) {

    if (tipo != null) {
      //list marcas de equipos
      this.tipoSeleccionado.id = tipo.equipment_types_id;
      this.tipoSeleccionado.name = tipo.name;
      this.isShowingSpinner = true;

      this.dashboardService.getEquipmentsByType(tipo.equipment_types_id).subscribe({
        next: data => {
          this.resultadoPeticion = data;

          if (this.resultadoPeticion.code == 200) {

            this.equiposPorTipo = this.resultadoPeticion.data;
            this.optionsMarcas.length = 0;

            //filtro repetidos
            this.equiposFiltrados = this.equiposPorTipo.filter((item: any, index: any, self: any) =>
              index === self.findIndex((t: any) => (
                t.brand === item.brand && t.brands_id === item.brands_id
              )));

            for (let equipo of this.equiposFiltrados) {

              this.optionsMarcas.push({
                id: equipo.brands_id,
                name: equipo.brand
              });
            }

            this.filteredOptionsMarcas = this.myControlM.valueChanges.pipe(
              startWith(''),
              debounceTime(250),
              map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._filterM(name as string) : this.optionsMarcas.slice();
              }),
            );

            this.isShowingSpinner = false;
          }
        },
        error: error => {
          console.error(error);
          this.isShowingSpinner = false;
        }
      });

    }
  }

  //get marca de equipo function
  getMarca(marca: Marca) {
    if (marca != null && this.tipoSeleccionado != null) {
      //list modelos de equipos
      this.marcaSeleccionada = marca;
      this.isShowingSpinner = true;

      this.optionsModelos.length = 0;
      this.equiposFiltrados.length = 0;

      for (let equipo of this.equiposPorTipo){
        if(equipo.equipment_types_id === this.tipoSeleccionado.id && equipo.brands_id === this.marcaSeleccionada.id){
          this.equiposFiltrados.push(equipo);
        }
      }

      //filtro repetidos
      this.equiposFiltradosModelos = this.equiposFiltrados.filter((item: any, index: any, self: any) =>
      index === self.findIndex((t: any) => (
        t.model === item.model && t.models_id === item.models_id
      )));

      for (let equipo of this.equiposFiltradosModelos) {

        this.optionsModelos.push({
          id: equipo.models_id,
          name: equipo.model
        });
      }

      this.filteredOptionsModelos = this.myControlMo.valueChanges.pipe(
        startWith(''),
        debounceTime(250),
        map(value => {
          const name = typeof value === 'string' ? value : value?.name;
          return name ? this._filterMo(name as string) : this.optionsModelos.slice();
        }),
      );

      this.isShowingSpinner = false;

    }
  }

  //get modelo de equipo function
  getModelo(modelo: Modelo) {
    if (modelo != null && this.marcaSeleccionada != null && this.tipoSeleccionado != null) {
      //list modelos de equipos
      this.modeloSeleccionado.id = modelo.id;
      this.isShowingSpinner = true;

      this.optionsEquipment.push({
        etypeId: this.tipoSeleccionado.id,
        brandId: this.marcaSeleccionada.id,
        modelId: this.modeloSeleccionado.id,
        serialId: 0
      })
      
      
      this.dashboardService.getEquipmentSerialsByParameters(this.sumOne(this.tipoSeleccionado.id),
        this.marcaSeleccionada.id, this.modeloSeleccionado.id).subscribe({
          next: data => {
            this.resultadoPeticion = data;

            if (this.resultadoPeticion.code == 200) {

              this.serieDeEquipos = this.resultadoPeticion.data;
              this.optionsSeries.length = 0;

              for (let serie of this.serieDeEquipos) {

                this.optionsSeries.push({
                  id: serie.id,
                  name: serie.name
                });

                console.log(serie.id);

              }
            }

            this.filteredOptionsSeries = this.myControlS.valueChanges.pipe(
              startWith(''),
              debounceTime(250),
              map(value => {
                const name = typeof value === 'string' ? value : value?.name;
                return name ? this._filterS(name as string) : this.optionsSeries.slice();
              }),
            );

            this.isShowingSpinner = false;
          },
          error: error => {
            console.error(error);
          }
        });
    }
  }

  //select a serial number
  selectSerial(serial: Serie){
    if(serial != null){
      this.serieSeleccionada = serial;
      this.isShowingSpinner = true;
      let aux = '*';

      this.dashboardService.getTracesByEquipment(this.serieSeleccionada.id).subscribe({
          next: data => {
            this.resultadoPeticion = data;

            if (this.resultadoPeticion.code == 200) {
              
              this.historialList = this.resultadoPeticion.data;
              this.datosHistorial.length = 0;

              for(let dato of this.historialList){

                if(dato.type === "I" ){
                  aux = "Alta en Sistema";
                }else if(dato.type === "B"){
                  aux = "Baja Operativa";
                }else if(dato.type === "W"){
                  aux = "Ingreso a Taller";
                }else if(dato.type === "Z"){
                  aux = "Egreso de Taller";
                }else if(dato.type === "M"){
                  aux = "Mantenimiento";
                }else if(dato.type === "C"){
                  aux = "Certificación";
                }else {
                  aux = "Preventivo";
                }

                this.datosHistorial.push(
                  {
                    fechaH: dato.date,
                    servicioH: dato.service,
                    tipoH: aux
                  }
                );
              }
            }

            this.isShowingSpinner = false;
            this.dataSource.data = this.datosHistorial;
          },
          error: error => {
            console.error(error);
          }
        });
      
    }
  }

  displayFnT(tipo: TipoDeEquipo): string {
    return tipo && tipo.name ? tipo.name : '';
  }

  displayFnM(marca: Marca): string {
    return marca && marca.name ? marca.name : '';
  }

  displayFnMo(modelo: Modelo): string {
    return modelo && modelo.name ? modelo.name : '';
  }

  displayFnS(serie: Serie): string {
    return serie && serie.name ? serie.name : '';
  }

  private sumOne(num: number): number{
    console.log(num++);
    return num++;
  }

  private _filterT(name: string): TipoDeEquipo[] {
    const filterValue = name.toLowerCase();

    return this.optionsTipos.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private _filterM(name: string): Marca[] {
    const filterValue = name.toLowerCase();

    return this.optionsMarcas.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private _filterMo(name: string): Modelo[] {
    const filterValue = name.toLowerCase();

    return this.optionsModelos.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private _filterS(name: string): Serie[] {
    const filterValue = name.toLowerCase();

    return this.optionsSeries.filter(option => option.name.toLowerCase().includes(filterValue));
  }

}
