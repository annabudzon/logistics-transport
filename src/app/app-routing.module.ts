import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InputTableComponent } from './input-table/input-table.component';
import { ResultComponent } from './result/result.component';

const routes: Routes = [
  { path: 'home', component: InputTableComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
