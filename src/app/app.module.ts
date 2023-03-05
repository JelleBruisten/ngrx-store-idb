import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { HomeComponent } from './home/home.component';
import { counterReducer } from './state/reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { IdbStoreModule } from './idb/idb-store.module';
import { EffectsModule } from '@ngrx/effects';
import { IdbStoreEffect } from './idb/idb-store.effect';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,    
    StoreModule.forRoot({
      root: counterReducer
    }, 
    {
      // metaReducers: metaReducers
    }),    
    EffectsModule.forRoot([IdbStoreEffect]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: true, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
    }),
    IdbStoreModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
}
