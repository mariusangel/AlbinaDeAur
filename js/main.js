// main.js
import { updateAuthUI, loginUser, registerUser } from './auth.js';
import CartManager from './cartManager.js';
import { initAuthForms, updateAuthUI } from './auth.js';

// Setează funcții globale pentru compatibilitate
window.addToCart = CartManager.addToCart.bind(CartManager);
window.updateCartDisplay = CartManager.updateCartDisplay.bind(CartManager);
window.syncTempCart = CartManager.syncTempCart.bind(CartManager);

document.addEventListener("DOMContentLoaded", async () => {
  
  initAuthForms();
  updateAuthUI(document.querySelector('.wrapper'));
  
  const headerResponse = await fetch("../header.html");
  const headerHTML = await headerResponse.text();
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
  
  const wrapper = document.querySelector('.wrapper'),
        loginLink = document.querySelector('.login-link'),
        registerLink = document.querySelector('.register-link'),
        btnPopup = document.querySelector('.profile-button'),
        iconClose = document.querySelector('.icon-close'),
        cartIcon = document.querySelector('.cart-icon'),
        cartDropdown = document.querySelector('.cart-dropdown'),
        productCards = document.querySelectorAll('.product-card');
        
  updateAuthUI(wrapper);

  registerLink.addEventListener('click', event => {
    event.preventDefault();
    wrapper.classList.add('active');
  });

  loginLink.addEventListener('click', event => {
    event.preventDefault();
    wrapper.classList.remove('active');
  });

  btnPopup.addEventListener('click', event => {
    event.preventDefault();
    wrapper.classList.add('active-popup');
  });

  // Verifică dacă trebuie deschis automat popup-ul (ex. "remember me")
  if (localStorage.getItem('rememberMe') === 'true') {
    wrapper.classList.add('active-popup');
  }

  iconClose.addEventListener('click', () => wrapper.classList.remove('active-popup'));

  // Evenimente pentru dropdown-ul coșului
  if (cartIcon && cartDropdown) {
    cartIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      cartDropdown.classList.toggle('active');
      window.updateCartDisplay();
    });

    // Ascunde dropdown-ul când se face click în afara lui
    document.addEventListener('click', () => {
      cartDropdown.classList.remove('active');
    });

    // Previne închiderea dropdown-ului când se face click în interiorul lui
    cartDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Evenimente suplimentare pentru hover pe iconița coșului
    cartIcon.addEventListener('mouseenter', () => {
      cartDropdown.classList.add('active');
      window.updateCartDisplay();
    });

    cartIcon.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (!cartDropdown.matches(':hover')) {
          cartDropdown.classList.remove('active');
        }
      }, 100);
    });
  }

  // Eveniment pentru butonul de vizualizare a coșului
  const viewCartBtn = document.querySelector('.view-cart-btn');
  if (viewCartBtn) {
    viewCartBtn.addEventListener('click', () => {
      window.location.href = '/Magazin/cos.html';
    });
  }

  // Evenimente pentru butoanele "Add to Cart" de pe pagină
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const productItem = event.target.closest('.product-item');
      const productId = productItem.querySelector('.view-product').href.split('id=')[1];
      const productName = productItem.dataset.name;
      const productPrice = productItem.dataset.price + ' RON';
      const productImg = productItem.querySelector('img').src;
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImg
      };

      window.addToCart(product, 1);
    });
  });

  // Evenimente pentru fiecare card de produs (redirecționare)
  productCards.forEach(item => {
    item.addEventListener('click', () => {
      const productLink = item.querySelector('.view-product').href;
      window.location.href = productLink;
    });
  });

  // Apel inițial pentru actualizarea UI-ului de autentificare și coș
  updateAuthUI(wrapper);
  window.updateCartDisplay();
});
