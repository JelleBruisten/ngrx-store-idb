import { Inject, Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect } from "@ngrx/effects";
import { Action, ReducerManager, State, Store } from "@ngrx/store";
import { actionPrefix, initAction, synchronizeAction } from './idb-store.actions';
import { EMPTY, Observable, debounceTime, exhaustMap, filter, fromEvent, map, skip, startWith, switchMap, take, tap, throttleTime } from "rxjs";
import { 
  getMany as idbGetMany,
  setMany as idbSetMany 
} from "idb-keyval";
import { DOCUMENT } from "@angular/common";
import { IdbStoreConfig, idbStoreConfig } from "./idb-store.config";

type IdbStateEntry = [string, object];

type IdbBroadcastEvent = Event & { data: string[]};

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
  // pageVisibility$ = fromEvent(this.document, 'visibilitychange').pipe(map((event) => !this.document.hidden), startWith(!this.document.hidden));
  // Broadcast channel
  channel = new BroadcastChannel(this.config.broadcastChannelName);
  channelMessages$ = fromEvent<IdbBroadcastEvent>(this.channel, 'message');
  oldEntries: IdbStateEntry[];



  // // When notified
  onNotified$ = createEffect(() => this.channelMessages$.pipe(
    // do we need to get notified
    filter(() => this.config.readIdbOn.includes('broadcastChannelNotify')),
    filter((event) => !!event?.data?.length),
    map((event) => event.data),
    switchMap((stateKeys) => {
      console.log(stateKeys);
      return this.createSynchronizeAction(stateKeys);
    })
  ));  

  // 
  writeAndNotify$ = createEffect(() => this.actionSubject.pipe(
    
    // filter out ngrx actions and our own actions we use for the synchronize
    filter((action) => !action.type.startsWith('@ngrx')),
    filter((action) => !action.type.startsWith(actionPrefix)),

    // don't write when page is hidden
    filter(() => !this.document.hidden),
    debounceTime(this.config.writeDebounceTime),
    switchMap(() => {
      return new Observable<string[]>((subscriber) => {
        const currentEntries = this.currentStateEntries();

        // figure out if we actually need to save all entries
        let entriesToBeSaved: IdbStateEntry[] = [];
        if(this.oldEntries) {
          for(const [key, value] of currentEntries) {
            const oldEntry = this.oldEntries.find((entry) => entry[0] === key);
            if(oldEntry) {
              if(oldEntry[1] !== value) {
                entriesToBeSaved.push([key, value]);
              }
            }
          }
        } else {
          // when there are no old entries just assume we can save all
          entriesToBeSaved = [... currentEntries];
        }
        this.oldEntries = currentEntries;          

        // set all state slices in idb
        if(entriesToBeSaved.length) {
          idbSetMany(entriesToBeSaved).then(() => {
            subscriber.next(entriesToBeSaved.map((entry) => entry[0]));
            subscriber.complete();    
          });              
        } else {
          subscriber.complete();    
        }
      });     
    }),

    // if we need to notify by broadcast channel
    filter(() => this.config.readIdbOn.includes('broadcastChannelNotify')),

    // only notify if document is still visible
    filter(() => !this.document.hidden),

    // notify by broadcast channel
    tap((updatedSlices) => {
      this.channel.postMessage(updatedSlices);      
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
    this.oldEntries = this.currentStateEntries();
  }

  createSynchronizeAction(keys?: string[]) {
    return new Observable<Action>((subscriber) => {

      // gather what state keys are currently active    
      let keysToRead: string[] = [];
      const currentKeys = Object.keys(this.reducerManager.currentReducers).filter((key) => !this.config.ignoredStates.includes(key));
      if(!keys) {
        keysToRead = currentKeys;
      } else {
        keysToRead = keys.filter((x) => currentKeys.includes(x))
      }

      console.log(keys, keysToRead, currentKeys);
      
      if(!keysToRead.length) {
        subscriber.complete();
      }

      // load every state slice that should be active
      idbGetMany(keysToRead).then((stateSlices) => {
        const totalState: {[index: string]: object} = {};
        for(let i = 0; i < keysToRead.length; i++) {
          const stateSlice = stateSlices[i];
          const key = keysToRead[i];

          // we can have a undefined value incase the stateSlice does not exist in idb
          if(key && stateSlice) {
            totalState[key] = stateSlice;
          }        
        }

        console.log(totalState);
        subscriber.next(synchronizeAction({
          state: totalState
        }));
        subscriber.complete();
      });
    })
  }

  currentStateEntries() {
    const state = this.state.value;

    // our keys for each slice
    const keys = Object.keys(this.reducerManager.currentReducers).filter((key) => !this.config.ignoredStates.includes(key));

    // create entries for the idb
    const entries: IdbStateEntry[] = [];
    for(const key of keys) {
      if((state as Object).hasOwnProperty(key)) {
        const currentSlice = state[key];
        entries.push([key, currentSlice]);
      }
    }

    return entries;
  }
}