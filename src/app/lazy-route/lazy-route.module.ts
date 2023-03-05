import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromLazy from './state/lazy.reducer';
import { LazyRouteComponent } from './lazy-route.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: '',
  component: LazyRouteComponent
}];

@NgModule({
  imports: [
    StoreModule.forFeature(fromLazy.lazyFeatureKey, fromLazy.reducer),
    RouterModule.forChild(routes)
  ]
})
export class LazyRouteModule {}
