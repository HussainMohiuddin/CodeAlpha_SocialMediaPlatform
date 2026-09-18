document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById('form-message');
  messageEl.innerHTML = '';

  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { user, token } = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, username, email, password },
    });
    setSession(token, user);
    window.location.href = 'index.html';
  } catch (err) {
    messageEl.innerHTML = `<p class="error-box">${escapeHtml(err.message)}</p>`;
  }
});
