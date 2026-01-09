document.addEventListener('DOMContentLoaded', async () => {
  try {
    const stored = localStorage.getItem('fpms_user');
    const viewer = stored ? JSON.parse(stored) : null;
    const BASE = location.origin.startsWith('http') ? '' : 'http://localhost:5000';
    if (!viewer) { location.href = `${BASE}/login.html`; return; }

    const badge = document.querySelector('.user-badge');
    if (badge) badge.innerHTML = `<span class="avatar"></span>${viewer.fullName} • ${viewer.role}`;
    const navLogout = document.getElementById('nav-logout');
    if (navLogout) {
      navLogout.addEventListener('click', (e) => {
        e.preventDefault(); localStorage.removeItem('fpms_user'); location.href = `${BASE}/login.html`;
      });
    }

    const params = new URLSearchParams(location.search);
    const targetId = Number(params.get('user'));
    if (!targetId) return;

    const res = await fetch(`${BASE}/api/users/${targetId}/profile?viewerId=${viewer.id}`);
    const prof = await res.json();

    const profileTitle = document.getElementById('profile-title');
    const userSummary = document.getElementById('user-summary');
    const skillsList = document.getElementById('skills-list');
  const sharedTasks = document.getElementById('shared-tasks');
  const reviewsList = document.getElementById('reviews-list');
  const reviewProject = document.getElementById('review-project');
  const reviewRating = document.getElementById('review-rating');
  const reviewComment = document.getElementById('review-comment');
  const submitReview = document.getElementById('submit-review');

    if (profileTitle) profileTitle.textContent = `Profile: ${prof.user?.FullName || 'User ' + targetId}`;
    if (userSummary) userSummary.innerHTML = `
      <div class="p-3 border border-brand rounded">
        <div><strong>Name:</strong> ${prof.user?.FullName || ''}</div>
        <div><strong>Email:</strong> ${prof.user?.Email || ''}</div>
        <div><strong>Role:</strong> ${prof.user?.Role || ''}</div>
      </div>
    `;
    if (skillsList) skillsList.innerHTML = (prof.skills || []).map(s => `<li class="list-item"><span>${s.Name}</span></li>`).join('');

    const groups = {};
    (prof.shared_tasks || []).forEach(t => {
      const key = `${t.project_id}:${t.project_title}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
  const sections = Object.entries(groups).map(([key, items]) => {
      const projTitle = key.split(':')[1] || 'Project';
      const listHtml = items.map(it => `<li class="list-item"><span>${it.title}</span><span class="status-badge">${it.Status}</span><span class="status-badge">${it.priority}</span></li>`).join('');
      return `<div class="mb-4"><h4 class="mb-2">${projTitle}</h4><ul class="list">${listHtml}</ul></div>`;
    }).join('');
  if (sharedTasks) sharedTasks.innerHTML = sections || '<p>No shared tasks found.</p>';

    const projects = Object.keys(groups).map(k => ({ id: Number(k.split(':')[0]), title: k.split(':')[1] }));
    if (reviewProject) reviewProject.innerHTML = projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('');

    const resRev = await fetch(`${BASE}/api/users/${targetId}/reviews?viewerId=${viewer.id}`);
    const reviews = await resRev.json();
    if (reviewsList) reviewsList.innerHTML = (reviews || []).map(r => `
      <li class="list-item">
        <span>${r.project_title} • ${r.Rating}/5</span>
        <span class="meta">by ${r.reviewer_name} on ${r.Date}</span>
        <div>${r.Comment}</div>
      </li>
    `).join('');

    if (submitReview) {
      submitReview.addEventListener('click', async (e) => {
        e.preventDefault();
        const pid = reviewProject ? Number(reviewProject.value) : 0;
        const rating = reviewRating ? Number(reviewRating.value) : 0;
        const comment = reviewComment ? String(reviewComment.value || '').trim() : '';
        if (!pid || !rating || !comment) return;
        const resp = await fetch(`${BASE}/api/users/${targetId}/reviews`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewerId: viewer.id, projectId: pid, rating, comment })
        });
        if (!resp.ok) {
          try { const err = await resp.json(); alert(err.message || 'Submit failed'); } catch { alert('Submit failed'); }
          return;
        }
        const resRev2 = await fetch(`${BASE}/api/users/${targetId}/reviews?viewerId=${viewer.id}`);
        const reviews2 = await resRev2.json();
        if (reviewsList) reviewsList.innerHTML = (reviews2 || []).map(r => `
          <li class="list-item">
            <span>${r.project_title} • ${r.Rating}/5</span>
            <span class="meta">by ${r.reviewer_name} on ${r.Date}</span>
            <div>${r.Comment}</div>
          </li>
        `).join('');
        if (reviewComment) reviewComment.value = '';
      });
    }
  } catch (e) {}
});
