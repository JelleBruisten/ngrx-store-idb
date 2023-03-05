import { ActionReducer } from "@ngrx/store";
import { set as idbSet } from "idb-keyval";
import { initAction, synchronizeAction } from "./idb-store.actions";
import { IdbStoreConfig } from './idb-store.config';

export function idbMetaReducer(config: IdbStoreConfig, document: Document){ 
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

        // on specific actions like INIT, root_effects and few others we don't want to set the idb state
        if(!(action.type.includes('@ngrx') || action.type === initAction.type)) {

          // if document is hidden don't synchronize
          if(!document.hidden) {
            for(const [key, value] of Object.entries(newState as object)) {
              idbSet(key, value);  
            }            
          }
        }        
      }
      return newState;
    };
  }
}