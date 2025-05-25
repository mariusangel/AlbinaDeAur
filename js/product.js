import { showError } from "./utils.JS";

export async function fetchProduct(id) {
  const response = await fetch(`http://localhost:3000/api/products/${id}`);
  if (!response.ok) throw new Error('Eroare preluare produs');
  return await response.json();
}

export function renderProductDetails(product) {
  // Populează detaliile produsului în pagină
  document.getElementById('product-image').src = product.image;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-price').textContent = `Pret: ${product.price}`;
  document.getElementById('product-category').textContent = product.category;
  document.getElementById('product-tag').textContent = product.tag;
  
  // Starea stocului
  const stockStatus = document.getElementById('stock-status');
  if (product.stock > 0) {
    stockStatus.innerHTML = '<span class="in-stock">In stoc</span>';
    stockStatus.style.color = 'green';
  } else {
    stockStatus.innerHTML = '<span class="out-of-stock">Stoc epuizat</span>';
    stockStatus.style.color = 'red';
  }

  // Detalii extinse
  const detailedDescriptionContainer = document.getElementById('detailed-description');
  if (product.detailedDescription) {
    detailedDescriptionContainer.innerHTML = product.detailedDescription
      .map((section, index) => `
        <div class="description-section ${index % 2 === 0 ? 'even' : 'odd'}">
          <img src="${section.image}" alt="Imagine ${index + 1}" class="description-image">
          <p>${section.text}</p>
        </div>
      `).join('');
  } else {
    detailedDescriptionContainer.innerHTML = "<p>Nu există descriere detaliată disponibilă pentru acest produs.</p>";
  }

  // Specificații (dacă există)
  if (product.specifications) {
    const specsContainer = document.getElementById('specs-data');
    specsContainer.innerHTML = Object.entries(product.specifications)
      .map(([label, value]) => `
        <div class="specs-item">
          <span class="specs-label">${label}</span>
          <span class="specs-value">${value}</span>
        </div>
      `).join('');
  }
  
  // Valori nutriționale (dacă există)
  if (product.nutritionalValues) {
    const nutritionContainer = document.getElementById('nutrition-data');
    nutritionContainer.innerHTML = Object.entries(product.nutritionalValues)
      .map(([label, value]) => `
        <div class="nutrition-item">
          <span class="nutrition-label">${label}</span>
          <span class="nutrition-value">${value}</span>
        </div>
      `).join('');
  }
}

export function setupEventListeners(product) {
  // Selectorul de cantitate
  const minusBtn = document.getElementById('minus-btn');
  const plusBtn = document.getElementById('plus-btn');
  const quantityInput = document.getElementById('quantity-input');

  minusBtn.addEventListener('click', () => {
    let currentQuantity = parseInt(quantityInput.value) || 1;
    if (currentQuantity > 1) {
      quantityInput.value = currentQuantity - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
    let currentQuantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = currentQuantity + 1;
  });

  // Adăugare în coș
  const addToCartBtn = document.getElementById('add-to-cart');
  addToCartBtn.addEventListener('click', event => {
    event.preventDefault();
    const selectedQuantity = parseInt(quantityInput.value) || 1;
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    };
    window.addToCart(productToAdd, selectedQuantity);
    alert("Produsul a fost adăugat în coș!");
  });

  // Favorit
  document.getElementById("add-to-favorites").addEventListener("click", function() {
    this.classList.toggle("favorited");
    if (this.classList.contains("favorited")) {
      console.log("Produsul a fost adăugat la favorite.");
    } else {
      console.log("Produsul a fost eliminat din favorite.");
    }
  });

  // Evenimente pentru tab-uri
  const tabs = document.querySelectorAll('.product-tabs .tabs li');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const contents = document.querySelectorAll('.product-tabs .tab-content, .product-tabs .tab-content-active');
      contents.forEach(content => {
        content.classList.remove('tab-content-active');
        content.style.display = 'none';
      });

      const selectedContent = document.getElementById(tab.getAttribute('data-tab'));
      if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('tab-content-active');
      }
    });
  });

  // Fullscreen imagine produs
  const productImage = document.getElementById('product-image');
  productImage.addEventListener('click', () => {
    const fullScreenDiv = document.createElement('div');
    fullScreenDiv.style.position = 'fixed';
    fullScreenDiv.style.top = '0';
    fullScreenDiv.style.left = '0';
    fullScreenDiv.style.width = '100vw';
    fullScreenDiv.style.height = '100vh';
    fullScreenDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    fullScreenDiv.style.display = 'flex';
    fullScreenDiv.style.alignItems = 'center';
    fullScreenDiv.style.justifyContent = 'center';
    fullScreenDiv.style.zIndex = '1000';
    fullScreenDiv.style.cursor = 'pointer';

    const fullScreenImage = document.createElement('img');
    fullScreenImage.src = productImage.src;
    fullScreenImage.style.maxWidth = '90%';
    fullScreenImage.style.maxHeight = '90%';
    fullScreenImage.style.borderRadius = '8px';

    fullScreenDiv.appendChild(fullScreenImage);
    document.body.appendChild(fullScreenDiv);

    fullScreenDiv.addEventListener('click', () => {
      document.body.removeChild(fullScreenDiv);
    });
  });

  // Alte funcționalități (ex: slider pentru produse similare) se pot integra similar
}

export function showProductError(message) {
  document.getElementById('product-details').innerHTML = `<p>${message}</p>`;
}
