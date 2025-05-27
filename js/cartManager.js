import { showCartNotification } from "./utils.js";
import { BASE_URL } from "./config.js";

const CartManager = {

  async addToCart(product, quantity = 1) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Utilizator autentificat: adăugare în backend
        const response = await fetch(`${BASE_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product._id || product.id, quantity })
        });
        if (!response.ok) throw new Error('Eroare la adăugare în coș');
      } else {
        // Utilizator neautentificat: adăugare în localStorage (tempCart)
        let tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        const existing = tempCart.find(item => item.id === product.id || item.id === product._id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          tempCart.push({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          });
        }
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
      }
      
      await this.updateCartDisplay();
      showCartNotification('Produs adăugat în coș!');
    } catch (error) {
      console.error('Eroare:', error);
      showCartNotification('Eroare la adăugare în coș', 'error');
    }
  },

  async getCart() {
    if (localStorage.getItem('authToken')) {
      try {
        const response = await fetch(`${BASE_URL}/api/cart`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (response.ok) {
          const cart = await response.json();
          return cart.items || [];
        }
      } catch (error) {
        console.error('Eroare preluare coș:', error);
      }
    }
    // Dacă nu e autentificat sau apare eroare, folosește tempCart din localStorage
    const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
    return tempCart.map(item => ({
      product: {
        _id: item.id,
        name: item.name,
        price: item.price,
        image: item.image
      },
      quantity: item.quantity
    }));
  },

  async updateCartDisplay() {
    try {
      if (!document.querySelector('.cart-items') || !document.getElementById('total-price')) {
        return;  // pagină fără tabla coș => nu încercăm să updatăm
      }
      const cartItems = await this.getCart();
      const cartItemsContainer = document.querySelector('.cart-items');
      const totalPriceElement = document.getElementById('total-price');
      cartItemsContainer.innerHTML = '';

      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="5">Coșul este gol.</td></tr>';
        totalPriceElement.textContent = '0 RON';
        return;
      }

      cartItems.forEach(item => {
        const row = document.createElement('tr');
        const priceValue = typeof item.product.price === 'string'
          ? parseFloat(item.product.price.replace('RON', '').trim())
          : item.product.price;
        const totalValue = (priceValue * item.quantity).toFixed(2);

        row.innerHTML = `
          <td><img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image"></td>
          <td>${item.product.name}</td>
          <td>${priceValue.toFixed(2)} RON</td>
          <td>
            <div class="quantity-selector">
              <button class="minus-btn" data-id="${item.product._id}">-</button>
              <input type="number" min="1" class="quantity-input" data-id="${item.product._id}" value="${item.quantity}">
              <button class="plus-btn" data-id="${item.product._id}">+</button>
            </div>
          </td>
          <td>${totalValue} RON</td>
          <td><button class="delete-btn" data-id="${item.product._id}">x</button></td>
        `;
        cartItemsContainer.appendChild(row);
      });

      const total = cartItems.reduce((sum, item) => {
        const priceValue = typeof item.product.price === 'string'
          ? parseFloat(item.product.price.replace('RON', '').trim())
          : item.product.price;
        return sum + (priceValue * item.quantity);
      }, 0);
      totalPriceElement.textContent = `${total.toFixed(2)} RON`;
    } catch (error) {
      console.error('Eroare la actualizarea coșului:', error);
    }
  },


  async updateQuantity(productId, newQuantity) {
    if (localStorage.getItem('authToken')) {
      try {
        const response = await fetch(`${BASE_URL}/api/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        if (!response.ok) throw new Error('Eroare la actualizare cantitate');
      } catch (error) {
        console.error('Eroare:', error);
        alert('Nu s-a putut actualiza cantitatea');
        return;
      }
    } else {
      let tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
      const itemIndex = tempCart.findIndex(item => item.id === productId);
      if (itemIndex >= 0) {
        tempCart[itemIndex].quantity = newQuantity;
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
      }
    }
    await this.updateCartDisplay();
  },

  async deleteItem(productId) {
    if (localStorage.getItem('authToken')) {
      try {
        const response = await fetch(`${BASE_URL}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) throw new Error('Eroare la ștergere produs');
      } catch (error) {
        console.error('Eroare:', error);
        alert('Nu s-a putut șterge produsul');
        return;
      }
    } else {
      let tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
      tempCart = tempCart.filter(item => item.id !== productId);
      localStorage.setItem('tempCart', JSON.stringify(tempCart));
    }
    await this.updateCartDisplay();
  },


  async syncTempCart() {
    const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
    if (tempCart.length === 0) return;
    for (const item of tempCart) {
      await this.addToCart({
        _id: item.id,
        name: item.name,
        price: item.price,
        image: item.image
      }, item.quantity);
    }
    localStorage.removeItem('tempCart');
    await this.updateCartDisplay();
  },

  async createCheckoutSession() {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${BASE_URL}/api/orders/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Eroare creare sesiune checkout');
    }
    const { url } = await res.json();
    return url;
  }
};

export default CartManager;