import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLazy from './todo.reducer';
import { TodoState } from './todo.state';

export const selectTodoState = createFeatureSelector<TodoState>(
  fromLazy.todoFeatureKey
);

export const selectTodoList = createSelector(selectTodoState, (state) => state.todoList);
export const selectTodoLastUpdate = createSelector(selectTodoState, (state) => state.lastUpdate ? new Date(state.lastUpdate) : null);