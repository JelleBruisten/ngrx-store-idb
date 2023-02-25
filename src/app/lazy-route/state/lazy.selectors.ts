import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLazy from './lazy.reducer';
import { LazyState } from './lazy.state';

export const selectLazyState = createFeatureSelector<LazyState>(
  fromLazy.lazyFeatureKey
);

export const selectLazyCounter = createSelector(selectLazyState, (state) => state.counter);