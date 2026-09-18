document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById('form-message');
  messageEl.innerHTML = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { user, token } = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setSession(token, user);
    window.location.href = 'index.html';
  } catch (err) {
    messageEl.innerHTML = `<p class="error-box">${escapeHtml(err.message)}</p>`;
  }
});
