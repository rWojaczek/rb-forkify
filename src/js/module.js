import { async } from 'regenerator-runtime';
import { API_URL, KEY, RES_PER_PAGE } from './config.js';
import { AJAX } from './helpers.js';
import { Number } from 'core-js';
import shoppingList from './views/shoppingList.js';

export const state = {
  shoppingList: [{ quantity: 1, unit: 'kg', description: 'sugar' }],
  recipe: {},
  search: { query: '', results: [], page: 1, resultsPerPage: RES_PER_PAGE },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  // console.log(recipe);
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        // cookingTime: rec.cooking_time,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function () {
  //Add bookmark
  state.bookmarks.push(state.recipe);
  //mark current recipe as bookmarked
  state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function () {
  //delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === state.recipe.id);
  console.log(index);
  state.bookmarks.splice(index, 1);
  //mark current recipe as not bookmarked
  state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

// export const sortResult = async function () {
//   console.log(state.search.results);
// };

// const clearBookmarks = function () {
//   localStorage.clear('bookmarks');
// };
//in case you need to clear bookmarks
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, please use the correct format'
          );
        console.log(ingArr);
        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(ingredients);

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
//DO VALIDATION ON CHANGE VALUE IN INPUTS,event listener on change
let validationError = false;
export const validateRecipeInputs = async function (newRecipe, changedInput) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, please use the correct format'
          );

        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });
    const unitsArray = ['kg', 'g', 'dg'];
    const uploadBtn = document.querySelector('.upload__btn');

    let ValidateMessageError = '';
    let disableBtn = false;
    const validateDsiabled = function () {
      changedInput.classList.add('Error');
      uploadBtn.disabled = true;
      uploadBtn.classList.add('disable');
      const validationMesage = `<div class="errorClass"><p>${ValidateMessageError}</p></div>`;
      changedInput.insertAdjacentHTML('afterbegin', validationMesage);
    };

    ingredients.forEach((el, ind) => {
      if (!isFinite(ingredients[ind].quantity) && validationError === false) {
        ValidateMessageError = `first input value should be an ingredient quantity`;
        validateDsiabled();
      }
      if (
        !unitsArray.includes(ingredients[ind].unit) &&
        validationError === false
      ) {
        ValidateMessageError = `second input value should be kg, g or dg`;
        validateDsiabled();
      }

      if (ingredients[ind].description === '' && validationError === false) {
        ValidateMessageError = `last input value should be an ingredient itself`;
        validateDsiabled();
      }
      validationError = true;
      if (
        document.querySelector('.errorClass') &&
        ingredients[ind].description !== '' &&
        isFinite(ingredients[ind].quantity) &&
        unitsArray.includes(ingredients[ind].unit)
      ) {
        console.log('pole ok');
        uploadBtn.classList.remove('disable');
        changedInput.classList.remove('Error');
        validationError = false;
        document.querySelectorAll('.errorClass').forEach(function (el) {
          el.remove();
        });
      }
    });
  } catch (err) {
    throw err;
  }
};

// const init = function () {
//   const storage = localStorage.getItem('shoppingList');
//   if (storage) state.shoppingList = JSON.parse(storage);
// };

// init();

export const readLocalStorage = function () {
  const storage2 = localStorage.getItem('shoppingList');
  if (storage2) state.shoppingList = JSON.parse(storage2);
};

export const saveIngredientsForShopping = async function (data) {
  console.log(data);
  readLocalStorage();

  data.forEach(function (el, ind, arr) {
    if (
      state.shoppingList.some(spL => spL.description === arr[ind].description)
    ) {
      return;
    }

    localStorage.setItem('shoppingList', JSON.stringify(state.shoppingList));

    state.shoppingList.push(el);
  });
};

// localStorage.clear();
