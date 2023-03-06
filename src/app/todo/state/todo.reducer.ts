import { Action, createReducer, on } from '@ngrx/store';
import * as TodoActions from './todo.actions';
import { initialState } from './todo.state';

export const todoFeatureKey = 'todo';

export const reducer = createReducer(
  initialState,

  on(TodoActions.addTodo, (state, { todo}) => {
    return {
      ... state,
      lastUpdate: new Date().getTime(),
      todoList: [
        ... state.todoList,
        todo        
      ]

    }
  }),

  on(TodoActions.removeTodo, (state, { index }) => {
    return {
      ... state,
      todoList: [... state.todoList.slice(0, index), ... state.todoList.slice(index + 1)]      
    }
  }),  

  on(TodoActions.resetTodo, () => {
    return {
      ... initialState
    }
  }),  

);
