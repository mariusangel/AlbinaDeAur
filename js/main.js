// js/main.js
import { updateAuthUI, initAuthForms } from './auth.js';
import CartManager from './cartManager.js';

document.addEventListener("DOMContentLoaded", async () => {
  // ===========================
  // 1. Autentificare
  // ===========================
  initAuthForms();
  const wrapper = document.querySelector('.wrapper');
  updateAuthUI(wrapper);

  // ===========================
  // 2. Încarcă header.html
  // ===========================
  try {
    const headerResp = await fetch('/header.html');
    if (!headerResp.ok) throw new Error(`HTTP ${headerResp.status}`);
    const headerHTML = await headerResp.text();
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  } catch (err) {
    console.error('Eroare la încărcarea header-ului:', err);
  }

  // ===========================
  // 3. Elemente din header (după inserare)
  // ===========================
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
  // 7. UI login/register
  // ===========================
  const loginLink     = document.querySelector('.login-link');
  const registerLink  = document.querySelector('.register-link');
  const btnPopup      = document.querySelector('.profile-button');
  const iconClose     = document.querySelector('.icon-close');

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
    wrapper.classList.add('active-popup');
  });

  iconClose?.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
  });

  if (localStorage.getItem('rememberMe') === 'true') {
    wrapper.classList.add('active-popup');
  }

  // ===========================
  // 8. Delegare: Add to Cart
  // ===========================
  document.querySelectorAll('.add-to-cart').forEach(button => {
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
});

  // ===========================
  // 9. Click pe card produs
  // ===========================
  document.querySelectorAll('.product-card, .product-item').forEach(card => {
    card.addEventListener('click', () => {
      const href = card.querySelector('.view-product')?.href;
      if (href) window.location.href = href;
    });
  });

  // ===========================
  // 10. Final: sincronizări
  // ===========================
  await CartManager.syncTempCart();
  await CartManager.updateCartDisplay();
});
