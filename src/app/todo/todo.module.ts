import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromLazy from './state/todo.reducer';
import { TodoComponent } from './todo.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: '',
  component: TodoComponent
}];

@NgModule({
  imports: [
    StoreModule.forFeature(fromLazy.todoFeatureKey, fromLazy.reducer),
    RouterModule.forChild(routes)
  ]
})
export class TodoModule {}
