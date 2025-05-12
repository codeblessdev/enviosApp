import { Routes } from '@angular/router';
import { DatospersonalesEnvioComponent } from './componentes/envios/datospersonales-envio/datospersonales-envio.component';

export const routes: Routes = [

    {
        path: 'home',
        loadComponent: () => import('./componentes/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'login',
        loadComponent: () => import('./componentes/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () => import('./componentes/register/register.component').then((m) => m.RegisterComponent),
    },
    {
        path: 'envios',
        loadComponent: () => import('./componentes/envios/crearenvio/crearenvio.component').then((m) => m.CrearenvioComponent),
    },
    {
        path: 'datospersonales',
        loadComponent: () => import('./componentes/envios/datospersonales-envio/datospersonales-envio.component').then((m) => m.DatospersonalesEnvioComponent),
    },
    {
        path: 'confirmacionenvio',
        loadComponent: () => import('./componentes/envios/confirmacion-envio/confirmacion-envio.component').then((m) => m.ConfirmacionEnvioComponent),
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },

];
