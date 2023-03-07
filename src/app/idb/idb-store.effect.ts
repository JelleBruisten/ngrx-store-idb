import { Inject, Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect } from "@ngrx/effects";
import { Action, ReducerManager, State, Store } from "@ngrx/store";
import { actionPrefix, initAction, synchronizeAction } from './idb-store.actions';
import { EMPTY, Observable, debounceTime, filter, fromEvent, map, skip, startWith, switchMap, tap, throttleTime } from "rxjs";
import { get as idbGet, keys as idbKeys, set as idbSet } from "idb-keyval";
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

      console.log(event, visible);
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
          const state = this.state.value;
          for(const [key, value] of Object.entries(state as object)) {
            idbSet(key, value).then(() => {
              subscriber.next(event);
              subscriber.complete();    
            });  
          }            
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

  }

  createSynchronizeAction() {
    return new Observable<Action>((subscriber) => {

      idbKeys().then((keys) => {
        const promises: Promise<object>[] = [];
        for(const key of keys) {
          promises.push(idbGet(key).then((state) => new Promise((resolve) => {
            resolve({
              [key as string]: state
            })
          })))
        }

        Promise.all(promises).then((stateSlices) => {
          let totalState = {};
          for(const stateSlice of stateSlices) {
              totalState = {
                ... totalState,
                ... stateSlice
              };
          }

          subscriber.next(synchronizeAction({
            state: totalState
          }));
          subscriber.complete();
        });
      });
    })
  }
}