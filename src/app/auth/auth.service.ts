import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';

import { User } from './user.model';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

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
  // authenticatedUser = new BehaviorSubject<User>(null);

  private tokenExpirationTimer: any = null;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  signup(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
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
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
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

    // const loadedUser = new User(
    //   email,
    //   id,
    //   _token,
    //   new Date(_tokenExpirationDate)
    // );

    if (_token) {
      this.store.dispatch(
        new AuthActions.Login({
          email,
          userId: id,
          token: _token,
          expirationDate: new Date(_tokenExpirationDate),
        })
      );
      // this.authenticatedUser.next(loadedUser);
      const expirationDuration =
        new Date(_tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
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
    this.store.dispatch(
      new AuthActions.Login({
        email,
        userId: localId,
        token: idToken,
        expirationDate: expiresIn,
      })
    );
    // this.authenticatedUser.next(user);
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(user));
  }

  logout() {
    this.store.dispatch(new AuthActions.Logout());

    // this.authenticatedUser.next(null);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.router.navigate(['/auth']);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, Math.max(expirationDuration, 0));
  }
}
