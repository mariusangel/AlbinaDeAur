const searchInput = document.querySelector('#searchInput');
const searchSuggestions = document.querySelector('#searchSuggestions');
const searchButton = document.getElementById('searchButton');

let productItems = [];
let loadedProducts = [];
let timeoutId;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Încărcare produse de la backend
    loadedProducts = await fetchProducts();
    renderProducts(loadedProducts);

    // 2. Evenimente pentru căutare
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    searchInput.addEventListener('input', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const searchText = searchInput.value.trim();
        if (searchText.length > 0) {
          const suggestions = filterProducts(searchText);
          showSuggestions(suggestions);
        } else {
          searchSuggestions.style.display = 'none';
        }
      }, 300);
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.search-bar')) {
        searchSuggestions.style.display = 'none';
      }
    });

  } catch (error) {
    console.error('Eroare încărcare magazin:', error);
  }
});

async function fetchProducts() {
  const response = await fetch('http://localhost:3000/api/products');
  if (!response.ok) throw new Error('Eroare preluare produse');
  return await response.json();
}

function renderProducts(products) {
  const container = document.querySelector('.product-list'); // presupunem că aici vor fi produsele
  container.innerHTML = '';

  products.forEach(product => {
    const item = document.createElement('div');
    item.classList.add('product-item');
    item.setAttribute('data-id', product._id);
    item.setAttribute('data-name', product.name);
    item.setAttribute('data-price', product.price);

    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">${product.price} RON</p>
      <a href="/product/${product._id}" class="view-product">Vezi produs</a>
    `;

    item.addEventListener('click', () => {
      window.location.href = `/product/${product._id}`;
    });

    container.appendChild(item);
  });

  productItems = document.querySelectorAll('.product-item'); // actualizăm lista după generare
}

function filterProducts(searchText) {
  const suggestions = [];
  searchText = searchText.toLowerCase();

  productItems.forEach(item => {
    const productName = item.getAttribute('data-name');
    const productImage = item.querySelector('img').src;
    const productLinkElement = item.querySelector('.view-product');
    const productPrice = item.getAttribute('data-price');

    if (productName.toLowerCase().includes(searchText)) {
      suggestions.push({
        name: productName,
        price: productPrice,
        link: productLinkElement.href,
        image: productImage
      });
    }
  });

  return suggestions;
}

function performSearch() {
  const searchText = searchInput.value.trim().toLowerCase();
  productItems.forEach(item => {
    const productName = item.getAttribute('data-name').toLowerCase();
    if (productName.includes(searchText)) {
      item.style.display = 'block';
    }else{
      item.style.display = 'none';
    }
  });
}

function showSuggestions(suggestions) {
  searchSuggestions.innerHTML = '';

  suggestions.forEach(suggestion => {
    const suggestionItem = document.createElement('div');
    suggestionItem.classList.add('suggestion-item');
    
    suggestionItem.innerHTML = `
      <img src="${suggestion.image}" alt="${suggestion.name}" class="suggestion-image">
      <span class="suggestion-name">${suggestion.name}</span>
    `;

    suggestionItem.addEventListener('click', () => {
      window.location.href = suggestion.link;
    });

    searchSuggestions.appendChild(suggestionItem);
  });

  searchSuggestions.style.display = suggestions.length ? 'block' : 'none';
}