import { createReducer, on } from '@ngrx/store';
import { increment, decrement, reset } from './actions';

export const initialState = {
  counter: 0
};

export const counterReducer = createReducer(
  initialState,
  on(increment, state => {
    return {
      ... state,
      counter: state.counter + 1
    }
  }),

  on(decrement, state => {
    return {
      ... state,
      counter: state.counter - 1
    }
  }),  

  on(reset, _state => {
    return {
      ... initialState
    }
  }),  
);