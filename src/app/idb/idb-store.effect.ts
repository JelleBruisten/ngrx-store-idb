import { Inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Action, ReducerManager, State } from "@ngrx/store";
import { actionPrefix, synchronizeAction } from './idb-store.actions';
import { Observable, debounceTime, filter, fromEvent, map, skip, switchMap, tap } from "rxjs";
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
  private readonly channel = new BroadcastChannel(this.config.broadcastChannelName);
  private oldEntries: IdbStateEntry[];

  // When we do a init we only load active slices, therefore the oldEntries is out of date after a new reducer comes allong
  readonly oldEntriesSync$  = createEffect(() => {
    return this.actionSubject.pipe(
      ofType(synchronizeAction),
      tap(() => this.oldEntries = this.currentStateEntries())
    )
  }, {
    dispatch: false
  });

  // At init and whenever a feature module is loaded
  readonly reducersChanged$ = createEffect(() => {
    return this.reducerManager.pipe(
      skip(this.config.synchronizeOnInit ? 0 : 1),
      switchMap(() => this.createSynchronizeAction()),
      
    )
  });

  // // When notified
  readonly onNotified$ = createEffect(() => fromEvent<IdbBroadcastEvent>(this.channel, 'message').pipe(
    // do we need to get notified
    filter(() => this.config.synchronizeByBroadcast),
    filter((event) => !!event?.data?.length),
    map((event) => event.data),
    switchMap((stateKeys) => {
      console.log(stateKeys);
      return this.createSynchronizeAction(stateKeys);
    })
  ));  

  readonly writeAndNotify$ = createEffect(() => this.actionSubject.pipe(
    
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
            } else {
              entriesToBeSaved.push([key, value]);
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
    filter(() => this.config.synchronizeByBroadcast),

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

  private createSynchronizeAction(keys?: string[]) {
    return new Observable<Action>((subscriber) => {

      // gather what state keys are currently active    
      let keysToRead: string[] = [];
      const currentKeys = Object.keys(this.reducerManager.currentReducers).filter((key) => !this.config.ignoredStates.includes(key));
      if(!keys) {
        keysToRead = currentKeys;
      } else {
        keysToRead = keys.filter((x) => currentKeys.includes(x))
      }
      
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

        subscriber.next(synchronizeAction({
          state: totalState
        }));
        subscriber.complete();
      });
    })
  }

  private currentStateEntries() {
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