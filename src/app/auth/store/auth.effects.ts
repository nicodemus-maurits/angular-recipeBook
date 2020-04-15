import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

import * as AuthActions from './auth.actions';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable()
export class AuthEffects {
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
          map((resData) => {
            const expirationDate = new Date(
              new Date().getTime() + +resData.expiresIn * 1000
            );
            return new AuthActions.Login({
              email: resData.email,
              userId: resData.localId,
              token: resData.idToken,
              expirationDate: expirationDate,
            });
          }),
          catchError((resError) => {
            let errorMessage = 'Unknown Error has been occured!';
            if (!resError.error || !resError.error.error) {
              return of(new AuthActions.LoginFailed(errorMessage));
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
                errorMessage =
                  'This account has been disabled by administrator';
                break;
            }
            return of(new AuthActions.LoginFailed(errorMessage));
          })
        );
    })
  );

  @Effect({ dispatch: false })
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.LOGIN),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  constructor(
    private actions$: Actions,
    private httpClient: HttpClient,
    private router: Router
  ) {}
}
