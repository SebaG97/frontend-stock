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
                    { label: 'Depósitos', icon: 'pi pi-fw pi-database', routerLink: ['/depositos'] },
                    { label: 'Estados', icon: 'pi pi-fw pi-flag', routerLink: ['/estados'] },
                    { label: 'Productos', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/productos'] },
                    { label: 'Stock', icon: 'pi pi-fw pi-box', routerLink: ['/stock'] },
                    { label: 'Movimientos de Stock', icon: 'pi pi-fw pi-exchange', routerLink: ['/stock-movimientos'] },
                    { label: 'Sincronizar Stock', icon: 'pi pi-fw pi-refresh', routerLink: ['/stock-sync'] },
                    { label: 'Marcas', icon: 'pi pi-fw pi-tag', routerLink: ['/marcas'] },
                    { label: 'Procedencias', icon: 'pi pi-fw pi-globe', routerLink: ['/procedencias'] },
                    { label: 'Línea de Productos', icon: 'pi pi-fw pi-list', routerLink: ['/producto-lineas'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-users', routerLink: ['/proveedores'] },
                    { label: 'Rubros', icon: 'pi pi-fw pi-th-large', routerLink: ['/rubros'] },
                    { label: 'Tipos de Producto', icon: 'pi pi-fw pi-box', routerLink: ['/tipos-producto'] }
                ]
            }
        ];
    }
}
