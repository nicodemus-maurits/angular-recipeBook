import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { Ingredient } from '../shared/ingredient.model';
import { Subscription, Observable } from 'rxjs';
import * as fromShoppingList from './store/shopping-list.reducer';
import * as ShoppingListActions from './store/shopping-list.actions';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ ingredients: Ingredient[] }>;
  private ingChangesSub: Subscription;

  constructor(private store: Store<fromShoppingList.AppState>) {}

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');

    // this.ingredients = this.shoppingListService.getIngredients();
    // this.ingChangesSub = this.shoppingListService.ingredientsChanged.subscribe(
    //   (ings: Ingredient[]) => {
    //     this.ingredients = ings;
    //   }
    // );
  }

  onEditItem(index: number) {
    this.store.dispatch(new ShoppingListActions.StartEdit(index));

    // this.shoppingListService.startedEditing.next(index);
  }

  ngOnDestroy() {
    // this.ingChangesSub.unsubscribe();
  }
}
