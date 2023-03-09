import { Component, inject } from '@angular/core';
import { State, Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';
import { decrement, increment, reset } from '../state/actions';
import { state } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  count$: Observable<number>
 
  state = inject(State);
  constructor(private store: Store<{ counter: { counter: number} }>) {
    this.count$ = store.select('counter').pipe(map((x) => x.counter));
  }
 
  increment() {
    this.store.dispatch(increment());
  }

  incrementTwice() {
    this.store.dispatch(increment());
    this.store.dispatch(increment());
  }
 
  decrement() {
    this.store.dispatch(decrement());
  }
 
  reset() {
    this.store.dispatch(reset());
  }
}
