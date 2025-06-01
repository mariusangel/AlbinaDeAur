// js/main.js
import { updateAuthUI, initAuthForms } from './auth.js';
import CartManager from './cartManager.js';

const updateCartCounter = async () => {
  const cartCount = document.querySelector('.cart-count');
  if (!cartCount) return;
  
  const items = await CartManager.getCart();
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;
};

let isInitialized = false;

document.addEventListener("DOMContentLoaded", async () => {
  if (isInitialized) return;
  isInitialized = true;

  // ===========================
  // 2. Încarcă header.html
  // ===========================
  let headerElementsLoaded = false;
  const existingHeader = document.querySelector('header.header');

  if (!existingHeader) {
    try {
      const headerResp = await fetch('/header.html');
      if (!headerResp.ok) throw new Error(`HTTP ${headerResp.status}`);
      const headerHTML = await headerResp.text();
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
      headerElementsLoaded = true; // Marchează că header-ul este încărcat
    } catch (err) {
      console.error('Eroare la încărcarea header-ului:', err);
      return;
    }
  }

  initAuthForms();
  const wrapper = document.querySelector('.wrapper');
  if (!wrapper) {
    console.error('Wrapper nu a fost găsit în DOM!');
    return;
  }
  updateAuthUI(wrapper);

  // ===========================
  // 3. Elemente din header (după inserare)
  // ===========================

  if (existingHeader || headerElementsLoaded) {
    // Selectare elemente DINAMICE după inserare
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const btnPopup = document.querySelector('#profileButton');
    const iconClose = document.querySelector('.icon-close');

    // Event listeners pentru formulare
    registerLink?.addEventListener('click', e => {
      e.preventDefault();
      wrapper.classList.add('active');
    });

    loginLink?.addEventListener('click', e => {
      e.preventDefault();
      wrapper.classList.remove('active');
    });

    btnPopup?.addEventListener('click', e => {
      e.preventDefault();
      if (wrapper) { // Verifică existența
      wrapper.classList.add('active-popup');
      }
    });

    iconClose?.addEventListener('click', () => {
      wrapper.classList.remove('active-popup');
    });
  }

  const cartIcon = document.querySelector('.cart-icon');
  const cartDropdown = document.querySelector('.cart-dropdown');
  const cartCount = document.querySelector('.cart-count');
  const itemsContainer = document.querySelector('.cart-items-container');
  const subtotalPriceElt = document.querySelector('.cart-subtotal-price');
  const viewCartBtn = document.querySelector('.view-cart-btn');
  const checkoutBtn = document.querySelector('.checkout-btn');

  // ===========================
  // 4. Dropdown coș - refresh
  // ===========================
  async function refreshCartDropdown() {
    await CartManager.syncTempCart();
    const items = await CartManager.getCart();

    itemsContainer.innerHTML = items.length
      ? items.map(i => `
          <div class="cart-item">
            <img src="${i.product.image}" class="cart-item-image" />
            <div class="cart-items-details">
              <span class="cart-item-name">${i.product.name}</span>
              <span class="cart-item-quantity">x${i.quantity}</span>
            </div>
          </div>
        `).join('')
      : `<div class="empty-cart">
          <p>Coșul tău e gol!</p>
          <a href="/Magazin/magazin.html" class="btn-return-shop">Începe cumpărăturile</a>
        </div>`;

    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    cartCount.textContent = totalCount;

    const subtotal = items.reduce((sum, i) => {
      const price = typeof i.product.price === 'string'
        ? parseFloat(i.product.price.replace(/\D/g, ''))
        : i.product.price;
      return sum + price * i.quantity;
    }, 0);
    subtotalPriceElt.textContent = `${subtotal.toFixed(2)} RON`;

    checkoutBtn.disabled = items.length === 0;
    viewCartBtn.disabled = items.length === 0;
    
    // Actualizează counter-ul global
    await updateCartCounter();
  }

  // ===========================
  // 5. Hover coș
  // ===========================
  cartIcon.addEventListener('mouseenter', async () => {
    await refreshCartDropdown();
    cartDropdown.classList.add('active');
  });

  cartIcon.addEventListener('mouseleave', () => {
    cartDropdown.classList.remove('active');
  });

  cartDropdown.addEventListener('click', e => e.stopPropagation());

  viewCartBtn.addEventListener('click', () => {
    window.location.href = '/Magazin/cos.html';
  });

  // ===========================
  // 6. Global funcții coș
  // ===========================
  window.addToCart         = CartManager.addToCart.bind(CartManager);
  window.updateCartDisplay = CartManager.updateCartDisplay.bind(CartManager);
  window.syncTempCart      = CartManager.syncTempCart.bind(CartManager);


  // ===========================
  // 8. Delegare: Add to Cart
  // ===========================
  /*document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();     // împiedică orice comportament implicit (de ex: <a>)
      e.stopPropagation();    // oprește propagarea către `.product-item`

      const item = e.target.closest('.product-item');
      const id   = item.querySelector('.view-product').href.split('id=')[1];
      const product = {
        _id:    id,
        name:   item.dataset.name,
        price:  item.dataset.price + ' RON',
        image:  item.querySelector('img').src
      };
      window.addToCart(product, 1);
    });
  });*/
  // ===========================
// 8. Delegare: Add to Cart
// ===========================
  document.addEventListener('click', e => {
    const addToCartBtn = e.target.closest('.add-to-cart');
    if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();

      // Verifică dacă butonul este dezactivat
      if (addToCartBtn.disabled) {
        showCartNotification('Produsul nu este în stoc', 'error');
        return;
      }

      const item = addToCartBtn.closest('.product-item');
      const productId = item.dataset.id;
      const stock = parseInt(item.dataset.stock, 10);

      // Verifică stocul înainte de adăugare
      if (stock <= 0) {
        showCartNotification('Produsul nu este în stoc', 'error');
        return;
      }

      const product = {
        _id: item.dataset.id,
        name: item.dataset.name,
        price: item.dataset.price + ' RON',
        image: item.querySelector('img')?.src
      };
      window.addToCart(product, 1);
    }
  });


  // ===========================
  // 9. Click pe card produs
  // ===========================
  document.querySelectorAll('.product-card, .product-item').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.add-to-cart')) return; // Ignoră dacă s-a dat click pe butonul Add to Cart
      const href = card.querySelector('.view-product')?.href;
      if (href) window.location.href = href;
    });
  });

  // ===========================
  // 10. Final: sincronizări
  // ===========================
  await CartManager.syncTempCart();
  await CartManager.updateCartDisplay();
  await updateCartCounter(); // Actualizează counter-ul inițial

  // Ascultă evenimente de actualizare coș
  document.addEventListener('cartUpdated', updateCartCounter);
});
