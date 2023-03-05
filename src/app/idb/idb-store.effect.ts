import { Inject, Injectable } from "@angular/core";
import { Actions, OnInitEffects, createEffect, ofType } from "@ngrx/effects";
import { Action, ActionCreator, ReducerManager, UPDATE } from "@ngrx/store";
import { initAction, synchronizeAction } from './idb-store.actions';
import { EMPTY, Observable, filter, fromEvent, switchMap, tap } from "rxjs";
import { IdbStoreConfig, idbStoreConfig } from "./idb-store.config";
import { get as idbGet, keys as idbKeys } from "idb-keyval";
import { DOCUMENT } from "@angular/common";

@Injectable()
export class IdbStoreEffect {

  // whenever a new reducer has been added, synchronize 
  reducersChanged$ = createEffect(() => {
    return this.reducerManager.pipe(
      switchMap(() => this.createSynchronizeAction())
    )
  })

  // whenever we go from unfocused to focused synchronize
  visibilityChange$ = createEffect(() => fromEvent(this.document, 'visibilitychange').pipe(
    switchMap(() => {
      if(this.document.hidden) {
        return EMPTY;
      }
      return this.createSynchronizeAction();
    })
  ));

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private reducerManager: ReducerManager
  ){}

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