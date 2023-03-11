import { InjectionToken } from "@angular/core"

export interface IdbStoreConfig {
  /**
   * Synchronize the state on init
   */
  synchronizeOnInit: boolean,

  /**
   * Synchronize on broadcast
   */
  synchronizeByBroadcast: boolean;

  /**
   * What indexed database name we to use
   */
  indexedDbName?: string | null;

  /**
   * What indexed database store name to use
   */
  indexedDbStoreName?: string | null;

  /**
   * Which channel name to use, defaults to 'IdbStoreChannel'
   */
  broadcastChannelName: string;  

  /**
   * What debounce time we should use
   */
  writeDebounceTime: number;

  /**
   * What reducers/state slice we should ignore
   */
  ignoredStates: string[]
}

export const defaultConfig: IdbStoreConfig = {
  broadcastChannelName: 'IdbStoreChannel',
  synchronizeOnInit: true,
  synchronizeByBroadcast: true,
  writeDebounceTime: 0,
  ignoredStates: ['router'],
  indexedDbName: null,
  indexedDbStoreName: null
};

export const idbStoreConfig = new InjectionToken<IdbStoreConfig>('IdbStoreConfig');