import { createAction, props } from "@ngrx/store";

const actionPrefix = '[IdbStoreModule]';

export const initAction = createAction(`${actionPrefix} init`);
export const synchronizeAction = createAction(`${actionPrefix} sync`, props<{state: any}>());