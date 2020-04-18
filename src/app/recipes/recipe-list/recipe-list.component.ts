import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipesUpdateSubsription: Subscription;
  recipes: Recipe[] = [];

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit(): void {
    // this.recipes = this.recipeService.getRecipes();
    // this.recipesUpdateSubsription = this.recipeService.recipesChanged.subscribe(
    this.recipesUpdateSubsription = this.store
      .select('recipes')
      .pipe(map((recipesState) => recipesState.recipes))
      .subscribe((recipes: Recipe[]) => (this.recipes = recipes));
  }

  ngOnDestroy() {
    this.recipesUpdateSubsription.unsubscribe();
  }
}
