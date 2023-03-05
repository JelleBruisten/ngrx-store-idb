import { ModuleWithProviders, NgModule } from "@angular/core";
import { META_REDUCERS } from "@ngrx/store";
import { IdbStoreConfig, defaultConfig, idbStoreConfig } from "./idb-store.config";
import { idbMetaReducer } from "./idb-store.meta-reducer";
import { DOCUMENT } from "@angular/common";

@NgModule()
export class IdbStoreModule {
  static forRoot(inputConfig?: IdbStoreConfig): ModuleWithProviders<IdbStoreModule> {     

    const config = {
      ... defaultConfig,
      inputConfig
    };

    return {
      ngModule: IdbStoreModule,
      providers: [
        {
          provide: META_REDUCERS,
          useFactory: (document: Document) => idbMetaReducer(config, document),
          deps: [DOCUMENT],
          multi: true
        },
        {
          provide: idbStoreConfig,
          useValue: config
        }
      ],
    };
  }
}