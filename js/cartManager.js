import { showCartNotification } from "./utils.js";
import { BASE_URL } from "./config.js";

const CartManager = {

  async addToCart(product, quantity = 1) {
    
    try {
      console.log("Adding to cart:", {
        productId: product._id || product.id,
        productName: product.name,
        quantity
      });

      const token = localStorage.getItem('authToken');
      console.log("Auth token:", token); // Verifică dacă token-ul există și este valid

      // Verificare rapidă de stoc în frontend
      if (product.stock <= 0) {
        throw new Error('Produsul nu este în stoc');
      }
      // Verificare stoc în backend doar pentru utilizatorii autentificați
      if (token) {
        const stockResponse = await fetch(`${BASE_URL}/api/products/${product._id}/stock`);
      
        if (!stockResponse.ok) {
          // Dacă endpoint-ul nu există, sări peste verificarea stocului
          if (stockResponse.status === 404) {
            console.warn('Endpoint de verificare stoc nu există, sărim peste verificare');
          } else {
            throw new Error('Eroare la verificarea stocului');
          }
        } else {
          const stockData = await stockResponse.json();
          if (stockData.stock < quantity) {
            throw new Error(`Sunt disponibile doar ${stockData.stock} bucăți`);
          }
        }
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
        await this.updateCartDisplay();
        showCartNotification('Produs adăugat în coș!');
      }

      // Declanșează eveniment de actualizare
      document.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Eroare:', error);
      showCartNotification('Eroare la adăugare în coș', 'error');
    }
  },

  async getCart() {
    // Salvează întotdeauna starea coșului în localStorage
    const saveCartToLocalStorage = (items) => {
      localStorage.setItem('cartSnapshot', JSON.stringify({
        items,
        timestamp: Date.now()
      }));
    };

    if (localStorage.getItem('authToken')) {
      try {
        const response = await fetch(`${BASE_URL}/api/cart`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        if (response.ok) {
          const cartData = await response.json();
          const items = cartData.items || [];
          saveCartToLocalStorage(items);
          return items;
        }
      } catch (error) {
        console.error('Eroare preluare coș:', error);
      }
    }
    
    // Încarcă din localStorage dacă există
    const snapshot = localStorage.getItem('cartSnapshot');
    if (snapshot) {
      try {
        const data = JSON.parse(snapshot);
        
        // Verifică dacă snapshot-ul este învechit (mai vechi de 1 oră)
        if (Date.now() - data.timestamp > 3600000) {
          localStorage.removeItem('cartSnapshot');
          return [];
        }
        
        return data.items || [];
      } catch (e) {
        console.error('Eroare parsare cartSnapshot:', e);
        return [];
      }
    }
    
    return [];
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
    document.dispatchEvent(new Event('cartUpdated'));
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
    document.dispatchEvent(new Event('cartUpdated'));
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
    document.dispatchEvent(new Event('cartUpdated'));
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