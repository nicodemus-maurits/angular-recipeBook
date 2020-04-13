import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [AuthComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([{ path: 'auth', component: AuthComponent }]),
  ],
  // exports: [AuthComponent],
})
export class AuthModule {}
