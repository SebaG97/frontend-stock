
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { DepositosComponent } from './app/pages/depositos/depositos.component';
import { EstadosComponent } from './app/pages/estados/estados.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'depositos', component: DepositosComponent },
            { path: 'estados', component: EstadosComponent },
            { path: 'marcas', loadComponent: () => import('./app/pages/marcas/marcas.component').then(m => m.MarcasComponent) },
            { path: 'procedencias', loadComponent: () => import('./app/pages/procedencias/procedencias.component').then(m => m.ProcedenciasComponent) },
            { path: 'producto-lineas', loadComponent: () => import('./app/pages/producto-lineas/producto-lineas.component').then(m => m.ProductoLineasComponent) },
            { path: 'proveedores', loadComponent: () => import('./app/pages/proveedores/proveedores.component').then(m => m.ProveedoresComponent) },
            { path: 'rubros', loadComponent: () => import('./app/pages/rubros/rubros.component').then(m => m.RubrosComponent) },
            { path: 'tipos-producto', loadComponent: () => import('./app/pages/tipos-producto/tipos-producto.component').then(m => m.TiposProductoComponent) }
        ]
    },
];
