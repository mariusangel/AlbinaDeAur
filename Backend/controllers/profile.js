// profile.js
document.addEventListener('DOMContentLoaded', () => {
  // Verifică dacă utilizatorul este autentificat
  const auth = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUser: () => JSON.parse(localStorage.getItem('userData'))
  };

  if (!auth.isLoggedIn()) {
    window.location.href = '/index.html';
    return;
  }

  const user = auth.getUser();
  document.getElementById('profile-name').textContent = user?.name || '-';
  document.getElementById('profile-email').textContent = user?.email || '-';
  document.getElementById('profile-reg-date').textContent = user?.regDate || '-';

  document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    window.location.href = '/index.html';
  });

  document.querySelector('.edit-profile-btn').addEventListener('click', () => {
      alert('Funcționalitate în dezvoltare!');
  });
});