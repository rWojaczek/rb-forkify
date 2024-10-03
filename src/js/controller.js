import * as model from './module.js';
// import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import validation from './views/validation.js';
import shoppingList from './views/shoppingList.js';
import shoppingView from './views/shoppingView.js';

import 'core-js/stable'; //Polyfilling ASYN AWAIT
import 'regenerator-runtime/runtime'; //Polyfilling everything else

const contorlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    //0) update results view to mark selected search result
    resultsView.render(model.getSearchResultsPage());

    //1)Loading Recipe
    await model.loadRecipe(id);

    //2) Rendering Recipe
    recipeView.render(model.state.recipe);
    // console.log(model.state.recipe.ingredients);
    //updating bookmarks view

    bookmarkView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //load search
    await model.loadSearchResults(query);

    //render results
    resultsView.render(model.getSearchResultsPage(1));
    console.log(model.state.search.results);

    //render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //render new result
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render initial pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings (in state)\

  model.updateServings(newServings);

  //update ther recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) add/remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark();
  } else {
    model.deleteBookmark();
  }
  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data

    await model.uploadRecipe(newRecipe);

    //remder recipe
    recipeView.render(model.state.recipe);

    //succes message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.error('błąd💥', err);
    addRecipeView.renderError(err.message);
  }

  //upload new recipe data
};

const validateRecipe = async function (newRecipe, changedInput) {
  try {
    await model.validateRecipeInputs(newRecipe, changedInput);
  } catch (err) {
    console.error('błąd💥', err);
    validation.renderError(err.message);
  }
};

const AddToShoppingList = async function () {
  if (model.state.recipe) model.readLocalStorage();
  model.saveIngredientsForShopping(model.state.recipe.ingredients);
};

const showShoppingList = async function () {
  try {
    model.readLocalStorage();
    shoppingView.render(model.state.shoppingList);
    document.querySelector('.shopping__list').style.display = 'block';
  } catch (err) {}
};

document
  .querySelector('.shopping__list')
  .addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.classList.contains('btn--remove')) {
      const listItems = document.querySelectorAll('.shopItem');
      const arr = Array.from(listItems);
      const index = arr.indexOf(e.target.parentElement);
      model.state.shoppingList.splice(index, 1);
      e.target.closest('.shopItem').remove();
    }
    localStorage.setItem(
      'shoppingList',
      JSON.stringify(model.state.shoppingList)
    );

    if (e.target.classList.contains('btn--close')) {
      console.log('close widnow');
      document.querySelector('.shopping__list').style.display = 'none';
    }
  });

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(contorlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  validation.addHandlerClick(validateRecipe);
  shoppingList.addHandlerClick(AddToShoppingList);
  shoppingView.addHandlerClick(showShoppingList);
};
init();
