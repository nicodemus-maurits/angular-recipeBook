import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authenticatedUserSubscription: Subscription;
  isAuthenticated: boolean = false;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.authenticatedUserSubscription = this.store
      .select('auth')
      .pipe(map((authState) => authState.user))
      .subscribe(
        // this.authenticatedUserSubscription = this.authService.authenticatedUser.subscribe(
        (user) => {
          // Will return true if there is a user available
          this.isAuthenticated = !!user;
        }
      );
  }

  onStoreData() {
    this.store.dispatch(new RecipesActions.StoreRecipes());

    // this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.store.dispatch(new RecipesActions.FetchRecipes());

    // this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());

    // this.authService.logout();
  }

  ngOnDestroy() {
    this.authenticatedUserSubscription.unsubscribe();
  }
}
