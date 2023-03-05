import { InjectionToken } from "@angular/core"

export interface IdbStoreConfig {
  stateKey: string,

  /**
   * Not recommended, might cause weird behavior
   */
  synchronizeWhenDocumentHidden: boolean;
}

export const idbStoreConfig = new InjectionToken<IdbStoreConfig>('IdbStoreConfig');

export const defaultConfig: IdbStoreConfig = {
  stateKey: 'state',
  synchronizeWhenDocumentHidden: false
};