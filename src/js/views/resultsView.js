import View from './View.js';
import icons from 'url:../../img/icons.svg'; //Parcel
import PreviewView from './previewView.js';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query! Please try again ;)';
  _message = '';
  sortBtn = document.querySelector('.nav__btn--sort-recipe');

  _generateMarkup() {
    return this._data.map(result => PreviewView.render(result, false)).join('');
  }
}

export default new ResultsView();
