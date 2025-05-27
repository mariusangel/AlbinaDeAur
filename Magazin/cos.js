// Magazin/cos.js
import CartManager from '../js/cartManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Dacă există produse în tempCart și user este autentificat, le sincronizăm cu backend
    await CartManager.syncTempCart();

    // 2. Afișăm coșul (din backend sau tempCart)
    await CartManager.updateCartDisplay();
  } catch (err) {
    console.error('Eroare inițializare coș:', err);
  }

  // Elemente UI
  const checkoutButton   = document.querySelector('.checkout-btn');
  const backToShopButton = document.getElementById('back-to-shop-btn');

  // 3. Handler pentru butonul de checkout
  checkoutButton.addEventListener('click', async () => {
    if (!window.authToken) {
      alert('Pentru a finaliza comanda, te rugăm să te autentifici.');
      return;
    }
    try {
      const url = await CartManager.createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      console.error('Eroare la inițierea plății:', err);
      alert('A apărut o eroare la inițierea plății. Te rugăm să încerci din nou.');
    }
  });

  // 4. Handler pentru butonul "Înapoi la magazin"
  if (backToShopButton) {
    backToShopButton.addEventListener('click', () => {
      window.location.href = 'magazin.html';
    });
  }
});
