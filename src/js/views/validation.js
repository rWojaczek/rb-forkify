import View from './View.js';
import icons from '../../img/icons.svg'; //Parcel

class validation extends View {
  _parentElement = document.querySelector('.upload');
  _errorMessage = 'We could not find that recipe. Please try another one';
  _message = '';

  addHandlerClick(handler) {
    this._parentElement.addEventListener('change', function (e) {
      e.preventDefault();
      const changedInput = e.target.parentElement;
      const dataArr = [...new FormData(this)];

      const data = Object.fromEntries(dataArr);

      handler(data, changedInput);
    });
  }
}

export default new validation();
