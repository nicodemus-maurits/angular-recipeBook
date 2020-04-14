import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import * as ShoppingListActions from '../shopping-list/store/shopping-list.actions';
import * as fromShoppingList from '../shopping-list/store/shopping-list.reducer';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [
    // new Recipe(
    //   'A test recipe',
    //   'This is simply a test',
    //   'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg',
    //   [new Ingredient('salmon', 2), new Ingredient('salt', 5)]
    // ),
    // new Recipe(
    //   'Another test recipe',
    //   'This is simply a test',
    //   'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg',
    //   [new Ingredient('salmon', 3), new Ingredient('vegetables', 5)]
    // ),
  ];

  constructor(private store: Store<fromShoppingList.AppState>) {}

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.triggerRecipesUpdate();
  }

  getRecipes() {
    return [...this.recipes];
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ings: Ingredient[]) {
    this.store.dispatch(new ShoppingListActions.AddIngredients(ings));
    // this.shoppingListService.addIngredients(ings);
  }

  triggerRecipesUpdate() {
    this.recipesChanged.next([...this.recipes]);
  }

  addRecipe(newRecipe: Recipe) {
    this.recipes.push(newRecipe);
    this.triggerRecipesUpdate();
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.triggerRecipesUpdate();
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.triggerRecipesUpdate();
  }
}
