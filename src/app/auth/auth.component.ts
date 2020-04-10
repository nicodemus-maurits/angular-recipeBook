import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = null;
  authForm: FormGroup;

  constructor(private authService: AuthService) {}

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
  }

  onSubmit() {
    this.error = null;
    if (!this.authForm.valid) {
      return;
    }
    const { email, password, confirmPassword } = this.authForm.value;
    this.isLoading = true;
    if (this.isLoginMode) {
      this.isLoading = false;
    } else {
      if (password === confirmPassword) {
        this.authService.signup(email, password).subscribe(
          (response) => {
            console.log(response);
            this.isLoading = false;
          },
          (error) => {
            this.error = 'An error occured!';
            this.isLoading = false;
          }
        );
      } else {
        this.isLoading = false;
        this.error = 'Password do not match! ';
        return;
      }
    }

    this.authForm.reset();
  }
}
