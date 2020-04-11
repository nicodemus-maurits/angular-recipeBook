import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = null;
  authForm: FormGroup;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
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
    this.isLoading = true;

    let authObs: Observable<AuthResponseData>;

    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      if (password === confirmPassword) {
        authObs = this.authService.signup(email, password);
      } else {
        this.isLoading = false;
        this.error = 'Password do not match!';
      }
    }

    if (authObs) {
      authObs.subscribe(
        (response) => {
          console.log(response);
          this.isLoading = false;
          this.router.navigate(['/recipes']);
        },
        (errorMessage) => {
          console.log(errorMessage);
          this.error = errorMessage;
          this.isLoading = false;
        }
      );
    }

    this.authForm.reset({ email });
  }

  onHandleError() {
    this.error = null;
  }
}
