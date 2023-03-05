import { Inject, Injectable } from "@angular/core";
import { Actions, OnInitEffects, createEffect, ofType } from "@ngrx/effects";
import { Action, ActionCreator, UPDATE } from "@ngrx/store";
import { initAction, synchronizeAction } from './idb-store.actions';
import { EMPTY, Observable, filter, fromEvent, switchMap, tap } from "rxjs";
import { IdbStoreConfig, idbStoreConfig } from "./idb-store.config";
import { get as idbGet, keys as idbKeys } from "idb-keyval";
import { DOCUMENT } from "@angular/common";

@Injectable()
export class IdbStoreEffect implements OnInitEffects {

  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(initAction),
      switchMap(() => this.createSynchronizeAction())
    )
  });

  visibilityChange$ = createEffect(() => fromEvent(this.document, 'visibilitychange').pipe(
    switchMap(() => {
      if(this.document.hidden) {
        return EMPTY;
      }
      return this.createSynchronizeAction();
    })
  ));

  constructor(
    private actions$: Actions, 
    // @Inject(idbStoreConfig) private config: IdbStoreConfig,
    @Inject(DOCUMENT) private document: Document
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

  ngrxOnInitEffects(): Action {
    return initAction()
  }
}