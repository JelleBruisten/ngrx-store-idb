import { Action, createReducer, on } from '@ngrx/store';
import * as LazyActions from './lazy.actions';
import { initialState } from './lazy.state';

export const lazyFeatureKey = 'lazy';

export const reducer = createReducer(
  initialState,

  on(LazyActions.lazyIncrement, state => {
    return {
      ... state,
      counter: state.counter + 1
    }
  }),

  on(LazyActions.lazyDecrement, state => {
    return {
      ... state,
      counter: state.counter - 1
    }
  }),  

  on(LazyActions.lazyReset, state => {
    return {
      ... initialState
    }
  }),  

);
