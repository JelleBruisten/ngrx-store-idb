import { createAction, props } from '@ngrx/store';

export const lazyIncrement = createAction(
  '[Lazy] Increment'
);

export const lazyDecrement = createAction(
  '[Lazy] Decrement'
);

export const lazyReset = createAction(
  '[Lazy] reset'
);




