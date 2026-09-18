function renderNav() {
  const mount = document.getElementById('nav-placeholder');
  if (!mount) return;

  const user = getUser();

  mount.innerHTML = `
    <nav class="navbar">
      <a class="brand" href="index.html">⭘ Circle</a>
      <div class="nav-links">
        <a href="index.html">Feed</a>
        ${
          user
            ? `<a href="profile.html?username=${encodeURIComponent(user.username)}">My Profile</a>
               <button id="logout-btn" class="link-btn">Logout</button>`
            : `<a href="login.html">Login</a>
               <a href="register.html">Register</a>`
        }
      </div>
    </nav>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
