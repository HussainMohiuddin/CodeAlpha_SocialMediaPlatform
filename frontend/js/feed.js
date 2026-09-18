function renderComposer() {
  const mount = document.getElementById('composer-mount');
  const user = getUser();
  if (!user) {
    mount.innerHTML = `<div class="composer"><p class="muted">Please <a href="login.html">log in</a> to share something with Circle.</p></div>`;
    return;
  }

  mount.innerHTML = `
    <form id="composer-form" class="composer">
      ${avatarHtml(user)}
      <div style="flex:1;">
        <textarea id="composer-text" class="input" placeholder="What's on your mind, ${escapeHtml(user.name.split(' ')[0])}?" maxlength="1000" required></textarea>
        <div class="composer-footer">
          <button type="submit" class="btn">Post</button>
        </div>
      </div>
    </form>
  `;

  document.getElementById('composer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const textarea = document.getElementById('composer-text');
    const content = textarea.value.trim();
    if (!content) return;

    try {
      const { post } = await apiRequest('/posts', { method: 'POST', body: { content } });
      textarea.value = '';
      const feed = document.getElementById('feed');
      feed.insertAdjacentHTML('afterbegin', renderPostCard(post));
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadFeed() {
  const statusEl = document.getElementById('status-message');
  const feed = document.getElementById('feed');
  statusEl.textContent = 'Loading feed...';

  try {
    const { posts } = await apiRequest('/posts');
    statusEl.textContent = '';
    feed.innerHTML = posts.length
      ? posts.map(renderPostCard).join('')
      : '<p class="muted">No posts yet. Be the first to share something!</p>';
  } catch (err) {
    statusEl.textContent = `Failed to load feed: ${err.message}`;
  }
}

renderComposer();
loadFeed();
bindPostInteractions(document.getElementById('feed'));
