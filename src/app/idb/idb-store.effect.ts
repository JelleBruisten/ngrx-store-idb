import { Inject, Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect } from "@ngrx/effects";
import { Action, ReducerManager, State, Store } from "@ngrx/store";
import { actionPrefix, initAction, synchronizeAction } from './idb-store.actions';
import { EMPTY, Observable, debounceTime, filter, fromEvent, map, skip, startWith, switchMap, tap, throttleTime } from "rxjs";
import { 
  getMany as idbGetMany,
  setMany as idbSetMany 
} from "idb-keyval";
import { DOCUMENT } from "@angular/common";
import { IdbStoreConfig, idbStoreConfig } from "./idb-store.config";

@Injectable()
export class IdbStoreEffect {

  // At init and whenever a feature module is loaded
  reducersChanged$ = createEffect(() => {
    return this.reducerManager.pipe(
      skip(this.config.readIdbOn.includes('init') ? 0 : 1),
      switchMap(() => this.createSynchronizeAction())
    )
  })

  // Page visibility
  pageVisibility$ = fromEvent(this.document, 'visibilitychange').pipe(map((event) => !this.document.hidden), startWith(!this.document.hidden));

  // whenever we go from unfocused to focused synchronize
  visibilityChange$ = createEffect(() => this.pageVisibility$.pipe(
    filter(() => this.config.readIdbOn.includes('visibilityChange')),
    switchMap((visible) => {
      if(!visible) {
        return EMPTY;
      }
      return this.createSynchronizeAction();
    })
  ));  

  // Broadcast channel
  channel = new BroadcastChannel(this.config.broadcastChannelName);

  // When notified
  onNotified$ = createEffect(() => fromEvent(this.channel, 'message').pipe(
    // do we need to get notified
    filter(() => this.config.readIdbOn.includes('broadcastChannelNotify')),

    // debounce if needed
    debounceTime(this.config.broadcastChannelReceiveDebounceTime),  

    // getting page visibility
    concatLatestFrom(() => this.pageVisibility$),

    // emit a synchronize action if its needed
    switchMap(([event, visible]) => {
      if(this.config.skipMessagesWhileHidden && !visible) {
        return EMPTY;
      }
      return this.createSynchronizeAction();
    })
  ));  

  // 
  writeAndNotify$ = createEffect(() => this.actionSubject.pipe(
    // filter out @ngrx/* actions
    filter((action) => !action.type.startsWith('@ngrx')),

    // filter out our own actions
    filter((action) => !action.type.startsWith(actionPrefix)),

    // debounce before writing
    debounceTime(500),

    switchMap((event) => {
      return new Observable<Action>((subscriber) => {
        if(this.config.synchronizeWhenDocumentHidden || !this.document.hidden) {
          // our current state
          const state = this.state.value;

          // our keys for each slice
          const keys = Object.keys(this.reducerManager.currentReducers);

          // create entries for the idb
          const entries: [string, object][] = [];
          for(const key of keys) {
            if((state as Object).hasOwnProperty(key)) {
              const currentSlice = state[key];
              entries.push([key, currentSlice]);
            }
          }

          // set all state slices in idb
          idbSetMany(entries).then(() => {
            subscriber.next(event);
            subscriber.complete();    
          });              

        } else {
          subscriber.next(event);
          subscriber.complete();
        } 
      });     
    }),

    // if we need to notify by broadcast channel
    filter(() => this.config.readIdbOn.includes('broadcastChannelNotify')),

    // throttle if we want too
    throttleTime(this.config.broadcastChannelNotifyThrottleTime),

    // adding in the page visibility
    concatLatestFrom(() => this.pageVisibility$),

    // check if its needed to emit based on config
    tap(([event, visible]) => {
      if(this.config.skipNotifyWhileHidden && !visible) {
        return;
      }
      this.channel.postMessage(event);      
    })    


  ), {
    dispatch: false
  });

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private reducerManager: ReducerManager,
    private actionSubject: Actions,
    @Inject(idbStoreConfig) private config: IdbStoreConfig,
    private state: State<unknown>
  ){
    console.log(reducerManager);
  }

  createSynchronizeAction() {
    return new Observable<Action>((subscriber) => {

      // gather what state keys are currently active
      const keys = Object.keys(this.reducerManager.currentReducers);

      // load every state slice that should be active
      idbGetMany(keys).then((stateSlices) => {
        const totalState: {[index: string]: object} = {};
        for(let i = 0; i < keys.length; i++) {
          const stateSlice = stateSlices[i];
          const key = keys[i];

          // we can have a undefined value incase the stateSlice does not exist in idb
          if(key && stateSlice) {
            totalState[key] = stateSlice;
          }
        }
        subscriber.next(synchronizeAction({
          state: totalState
        }));
        subscriber.complete();
      });
    })
  }
}