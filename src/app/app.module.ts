import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SidenavComponent } from './components/sidenav/sidenav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatSidenavModule} from '@angular/material/sidenav';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule} from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { BodyComponent } from './components/body/body.component';
import { PanelGeneralComponent } from './components/panel-general/panel-general.component';
import { InventariosComponent } from './components/inventarios/inventarios.component';
import { SeguimientosComponent } from './components/seguimientos/seguimientos.component';
import { CertificadosComponent } from './components/certificados/certificados.component';
import { HistorialComponent } from './components/historial/historial.component';
import { EquiposTallerComponent } from './components/equipos-taller/equipos-taller.component';
import { MantenimientosPreventivosComponent } from './components/mantenimientos-preventivos/mantenimientos-preventivos.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { HomeComponent } from './components/home/home.component';
import { PieChartComponent } from './components/charts/pie-chart/pie-chart.component';
import { SelectCustomerComponent } from './components/select-customer/select-customer.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutDialogComponent } from './components/logout-dialog/logout-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';

//services
import { UserService } from './services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { DataService } from './services/data.service';
import { DashboardService } from './services/dashboard.service';

import { DetalleInventarioComponent } from './components/detalle-inventario/detalle-inventario.component';
import { InventarioPorServicioComponent } from './components/inventario-por-servicio/inventario-por-servicio.component';
import { DetalleInventarioPorServicioComponent } from './components/detalle-inventario-por-servicio/detalle-inventario-por-servicio.component';
import { DetalleCertificacionesComponent } from './components/detalle-certificaciones/detalle-certificaciones.component';
import { DetalleEquiposTallerComponent } from './components/detalle-equipos-taller/detalle-equipos-taller.component';
import { DetalleMantenimientosPreventivosComponent } from './components/detalle-mantenimientos-preventivos/detalle-mantenimientos-preventivos.component';
import { DetalleEquiposEnTallerComponent } from './components/detalle-equipos-en-taller/detalle-equipos-en-taller.component';
import { DetalleEquiposEnInventarioComponent } from './components/detalle-equipos-en-inventario/detalle-equipos-en-inventario.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CambiarClaveComponent } from './components/cambiar-clave/cambiar-clave.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';




@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    BodyComponent,
    PanelGeneralComponent,
    InventariosComponent,
    SeguimientosComponent,
    CertificadosComponent,
    HistorialComponent,
    EquiposTallerComponent,
    MantenimientosPreventivosComponent,
    ToolbarComponent,
    HomeComponent,
    PieChartComponent,
    LoginComponent,
    SelectCustomerComponent,
    LogoutDialogComponent,
    DetalleInventarioComponent,
    InventarioPorServicioComponent,
    DetalleInventarioPorServicioComponent,
    DetalleCertificacionesComponent,
    DetalleEquiposTallerComponent,
    DetalleMantenimientosPreventivosComponent,
    DetalleEquiposEnTallerComponent,
    DetalleEquiposEnInventarioComponent,
    PageNotFoundComponent,
    CambiarClaveComponent,
    ForgotPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatTableModule,
    MatSelectModule,
    MatCardModule,
    MatInputModule,
    HttpClientModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatTooltipModule
  ],
  providers: [UserService, CookieService, DataService, DashboardService],
  bootstrap: [AppComponent],
  entryComponents: [LogoutDialogComponent, DetalleInventarioComponent]

})
export class AppModule { }
