export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Dacă folosești Axios
}

export function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.querySelector('.wrapper').prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Funcție pentru afișare notificare
export function showCartNotification(message, type = 'success') {
  // Creează elementul notificare
  const notification = document.createElement('div');
  notification.className = `cart-notification ${type}`;
  notification.textContent = message;
  
  // Adaugă în DOM
  document.body.appendChild(notification);
  
  // Animatie intrare
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Șterge după 3 secunde
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}