import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = null;
  authForm: FormGroup;
  private storeSub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    this.authForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl(null),
    });

    this.storeSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    const confirmPasswordControl = this.authForm.get('confirmPassword');

    if (this.isLoginMode) {
      confirmPasswordControl.setValidators(null);
    } else {
      confirmPasswordControl.setValidators([
        Validators.required,
        Validators.minLength(6),
      ]);
    }
    this.cdr.detectChanges();
  }

  onSubmit() {
    this.error = null;
    if (!this.authForm.valid) {
      return;
    }
    const { email, password, confirmPassword } = this.authForm.value;

    if (this.isLoginMode) {
      this.store.dispatch(new AuthActions.LoginStart({ email, password }));
    } else {
      if (password === confirmPassword) {
        this.store.dispatch(new AuthActions.SignupStart({ email, password }));
      } else {
        this.isLoading = false;
        this.error = 'Password do not match!';
      }
    }

    this.authForm.reset({ email });
  }

  onHandleError() {
    this.store.dispatch(new AuthActions.ClearError());
  }

  ngOnDestroy() {
    if (this.storeSub) this.storeSub.unsubscribe();
  }
}
