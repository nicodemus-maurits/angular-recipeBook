import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';

import { User } from './user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  authenticatedUser = new BehaviorSubject<User>(null);

  constructor(private httpClient: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBXGuQsN2Gr7f-PHu904oDhR48cCjDsvfE',
        { email, password, returnSecureToken: true }
      )
      .pipe(
        catchError(this.handleError),
        tap(this.handleAuthenticatedUser.bind(this))
      );
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBXGuQsN2Gr7f-PHu904oDhR48cCjDsvfE',
        { email, password, returnSecureToken: true }
      )
      .pipe(
        catchError(this.handleError),
        // Have to use bind because we are using 'this' in handleAuthenticatedUser function
        tap(this.handleAuthenticatedUser.bind(this))
      );
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const { email, id, _token, _tokenExpirationDate } = userData;

    const loadedUser = new User(
      email,
      id,
      _token,
      new Date(_tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.authenticatedUser.next(loadedUser);
    }
  }

  private handleError(resError: HttpErrorResponse) {
    let errorMessage = 'Unknown Error has been occured!';
    if (!resError.error || !resError.error.error) {
      return throwError(errorMessage);
    }

    switch (resError.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'Email is already registered!';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage = 'Too many sign up attempts! Please try later.';
        break;
      case 'INVALID_PASSWORD':
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'Username or Password is incorrect.';
        break;
      case 'USER_DISABLED':
        errorMessage = 'This account has been disabled by administrator';
        break;
    }
    return throwError(errorMessage);
  }

  private handleAuthenticatedUser(resData) {
    const { email, localId, idToken, expiresIn } = resData;
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, localId, idToken, expirationDate);
    this.authenticatedUser.next(user);

    localStorage.setItem('userData', JSON.stringify(user));
  }

  logout() {
    this.authenticatedUser.next(null);
    this.router.navigate(['/auth']);
  }
}
