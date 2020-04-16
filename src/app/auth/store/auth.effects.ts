import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

import * as AuthActions from './auth.actions';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (
  expiresIn: number,
  email: string,
  userId: string,
  token: string
) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({
    email,
    userId,
    token,
    expirationDate,
  });
};

const handleError = (resError: any) => {
  let errorMessage = 'Unknown Error has been occured!';
  if (!resError.error || !resError.error.error) {
    return of(new AuthActions.AuthenticateFailed(errorMessage));
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
  return of(new AuthActions.AuthenticateFailed(errorMessage));
};

@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.httpClient
        .post<AuthResponseData>(
          environment.firebaseSignUpURL + environment.firebaseAPIKey,
          {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true,
          }
        )
        .pipe(
          tap((resData) => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map((resData) => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError((resError) => {
            return handleError(resError);
          })
        );
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.httpClient
        .post<AuthResponseData>(
          environment.firebaseLoginURL + environment.firebaseAPIKey,
          {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true,
          }
        )
        .pipe(
          tap((resData) => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map((resData) => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError((resError) => {
            return handleError(resError);
          })
        );
    })
  );

  @Effect({ dispatch: false })
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        return { type: 'DUMMY' };
      }
      const { email, id, _token, _tokenExpirationDate } = userData;

      // const loadedUser = new User(
      //   email,
      //   id,
      //   _token,
      //   new Date(_tokenExpirationDate)
      // );

      if (_token) {
        const expirationDuration =
          new Date(_tokenExpirationDate).getTime() - new Date().getTime();
        // this.autoLogout(expirationDuration);
        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
          email,
          userId: id,
          token: _token,
          expirationDate: new Date(_tokenExpirationDate),
        });
        // this.authenticatedUser.next(loadedUser);
        // const expirationDuration =
        //   new Date(_tokenExpirationDate).getTime() - new Date().getTime();
        // this.autoLogout(expirationDuration);
      }
      return { type: 'DUMMY' };
    })
  );

  @Effect({ dispatch: false })
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('userData');
      this.router.navigate(['/auth']);
    })
  );

  constructor(
    private actions$: Actions,
    private httpClient: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
}
