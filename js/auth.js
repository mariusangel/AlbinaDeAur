import { showError, showCartNotification } from './utils.js';

const API_URL = 'http://localhost:3000/api/auth';

// Funcție universală pentru autentificare/înregistrare
export async function handleAuth(email, password, name = null, isLogin = true) {
  try {
    const endpoint = isLogin ? 'login' : 'register';
    const body = isLogin ? { email, password } : { name, email, password };

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Eroare la ${isLogin ? 'autentificare' : 'înregistrare'}`);
    }

    const { token, user } = await response.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    showCartNotification(`Bun venit, ${user.name}!`, 'success');
    return true;

  } catch (error) {
    showError(error.message);
    return false;
  }
}

// Actualizează UI-ul în funcție de starea de autentificare
export async function updateAuthUI(wrapper) {
  const token = localStorage.getItem('authToken');
  const profileButton = document.getElementById('profileButton');
  const profileName = document.getElementById('profileName');

  try {
    if (!token) throw new Error('Nu sunteți autentificat');

    const response = await fetch(`${API_URL}/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Token invalid');
    
    const { user } = await response.json();
    profileButton.innerHTML = `<i class='bx bxs-user-check'></i>`;
    profileName.textContent = user.name;
    profileButton.onclick = () => (window.location.href = '/profile.html');

  } catch (error) {
    localStorage.removeItem('authToken');
    profileButton.innerHTML = `<i class='bx bxs-user'></i>`;
    profileName.textContent = '';
    profileButton.onclick = () => wrapper.classList.add('active-popup');
  }
}

// Event listeners pentru formulare (adaugă în HTML id-urile corespunzătoare)
export function initAuthForms() {
  // Login Form
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (await handleAuth(email, password, null, true)) {
      window.location.href = '/profile.html';
    }
  });

  // Register Form
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    if (await handleAuth(email, password, name, false)) {
      document.querySelector('.wrapper').classList.remove('active');
    }
  });
}