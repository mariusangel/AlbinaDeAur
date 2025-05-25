// document.addEventListener('DOMContentLoaded', () => {
//   const cart = JSON.parse(localStorage.getItem('cart')) || [];
//   const cartItemsContainer = document.querySelector('.cart-items');
//   const totalPriceElement = document.getElementById('total-price');
//   const backToShopButton = document.getElementById('back-to-shop-btn');

//   function displayCartItems() {
//     // Golește containerul
//     cartItemsContainer.innerHTML = '';

//     if (cart.length === 0) {
//       cartItemsContainer.innerHTML = '<tr><td colspan="5">Coșul este gol.</td></tr>';
//       totalPriceElement.textContent = '0 Ron';
//       return;
//     }

//     // Parcurgem fiecare produs din coș
//     cart.forEach((item, index) => {
//       const row = document.createElement('tr');
      
//       const priceValue = parseFloat(item.price.replace('RON', '').trim());
//       const totalValue = (priceValue * item.quantity).toFixed(2);

//       row.innerHTML = `
//         <td><img src="${item.image}" alt="${item.name}" class="cart-item-image"></td>
//         <td>${item.name}</td>
//         <td>${item.price}</td>
//         <td>
//           <div class="quantity-selector">
//             <button class="minus-btn" data-index="${index}">-</button>
//             <input type="number" min="1" class="quantity-input" data-index="${index}" value="${item.quantity}">
//             <button class="plus-btn" data-index="${index}">+</button>
//           </div>
//         </td>
//         <td>${totalValue} RON</td>
//         <td><button class="delete-btn" data-index="${index}">x</button></td>
//       `;

//       cartItemsContainer.appendChild(row);
//     });

//     const total = cart.reduce((sum, item) => {
//       const priceValue = parseFloat(item.price.replace('RON', '').trim());
//       return sum + (priceValue * item.quantity);
//     }, 0);

//     totalPriceElement.textContent = `${total.toFixed(2)} RON`;
//   }

//   displayCartItems();

//   cartItemsContainer.addEventListener('click', (e) => {
//     const index = e.target.getAttribute('data-index');

//     if (e.target && e.target.classList.contains('delete-btn')) {
//       cart.splice(index, 1);
//       localStorage.setItem('cart', JSON.stringify(cart));
//       displayCartItems();
//     }else if (e.target && e.target.classList.contains('plus-btn')) {
//       cart[index].quantity++;
//       localStorage.setItem('cart', JSON.stringify(cart));
//       displayCartItems();
//     }else if (e.target && e.target.classList.contains('minus-btn')) {
//       if (cart[index].quantity > 1) {
//         cart[index].quantity--;
//         localStorage.setItem('cart', JSON.stringify(cart));
//         displayCartItems();
//       }
//     }
//   });

//   cartItemsContainer.addEventListener('change', (e) => {
//     if (e.target.classList.contains('quantity-input')){
//       const index = e.target.getAttribute('data-index');
//       let newQuantity = parseInt(e.target.value);
//       if (isNaN(newQuantity) || newQuantity < 1) {
//         newQuantity = 1;
//       }
//       cart[index].quantity = newQuantity;
//       localStorage.setItem('cart', JSON.stringify(cart));
//       displayCartItems();
//     }
//   })

//   if (backToShopButton) {
//     backToShopButton.addEventListener('click', () => {
//       window.location.href = 'magazin.html'; // Redirecționează către magazin
//     });
//   }

