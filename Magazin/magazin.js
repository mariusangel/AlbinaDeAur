import { BASE_URL } from '../js/config.js';

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

    // Gestionare tastatură pentru input
    searchInput.addEventListener('keydown', (e) => {
      const visibleSuggestions = document.querySelectorAll('.suggestion-item');
      
      if (e.key === 'ArrowDown' && visibleSuggestions.length > 0) {
        e.preventDefault();
        visibleSuggestions[0].focus();
      } else if (e.key === 'Escape') {
        searchSuggestions.style.display = 'none';
      }
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
  const response = await fetch(`${BASE_URL}/api/products`);
  if (!response.ok) throw new Error('Eroare preluare produse');
  return await response.json();
}

function renderProducts(products) {
  const container = document.querySelector('.product-grid');

  if (!container) {
    console.error('Eroare: Containerul .product-grid nu a fost găsit în DOM');
    return;
  }
  container.innerHTML = '';

  products.forEach(product => {
    const item = document.createElement('div');
    item.classList.add('product-item');
    item.dataset.id = product._id;
    item.dataset.name = product.name;
    item.dataset.price = product.price;
    item.dataset.stock = product.stock;

    // Verificăm stocul și generăm conținut diferit
    const isOutOfStock = product.stock <= 0;
    const stockIndicator = isOutOfStock ? 
      '<div class="out-of-stock">Stoc epuizat</div>' : 
      '';
    
    const addToCartButton = isOutOfStock ?
      '<button class="add-to-cart" disabled>Adaugă în Coș</button>' :
      '<button class="add-to-cart">Adaugă în Coș</button>';

    item.innerHTML = `
      <a href="/Magazin/produs.html?id=${product._id}" class="product-link">
        <img src="${product.image}" alt="${product.name}">
        ${stockIndicator}
        <h3>${product.name}</h3>
        <p class="price">${product.price} RON</p>
      </a>
      <div class="overlay">
        ${addToCartButton}
      </div>
    `;

    container.appendChild(item);
  });

  productItems = document.querySelectorAll('.product-item');
}

function filterProducts(searchText) {
  const suggestions = [];
  searchText = searchText.toLowerCase();

  loadedProducts.forEach(product => {
    const productName = product.name.toLowerCase();
    const productCategory = (product.category || '').toLowerCase();
    
    if (productName.includes(searchText)) {
      suggestions.push({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock || 0,
        link: `/Magazin/produs.html?id=${product._id}`
      });
    }
  });

  suggestions.sort((a, b) => {
    const aExactMatch = a.name.toLowerCase().startsWith(searchText);
    const bExactMatch = b.name.toLowerCase().startsWith(searchText);
    
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    
    return a.name.localeCompare(b.name);
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
  renderProducts(filteredProducts);
}

function showSuggestions(suggestions) {
  searchSuggestions.innerHTML = '';

  if (suggestions.length === 0) {
    const noResults = document.createElement('div');
    noResults.classList.add('suggestion-item', 'no-results');
    noResults.innerHTML = `
      <i class='bx bx-search-alt'></i>
      <span>Nu s-au găsit produse</span>
    `;
    searchSuggestions.appendChild(noResults);
    searchSuggestions.style.display = 'block';
    return;
  }

  suggestions.forEach(suggestion => {
    const suggestionItem = document.createElement('div');
    suggestionItem.classList.add('suggestion-item');
    
    // Adăugare clasă pentru stoc redus
    if (suggestion.stock > 0 && suggestion.stock < 10) {
      suggestionItem.classList.add('low-stock');
    }
    
    // Adăugare clasă pentru stoc epuizat
    if (suggestion.stock === 0) {
      suggestionItem.classList.add('out-of-stock');
    }
    
    suggestionItem.innerHTML = `
      <img src="${suggestion.image}" alt="${suggestion.name}" class="suggestion-image">
      <div class="suggestion-info">
        <div class="suggestion-name">${suggestion.name}</div>
        <div class="suggestion-price">${suggestion.price} RON</div>
        <div class="suggestion-meta">
          <span class="suggestion-category">${suggestion.category}</span>
          <span class="suggestion-stock">
            ${suggestion.stock > 0 ? 
              `${suggestion.stock} bucăți în stoc` : 
              'Stoc epuizat'}
          </span>
        </div>
      </div>
    `;

    // Facem elementul focusabil și adăugăm gestionarea tastelor
    suggestionItem.setAttribute('tabindex', '0');
    suggestionItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.location.href = suggestion.link;
        searchSuggestions.style.display = 'none';
      } else if (e.key === 'Escape') {
        searchInput.focus();
        searchSuggestions.style.display = 'none';
      }
    });
    
    // Navigare cu săgețile în listă
    suggestionItem.addEventListener('keydown', (e) => {
      const allSuggestions = Array.from(document.querySelectorAll('.suggestion-item'));
      const currentIndex = allSuggestions.indexOf(e.currentTarget);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % allSuggestions.length;
        allSuggestions[nextIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + allSuggestions.length) % allSuggestions.length;
        allSuggestions[prevIndex].focus();
      }
    });

    suggestionItem.addEventListener('click', () => {
      window.location.href = suggestion.link;
      searchSuggestions.style.display = 'none';
    });

    searchSuggestions.appendChild(suggestionItem);
  });

  searchSuggestions.style.display = 'block';
}