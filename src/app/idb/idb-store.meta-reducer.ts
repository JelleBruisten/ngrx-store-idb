import { ActionReducer } from "@ngrx/store";
import { synchronizeAction } from "./idb-store.actions";

export function idbMetaReducer(){ 
  return function (reducer: ActionReducer<unknown>): ActionReducer<unknown> {
    return function(state, action) {     
      let newState;
      if(action.type === synchronizeAction.type) {
        newState = {
          ...(state as object | undefined),
          ...(action as ReturnType<typeof synchronizeAction>).state
        };
      } else {
        newState = reducer(state, action);        
      }
      return newState;
    };
  }
}