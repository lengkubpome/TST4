
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRountingModule } from './app-rounting.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';

import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { SidenavListComponent } from './shared/sidenav-list/sidenav-list.component';
import { WelcomeComponent } from './contents/welcome/welcome.component';

import { UIService } from './shared/ui.service';

import { reducers } from './app.reducer';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavListComponent,
    WelcomeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRountingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    StoreModule.forRoot(reducers),

    AuthModule,

  ],
  providers: [UIService],
  bootstrap: [AppComponent]
})
export class AppModule { }
