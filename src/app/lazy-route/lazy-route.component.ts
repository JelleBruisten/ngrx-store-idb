import { Component } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { lazyIncrement, lazyDecrement, lazyReset } from './state/lazy.actions';
import { AsyncPipe, CommonModule } from '@angular/common';
import { selectLazyCounter } from './state/lazy.selectors';
import { PushModule } from '@ngrx/component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    PushModule
  ],
  selector: 'app-lazy-route',
  templateUrl: './lazy-route.component.html',
  styleUrls: ['./lazy-route.component.css']
})
export class LazyRouteComponent {
  count$: Observable<number>
 
  constructor(private store: Store<{ lazy: number }>) {
    this.count$ = store.select(selectLazyCounter);
  }
 
  increment() {
    this.store.dispatch(lazyIncrement());
  }
 
  decrement() {
    this.store.dispatch(lazyDecrement());
  }
 
  reset() {
    this.store.dispatch(lazyReset());
  }
}
