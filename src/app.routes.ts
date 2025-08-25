
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { DepositosComponent } from './app/pages/depositos/depositos.component';
import { EstadosComponent } from './app/pages/estados/estados.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', loadComponent: () => import('./app/pages/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'depositos', component: DepositosComponent },
            { path: 'estados', component: EstadosComponent },
            { path: 'productos', loadComponent: () => import('./app/pages/productos/productos.component').then(m => m.ProductosComponent) },
            { path: 'marcas', loadComponent: () => import('./app/pages/marcas/marcas.component').then(m => m.MarcasComponent) },
            { path: 'procedencias', loadComponent: () => import('./app/pages/procedencias/procedencias.component').then(m => m.ProcedenciasComponent) },
            { path: 'producto-lineas', loadComponent: () => import('./app/pages/producto-lineas/producto-lineas.component').then(m => m.ProductoLineasComponent) },
            { path: 'proveedores', loadComponent: () => import('./app/pages/proveedores/proveedores.component').then(m => m.ProveedoresComponent) },
            { path: 'rubros', loadComponent: () => import('./app/pages/rubros/rubros.component').then(m => m.RubrosComponent) },
            { path: 'tipos-producto', loadComponent: () => import('./app/pages/tipos-producto/tipos-producto.component').then(m => m.TiposProductoComponent) },
            { path: 'stock', loadComponent: () => import('./app/pages/stock/stock-list.component').then(m => m.StockListComponent) },
            { path: 'stock-movimientos', loadComponent: () => import('./app/pages/stock/stock-movimientos.component').then(m => m.StockMovimientosComponent) },
            { path: 'stock-sync', loadComponent: () => import('./app/pages/stock/stock-sync.component').then(m => m.StockSyncComponent) },
            { path: 'horas-extras', loadComponent: () => import('./app/pages/horas-extras/horas-extras.component').then(m => m.HorasExtrasComponent) },
            // Rutas para órdenes de trabajo
            { 
                path: 'partes-trabajo', 
                loadComponent: () => import('./app/pages/partes-trabajo/partes-trabajo.component').then(m => m.PartesTrabajoComponent) 
            },
            { 
                path: 'partes-trabajo/nuevo', 
                loadComponent: () => import('./app/pages/partes-trabajo/components/parte-trabajo-form.component').then(m => m.ParteTrabajoFormComponent) 
            },
            { 
                path: 'partes-trabajo/:id', 
                loadComponent: () => import('./app/pages/partes-trabajo/components/parte-trabajo-detalle.component').then(m => m.ParteTrabajoDetalleComponent) 
            },
            { 
                path: 'partes-trabajo/:id/editar', 
                loadComponent: () => import('./app/pages/partes-trabajo/components/parte-trabajo-form.component').then(m => m.ParteTrabajoFormComponent) 
            }
        ]
    },
];