//   displayCartItems();
// });

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const backToShopButton = document.getElementById('back-to-shop-btn');
    const checkoutButton = document.querySelector('.checkout-btn');

    // Funcție pentru obținerea coșului (autentificat sau nu)
    async function getCart() {
      if (localStorage.getItem('authToken')) {
        try {
          const response = await fetch('http://localhost:3000/api/cart', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const cart = await response.json();
            return cart.items || [];
          }
        } catch (error) {
          console.error('Eroare preluare coș:', error);
        }
      }
      
      // Dacă nu e autentificat sau e eroare, returnăm coșul din localStorage
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
    }

    // Funcție pentru a afișa produsele din coș
    async function displayCartItems() {
      const cartItems = await getCart();
      cartItemsContainer.innerHTML = '';

      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="5">Coșul este gol.</td></tr>';
        totalPriceElement.textContent = '0 RON';
        return;
      }

      cartItems.forEach((item, index) => {
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

      // Calculăm totalul
      const total = cartItems.reduce((sum, item) => {
        const priceValue = typeof item.product.price === 'string' 
          ? parseFloat(item.product.price.replace('RON', '').trim())
          : item.product.price;
        return sum + (priceValue * item.quantity);
      }, 0);

      totalPriceElement.textContent = `${total.toFixed(2)} RON`;
    }

    // Funcție pentru actualizare cantitate
    async function updateQuantity(productId, newQuantity) {
      if (localStorage.getItem('authToken')) {
        // Autentificat - actualizăm în backend
        try {
          const response = await fetch(`http://localhost:3000/api/cart/${productId}`, {
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
        // Neautentificat - actualizăm în localStorage
        let tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        const itemIndex = tempCart.findIndex(item => item.id === productId);
        
        if (itemIndex >= 0) {
          tempCart[itemIndex].quantity = newQuantity;
          localStorage.setItem('tempCart', JSON.stringify(tempCart));
        }
      }
      
      await displayCartItems();
      window.updateCartDisplay();
    }

    // Funcție pentru ștergere produs
    async function deleteItem(productId) {
      if (localStorage.getItem('authToken')) {
        // Autentificat - ștergem din backend
        try {
          const response = await fetch(`http://localhost:3000/api/cart/${productId}`, {
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
        // Neautentificat - ștergem din localStorage
        let tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
        tempCart = tempCart.filter(item => item.id !== productId);
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
      }
      
      await displayCartItems();
      window.updateCartDisplay();
    }

    // Evenimente pentru butoane
    cartItemsContainer.addEventListener('click', async (e) => {
      const productId = e.target.getAttribute('data-id');
      
      if (e.target.classList.contains('delete-btn')) {
        await deleteItem(productId);
      } else if (e.target.classList.contains('plus-btn')) {
        const input = e.target.parentElement.querySelector('.quantity-input');
        const newQuantity = parseInt(input.value) + 1;
        input.value = newQuantity;
        await updateQuantity(productId, newQuantity);
      } else if (e.target.classList.contains('minus-btn')) {
        const input = e.target.parentElement.querySelector('.quantity-input');
        let newQuantity = parseInt(input.value) - 1;
        if (newQuantity < 1) newQuantity = 1;
        input.value = newQuantity;
        await updateQuantity(productId, newQuantity);
      }
    });

    // Eveniment pentru modificare manuală a cantității
    cartItemsContainer.addEventListener('change', async (e) => {
      if (e.target.classList.contains('quantity-input')) {
        const productId = e.target.getAttribute('data-id');
        let newQuantity = parseInt(e.target.value);
        if (isNaN(newQuantity) || newQuantity < 1) {
          newQuantity = 1;
          e.target.value = 1;
        }
        await updateQuantity(productId, newQuantity);
      }
    });

    // Eveniment pentru butonul de checkout
    checkoutButton.addEventListener('click', () => {
      if (!localStorage.getItem('authToken')) {
        alert('Pentru a finaliza comanda, te rugăm să te autentifici. Produsele din coș vor fi păstrate.');
        document.querySelector('.wrapper').classList.add('active-popup');
        return;
      }
      
      window.location.href = '/checkout.html';
    });

    // Eveniment pentru butonul "Înapoi la magazin"
    if (backToShopButton) {
      backToShopButton.addEventListener('click', () => {
        window.location.href = 'magazin.html';
      });
    }

    // Inițializare afișare coș
    await displayCartItems();
  } catch (error) {
    console.error('Eroare în inițializarea coșului:', error);
  }
});