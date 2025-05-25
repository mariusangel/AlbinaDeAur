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
  const notification = document.createElement('div');
  notification.className = `cart-notification ${type}`;
  notification.innerHTML = `
    <i class='bx ${type === 'success' ? 'bxs-check-circle' : 'bxs-error-alt'}'></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}