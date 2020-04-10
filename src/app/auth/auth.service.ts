import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  signup(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBXGuQsN2Gr7f-PHu904oDhR48cCjDsvfE',
        { email, password, returnSecureToken: true }
      )
      .pipe(
        catchError((resError) => {
          let errorMessage = 'An unknown error has been occured!';
          if (!resError.error || !resError.error.error) {
            return throwError(errorMessage);
          }
          switch (resError.error.error.message) {
            case 'EMAIL_EXISTS':
              errorMessage = 'Email is already registered!';
          }
          return throwError(errorMessage);
        })
      );
  }
}
