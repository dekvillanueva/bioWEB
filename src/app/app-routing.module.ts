import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificadosComponent } from './components/certificados/certificados.component';
import { EquiposTallerComponent } from './components/equipos-taller/equipos-taller.component';
import { HistorialComponent } from './components/historial/historial.component';
import { InventariosComponent } from './components/inventarios/inventarios.component';
import { MantenimientosPreventivosComponent } from './components/mantenimientos-preventivos/mantenimientos-preventivos.component';
import { PanelGeneralComponent } from './components/panel-general/panel-general.component';
import { SeguimientosComponent } from './components/seguimientos/seguimientos.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SelectCustomerComponent } from './components/select-customer/select-customer.component';
import { InventarioPorServicioComponent } from './components/inventario-por-servicio/inventario-por-servicio.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CambiarClaveComponent } from './components/cambiar-clave/cambiar-clave.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ActualizarClaveComponent } from './components/actualizar-clave/actualizar-clave.component';

const routes: Routes = [
  {path: "", redirectTo : "home", pathMatch: "full"},
  {path: "login", component:LoginComponent },
  {path: "home", component:HomeComponent},
  {path: "panel-general", component:PanelGeneralComponent},
  {path: "inventarios", component:InventariosComponent},
  {path: "seguimientos", component:SeguimientosComponent},
  {path: "certificados", component:CertificadosComponent},
  {path: "historial", component:HistorialComponent},
  {path: "equipos-taller", component:EquiposTallerComponent},
  {path: "mantenimientos-preventivos", component:MantenimientosPreventivosComponent},
  {path: "select-customer", component:SelectCustomerComponent},
  {path: "inventario-por-servicio/:id/:name", component:InventarioPorServicioComponent},
  {path: "cambiar-clave", component: CambiarClaveComponent},
  {path: "forgot-password", component: ForgotPasswordComponent},
  {path: "actualizar-clave", component: ActualizarClaveComponent},
  {path: "**", pathMatch: 'full', component: PageNotFoundComponent }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
