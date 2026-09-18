function getUsernameParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('username');
}

function renderProfileHeader(profile) {
  const mount = document.getElementById('profile-header');
  const currentUser = getUser();
  const isOwnProfile = currentUser && currentUser.username === profile.username;

  mount.innerHTML = `
    <div class="profile-header">
      ${avatarHtml(profile, 'lg')}
      <div>
        <h1 style="margin-bottom:2px;">${escapeHtml(profile.name)}</h1>
        <div class="muted">@${escapeHtml(profile.username)}</div>
        ${profile.bio ? `<p style="margin:10px 0 0;">${escapeHtml(profile.bio)}</p>` : ''}
        <div class="profile-stats">
          <div class="profile-stat"><strong>${profile.followerCount}</strong><span>Followers</span></div>
          <div class="profile-stat"><strong>${profile.followingCount}</strong><span>Following</span></div>
        </div>
      </div>
      <div class="profile-actions">
        ${
          isOwnProfile
            ? `<button id="edit-profile-btn" class="btn btn-outline">Edit profile</button>`
            : currentUser
              ? `<button id="follow-btn" class="btn ${profile.isFollowing ? 'btn-follow-active' : ''}" data-username="${escapeHtml(profile.username)}">
                   ${profile.isFollowing ? 'Following' : 'Follow'}
                 </button>`
              : `<a href="login.html" class="btn">Follow</a>`
        }
      </div>
    </div>
  `;

  if (isOwnProfile) {
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      renderEditForm(profile);
    });
  } else {
    const followBtn = document.getElementById('follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        followBtn.disabled = true;
        try {
          const { user: updated } = await apiRequest(`/users/${profile.username}/follow`, { method: 'POST' });
          profile.isFollowing = updated.isFollowing;
          profile.followerCount = updated.followerCount;
          renderProfileHeader(profile);
        } catch (err) {
          alert(err.message);
          followBtn.disabled = false;
        }
      });
    }
  }
}

function renderEditForm(profile) {
  const mount = document.getElementById('edit-form-mount');
  mount.innerHTML = `
    <form id="edit-profile-form" class="form" style="max-width:480px;">
      <label for="edit-name">Full name</label>
      <input type="text" id="edit-name" value="${escapeHtml(profile.name)}" required />

      <label for="edit-bio">Bio</label>
      <textarea id="edit-bio" class="input" maxlength="200" rows="3">${escapeHtml(profile.bio || '')}</textarea>

      <label for="edit-color">Avatar color</label>
      <input type="color" id="edit-color" value="${profile.avatarColor || '#2f6fed'}" style="height:42px; padding:4px;" />

      <div style="display:flex; gap:10px; margin-top:20px;">
        <button type="submit" class="btn">Save changes</button>
        <button type="button" id="cancel-edit" class="btn btn-secondary">Cancel</button>
      </div>
      <div id="edit-message"></div>
    </form>
  `;

  document.getElementById('cancel-edit').addEventListener('click', () => {
    mount.innerHTML = '';
  });

  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('edit-message');
    try {
      const { user: updated } = await apiRequest('/users/me/profile', {
        method: 'PUT',
        body: {
          name: document.getElementById('edit-name').value.trim(),
          bio: document.getElementById('edit-bio').value.trim(),
          avatarColor: document.getElementById('edit-color').value,
        },
      });

      const session = getUser();
      session.name = updated.name;
      localStorage.setItem('user', JSON.stringify(session));

      mount.innerHTML = '';
      renderProfileHeader(updated);
      renderNav();
    } catch (err) {
      messageEl.innerHTML = `<p class="error-box">${escapeHtml(err.message)}</p>`;
    }
  });
}

async function loadProfile() {
  const username = getUsernameParam();
  const statusEl = document.getElementById('status-message');

  if (!username) {
    statusEl.textContent = 'No user specified.';
    return;
  }

  statusEl.textContent = 'Loading profile...';

  try {
    const { user: profile } = await apiRequest(`/users/${username}`);
    statusEl.textContent = '';
    renderProfileHeader(profile);

    const { posts } = await apiRequest(`/users/${username}/posts`);
    const postsMount = document.getElementById('user-posts');
    postsMount.innerHTML = posts.length
      ? posts.map(renderPostCard).join('')
      : '<p class="muted">No posts yet.</p>';
    bindPostInteractions(postsMount);
  } catch (err) {
    statusEl.textContent = `Failed to load profile: ${err.message}`;
  }
}

loadProfile();
