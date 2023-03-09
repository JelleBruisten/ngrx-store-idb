import { InjectionToken } from "@angular/core"

export type IdbStoreSynchronize = 'init' | 'broadcastChannelNotify';

export interface IdbStoreConfig {
  /**
   * When to perform a synchronize
   */
  readIdbOn: IdbStoreSynchronize[],

  /**
   * Which channel name to use, defaults to 'IdbStoreChannel'
   */
  broadcastChannelName: string;  
  writeDebounceTime: number;
  ignoredStates: string[]
}

export const idbStoreConfig = new InjectionToken<IdbStoreConfig>('IdbStoreConfig');

export const defaultConfig: IdbStoreConfig = {
  broadcastChannelName: 'IdbStoreChannel',
  readIdbOn: [
    'init',
    'broadcastChannelNotify'
  ],
  writeDebounceTime: 0,
  ignoredStates: ['router']
};