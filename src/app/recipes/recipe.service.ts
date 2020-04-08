import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [
    new Recipe(
      'A test recipe',
      'This is simply a test',
      'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg',
      [new Ingredient('salmon', 2), new Ingredient('salt', 5)]
    ),
    new Recipe(
      'Another test recipe',
      'This is simply a test',
      'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg',
      [new Ingredient('salmon', 3), new Ingredient('vegetables', 5)]
    ),
  ];

  constructor(private shoppingListService: ShoppingListService) {}

  getRecipes() {
    return [...this.recipes];
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ings: Ingredient[]) {
    this.shoppingListService.addIngredients(ings);
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
