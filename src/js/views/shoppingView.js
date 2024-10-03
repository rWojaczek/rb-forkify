import View from './View.js';
import icons from '../../img/icons.svg'; //Parcel

class shoppingView extends View {
  _parentElement = document.querySelector('.shopping__list');

  addHandlerClick(handler) {
    document
      .querySelector('.btn--showList')
      .addEventListener('click', function (e) {
        // e.preventDefault();
        handler();
      });
  }

  _generateMarkup() {
    return `
        
        <div class="shoppingListContainer">
        <button class="btn--close">&times;</button>
         <h1>SHOPPING LIST</h1>
         <div class="shoppingListView">
          <ul class="ingredientsList">
           ${this._data
             .map(function (el) {
               return `<li class="shopItem"><button class="btn--remove">❌</button> <span>${
                 el.quantity ? el.quantity : ''
               }</span> <span>${el.unit}</span> <span>${el.description}</span> </li>
            `;
             })
             .join('')}
          </ul>
         </div>
        </div>
        `;
  }

  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');

      if (!btn) return;
      handler();
    });
  }
}

export default new shoppingView();
