import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Gestión',
                items: [
                    {
                        label: 'Inventario',
                        icon: 'pi pi-fw pi-box',
                        items: [
                            { label: 'Stock', icon: 'pi pi-fw pi-warehouse', routerLink: ['/stock'] },
                            { label: 'Movimientos', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/stock-movimientos'] },
                            { label: 'Sincronizar', icon: 'pi pi-fw pi-refresh', routerLink: ['/stock-sync'] },
                        ]
                    },
                    {
                        label: 'Productos',
                        icon: 'pi pi-fw pi-shopping-cart',
                        items: [
                            { label: 'Productos', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/productos'] },
                            { label: 'Marcas', icon: 'pi pi-fw pi-tag', routerLink: ['/marcas'] },
                            { label: 'Líneas', icon: 'pi pi-fw pi-list', routerLink: ['/producto-lineas'] },
                            { label: 'Tipos', icon: 'pi pi-fw pi-th-large', routerLink: ['/tipos-producto'] },
                            { label: 'Rubros', icon: 'pi pi-fw pi-sitemap', routerLink: ['/rubros'] }
                        ]
                    },
                    {
                        label: 'Configuración',
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            { label: 'Depósitos', icon: 'pi pi-fw pi-database', routerLink: ['/depositos'] },
                            { label: 'Estados', icon: 'pi pi-fw pi-flag', routerLink: ['/estados'] },
                            { label: 'Procedencias', icon: 'pi pi-fw pi-globe', routerLink: ['/procedencias'] },
                            { label: 'Proveedores', icon: 'pi pi-fw pi-users', routerLink: ['/proveedores'] }
                        ]
                    }
                ]
            },
            {
                separator: true
            },
            {
                label: 'Recursos Humanos',
                items: [
                    { 
                        label: 'Órdenes de Trabajo', 
                        icon: 'pi pi-fw pi-clipboard', 
                        routerLink: ['/partes-trabajo'],
                        title: 'Gestión de órdenes y partes de trabajo'
                    },
                    { 
                        label: 'Horas Extras', 
                        icon: 'pi pi-fw pi-clock', 
                        routerLink: ['/horas-extras'],
                        title: 'Gestión de horas extras de técnicos'
                    }
                ]
            },
            {
                separator: true
            },
            {
                label: 'Finanzas',
                items: [
                    { 
                        label: 'Caja Chica', 
                        icon: 'pi pi-fw pi-wallet', 
                        routerLink: ['/caja-chica'],
                        title: 'Gestión de gastos de caja chica'
                    },
                    {
                        label: 'Gastos',
                        icon: 'pi pi-fw pi-receipt',
                        routerLink: ['/caja-chica/gastos'],
                        title: 'Lista y gestión de gastos'
                    }
                ]
            },
            {
                separator: true
            },
            {
                label: 'Monitoring',
                items: [
                    { 
                        label: 'Alarmas de Vessels', 
                        icon: 'pi pi-fw pi-shield', 
                        routerLink: ['/alarmas'],
                        title: 'Monitoring y alertas de vessels en tiempo real'
                    }
                ]
            }
        ];
    }
}
