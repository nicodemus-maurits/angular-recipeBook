import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Ingredient } from '../shared/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private ingredients: Ingredient[] = [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10),
  ];

  ingredientsChanged = new Subject<Ingredient[]>();

  getIngredients() {
    // return this.ingredients.slice();
    return [...this.ingredients];
  }

  addIngredient(ing: Ingredient) {
    this.ingredients.push(ing);
    this.ingredientsChanged.next([...this.ingredients]);
  }

  addIngredients(ings: Ingredient[]) {
    this.ingredients.push(...ings);
    this.ingredientsChanged.next([...this.ingredients]);
  }
}
