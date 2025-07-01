import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        STOCK by
        <a href="https://www.parks.com.py" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Parks Ing</a>
    </div>`
})
export class AppFooter {}
