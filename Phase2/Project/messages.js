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

<<<<<<< HEAD
    const resUser = await fetch(`${BASE}/api/users/${user.id}/dashboard`);
=======
    const resUser = await fetch(`${BASE}/api/demo/user/${user.id}`);
>>>>>>> origin/main
    const data = await resUser.json();
    const resUsers = await fetch(`${BASE}/api/demo/query/users`);
    const users = await resUsers.json();
    const nameById = new Map();
    (users || []).forEach(u => nameById.set(u.Id, u.FullName));

<<<<<<< HEAD
    const contactsList = document.getElementById('contacts-list');
    const conversationTitle = document.getElementById('conversation-title');
    const conversationList = document.getElementById('conversation-list');

    const messages = (data.messages || []).slice();
    const contactsMap = new Map();
    messages.forEach(m => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!otherId) return;
      const name = nameById.get(otherId) || `User ${otherId}`;
      const existing = contactsMap.get(otherId);
      const ts = new Date(m.Sent_at || 0).getTime();
      if (!existing) contactsMap.set(otherId, { id: otherId, name, last: ts });
      else existing.last = Math.max(existing.last, ts);
    });

    const contacts = Array.from(contactsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    let selectedContactId = contacts.length ? contacts[0].id : null;
    let currentConversationProjectId = null;
    function renderContacts() {
      if (!contactsList) return;
      contactsList.innerHTML = contacts.map(c => `<li class="list-item">
        <a href="#" class="contact-link" data-contact-id="${c.id}">${c.name}</a>
      </li>`).join('');
      Array.from(document.querySelectorAll('.contact-link')).forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          selectedContactId = Number(a.getAttribute('data-contact-id'));
          renderConversation();
        });
      });
    }

    function renderConversation() {
      if (!conversationList) return;
      const name = nameById.get(selectedContactId) || `User ${selectedContactId}`;
      if (conversationTitle) conversationTitle.textContent = `Conversation with ${name}`;
      const conv = messages
        .filter(m => (m.sender_id === user.id && m.receiver_id === selectedContactId) || (m.receiver_id === user.id && m.sender_id === selectedContactId))
        .sort((a, b) => new Date(a.Sent_at || 0) - new Date(b.Sent_at || 0));
      currentConversationProjectId = conv.length ? (conv[conv.length - 1].project_id ?? null) : null;
      conversationList.innerHTML = conv.map(m => {
        const mine = m.sender_id === user.id;
        const align = mine ? 'text-right' : 'text-left';
        const who = mine ? 'You' : (nameById.get(m.sender_id) || `User ${m.sender_id}`);
        const profileUserId = mine ? m.receiver_id : m.sender_id;
        const profileBtn = profileUserId ? `<a class="btn btn-secondary border border-brand text-brand hover:bg-brandLight" href="profile.html?user=${profileUserId}" style="margin-left:8px;">View Profile</a>` : '';
        return `<li class="list-item ${align}">
          <div><span class="meta">${who} • ${m.Sent_at || ''}</span></div>
          <div>${m.Content}</div>
          <div class="mt-1">${profileBtn}</div>
        </li>`;
      }).join('');
    }

    renderContacts();
    renderConversation();

    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn && messageInput) {
      sendMessageBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content) return;
        let targetId = selectedContactId;
        if (!targetId) {
          const last = messages[messages.length - 1];
          if (last) targetId = last.sender_id === user.id ? last.receiver_id : last.sender_id;
        }
        if (!targetId) return;
        const resp = await fetch(`${BASE}/api/messages/simple/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: user.id, receiverId: Number(targetId), projectId: currentConversationProjectId, content })
        });
        if (!resp.ok) {
          try { const err = await resp.json(); alert(err.message || 'Send failed'); } catch { alert('Send failed'); }
          return;
        }
        try {
          const resUser2 = await fetch(`${BASE}/api/users/${user.id}/dashboard`);
          const data2 = await resUser2.json();
          messages.length = 0; messages.push(...(data2.messages || []));
        } catch {}
        messageInput.value = '';
        renderConversation();
      });
      messageInput.addEventListener('keydown', async (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessageBtn.click(); } });
=======
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
>>>>>>> origin/main
    }
  } catch (e) {}
});
