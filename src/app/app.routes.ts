import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'form1',
    pathMatch: 'full' // Important: ensures full path matching
  },
  {
    path: 'form1',
    loadComponent: () =>
      import('./components/form1/form1.component').then(m => m.Form1Component)
  },
  {
    path: 'form2',
    loadComponent: () =>
      import('./components/form2/form2.component').then(m => m.Form2Component)
  },
  {
    path: '**',
    redirectTo: 'form1' // optional fallback to form1 if route not found
  }
];
