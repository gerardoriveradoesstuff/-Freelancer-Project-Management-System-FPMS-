document.addEventListener('DOMContentLoaded', async () => {
  try {
    const stored = localStorage.getItem('fpms_user');
    const user = stored ? JSON.parse(stored) : null;
    const BASE = location.origin.startsWith('http') ? '' : 'http://localhost:5000';
    if (!user) { location.href = `${BASE}/login.html`; return; }

    const badge = document.querySelector('.user-badge');
    if (badge) badge.innerHTML = `<span class="avatar"></span>${user.fullName} • ${user.role}`;

    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navDashboard = document.getElementById('nav-dashboard');
    const navLogout = document.getElementById('nav-logout');
    if (navLogin) navLogin.style.display = 'none';
    if (navRegister) navRegister.style.display = 'none';
    if (navDashboard) navDashboard.style.display = 'none';
    if (navLogout) {
      navLogout.style.display = '';
      navLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('fpms_user');
        location.href = `${BASE}/login.html`;
      });
    }

    const resUser = await fetch(`${BASE}/api/demo/user/${user.id}`);
    const data = await resUser.json();
    const resUsers = await fetch(`${BASE}/api/demo/query/users`);
    const users = await resUsers.json();
    const nameById = new Map();
    (users || []).forEach(u => nameById.set(u.Id, u.FullName));

    const projById = new Map();
    (data.projects || []).forEach(p => projById.set(p.Id, p.Title));

    const messagesList = document.getElementById('messages-list');
    if (messagesList) {
      messagesList.innerHTML = (data.messages || [])
        .map(m => {
          const fromName = m.sender_id === user.id ? 'You' : (nameById.get(m.sender_id) || `User ${m.sender_id}`);
          const toName = m.receiver_id === user.id ? 'You' : (nameById.get(m.receiver_id) || `User ${m.receiver_id}`);
          const project = projById.get(m.project_id) || 'Direct';
          const readBadge = m.is_read ? 'status-active' : 'status-pending';
          const readText = m.is_read ? 'read' : 'unread';
          return `<li class="list-item">
            <span>${m.Content}</span>
            <span class="meta">${fromName} → ${toName} • ${project} • ${m.Sent_at || ''}</span>
            <span class="status-badge ${readBadge}" style="margin-left:8px;">${readText}</span>
          </li>`;
        })
        .join('');
    }
  } catch (e) {}
});
