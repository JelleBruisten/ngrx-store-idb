import { createAction, props } from '@ngrx/store';

export const addTodo = createAction(
  '[Todo] Add',
  props<{ todo: string}>()
);

export const removeTodo = createAction(
  '[Todo] remove',
  props<{index: number}>()
);

export const resetTodo = createAction(
  '[Todo] reset'
);




