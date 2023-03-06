import { InjectionToken } from "@angular/core"

export interface IdbStoreConfig {
  /**
   * Not recommended, might cause weird behavior
   */
  synchronizeWhenDocumentHidden: boolean;
}

export const idbStoreConfig = new InjectionToken<IdbStoreConfig>('IdbStoreConfig');

export const defaultConfig: IdbStoreConfig = {
  synchronizeWhenDocumentHidden: false
};