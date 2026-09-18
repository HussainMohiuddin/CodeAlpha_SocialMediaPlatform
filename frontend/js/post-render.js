function avatarHtml(user, size) {
  const cls = size === 'lg' ? 'avatar avatar-lg' : size === 'sm' ? 'avatar avatar-sm' : 'avatar';
  const color = (user && user.avatarColor) || '#2f6fed';
  const label = initials(user && user.name);
  return `<div class="${cls}" style="background:${color}">${label}</div>`;
}

function renderPostCard(post) {
  const user = getUser();
  const isOwner = user && post.author && user.id === (post.author.id || post.author._id || post.author);
  const authorUsername = post.author.username;
  const authorName = escapeHtml(post.author.name);

  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        ${avatarHtml(post.author)}
        <div>
          <div class="post-author-name"><a href="profile.html?username=${encodeURIComponent(authorUsername)}">${authorName}</a></div>
          <div class="post-meta">@${escapeHtml(authorUsername)} · ${timeAgo(post.createdAt)}</div>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      <div class="post-actions">
        <button class="action-btn ${post.liked ? 'liked' : ''}" data-action="toggle-like" data-id="${post.id}">
          ${post.liked ? '♥' : '♡'} <span data-like-count>${post.likeCount}</span>
        </button>
        <button class="action-btn" data-action="toggle-comments" data-id="${post.id}">
          💬 <span data-comment-count>${post.commentCount}</span>
        </button>
        ${isOwner ? `<button class="action-btn" data-action="delete-post" data-id="${post.id}">🗑 Delete</button>` : ''}
      </div>
      <div class="comments-section" data-comments-for="${post.id}" hidden>
        <div data-comments-list></div>
        ${
          user
            ? `<form class="comment-form" data-comment-form="${post.id}">
                 <input type="text" class="input" placeholder="Write a comment..." maxlength="500" required />
                 <button type="submit" class="btn btn-sm">Post</button>
               </form>`
            : `<p class="muted"><a href="login.html">Log in</a> to comment.</p>`
        }
      </div>
    </div>
  `;
}

function renderCommentRow(comment) {
  return `
    <div class="comment-row">
      ${avatarHtml(comment.author, 'sm')}
      <div class="comment-bubble">
        <div class="comment-author">
          <a href="profile.html?username=${encodeURIComponent(comment.author.username)}">${escapeHtml(comment.author.name)}</a>
        </div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
      </div>
    </div>
  `;
}

function bindPostInteractions(container) {
  container.addEventListener('click', async (e) => {
    const likeBtn = e.target.closest('[data-action="toggle-like"]');
    const commentToggle = e.target.closest('[data-action="toggle-comments"]');
    const deleteBtn = e.target.closest('[data-action="delete-post"]');

    if (likeBtn) {
      if (!getUser()) {
        window.location.href = 'login.html';
        return;
      }
      const id = likeBtn.dataset.id;
      try {
        const { post } = await apiRequest(`/posts/${id}/like`, { method: 'POST' });
        likeBtn.classList.toggle('liked', post.liked);
        likeBtn.innerHTML = `${post.liked ? '♥' : '♡'} <span data-like-count>${post.likeCount}</span>`;
      } catch (err) {
        alert(err.message);
      }
    }

    if (commentToggle) {
      const id = commentToggle.dataset.id;
      const section = container.querySelector(`[data-comments-for="${id}"]`);
      if (!section) return;
      const willShow = section.hidden;
      section.hidden = !willShow;
      if (willShow && !section.dataset.loaded) {
        section.dataset.loaded = '1';
        const list = section.querySelector('[data-comments-list]');
        list.innerHTML = '<p class="muted">Loading comments...</p>';
        try {
          const { comments } = await apiRequest(`/posts/${id}/comments`);
          list.innerHTML = comments.length
            ? comments.map(renderCommentRow).join('')
            : '<p class="muted">No comments yet. Be the first!</p>';
        } catch (err) {
          list.innerHTML = `<p class="error-box">${escapeHtml(err.message)}</p>`;
        }
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (!confirm('Delete this post?')) return;
      try {
        await apiRequest(`/posts/${id}`, { method: 'DELETE' });
        const card = container.querySelector(`[data-post-id="${id}"]`);
        if (card) card.remove();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  container.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-comment-form]');
    if (!form) return;
    e.preventDefault();

    const id = form.dataset.commentForm;
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;

    try {
      await apiRequest(`/posts/${id}/comments`, { method: 'POST', body: { text } });
      input.value = '';

      const section = container.querySelector(`[data-comments-for="${id}"]`);
      const list = section.querySelector('[data-comments-list]');
      const { comments } = await apiRequest(`/posts/${id}/comments`);
      list.innerHTML = comments.map(renderCommentRow).join('');

      const card = container.querySelector(`[data-post-id="${id}"]`);
      const countEl = card.querySelector('[data-comment-count]');
      countEl.textContent = String(parseInt(countEl.textContent, 10) + 1);
    } catch (err) {
      alert(err.message);
    }
  });
}
