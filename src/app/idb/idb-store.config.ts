import { InjectionToken } from "@angular/core"

export type IdbStoreSynchronize = 'init' | 'visibilityChange' | 'broadcastChannelNotify';

export interface IdbStoreConfig {
  /**
   * Not recommended, might cause weird behavior
   */
  synchronizeWhenDocumentHidden: boolean;

  /**
   * When to perform a synchronize
   */
  readIdbOn: IdbStoreSynchronize[],

  /**
   * Which channel name to use, defaults to 'IdbStoreChannel'
   */
  broadcastChannelName: string;  
  broadcastChannelNotifyThrottleTime: number;
  broadcastChannelReceiveDebounceTime: number;
  skipMessagesWhileHidden: boolean;
  skipNotifyWhileHidden: boolean;

  writeDebounceTime: number;
}

export const idbStoreConfig = new InjectionToken<IdbStoreConfig>('IdbStoreConfig');

export const defaultConfig: IdbStoreConfig = {
  synchronizeWhenDocumentHidden: false,
  broadcastChannelName: 'IdbStoreChannel',
  readIdbOn: [
    'init',
    'visibilityChange',
    'broadcastChannelNotify'
  ],
  broadcastChannelNotifyThrottleTime: 0,
  broadcastChannelReceiveDebounceTime: 0,
  skipMessagesWhileHidden: false,
  skipNotifyWhileHidden: true,
  writeDebounceTime: 0
};