import View from './View.js';
import icons from '../../img/icons.svg'; //Parcel

class shoppingList extends View {
  _parentElement = document.querySelector('.recipe__details');
  // _errorMessage = 'We could not find that recipe. Please try another one';
  // _message = '';

  addHandlerClick(handler) {
    document
      .querySelector('.btn--shopping')
      .addEventListener('click', function (e) {
        e.preventDefault();
        const btn = e.target.closest('.btn--shopping');
        if (!btn) return;

        handler();
      });
  }
}

export default new shoppingList();
