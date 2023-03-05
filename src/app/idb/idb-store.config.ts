import { InjectionToken } from "@angular/core"

export interface IdbStoreConfig {
  stateKey: string
}

export const idbStoreConfig = new InjectionToken<IdbStoreConfig>('IdbStoreConfig');

export const defaultConfig: IdbStoreConfig = {
  stateKey: 'state',
};