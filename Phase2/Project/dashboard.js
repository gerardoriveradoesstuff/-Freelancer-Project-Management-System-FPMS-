document.addEventListener("DOMContentLoaded", async () => {
  try {
    async function fetchData() {
      const res = await fetch("http://localhost:5000/api/demo/evelyn");
      return res.json();
    }

    async function refresh() {
      const data = await fetchData();

    const fmtMoney = v => `$${Number(v || 0).toFixed(2)}`;

    const statProjects = document.getElementById("stat-active-projects");
    const statTasks = document.getElementById("stat-tasks-in-progress");
    const statUnread = document.getElementById("stat-unread-messages");
    const statPending = document.getElementById("stat-pending-payments");

    if (statProjects) statProjects.textContent = data.stats.activeProjects;
    if (statTasks) statTasks.textContent = data.stats.tasksInProgress;
    if (statUnread) statUnread.textContent = data.stats.unreadMessages;
    if (statPending) statPending.textContent = fmtMoney(data.stats.pendingPaymentsAmount);

    const projectsBody = document.getElementById("projects-table-body");
    if (projectsBody) {
      projectsBody.innerHTML = (data.projects || [])
        .map(
          p => `<tr>
            <td>${p.Title}</td>
            <td><span class="status-badge ${p.Status === 'active' ? 'status-active' : p.Status === 'completed' ? 'status-done' : 'status-pending'}">${p.Status}</span></td>
            <td>${p.Deadline || ''}</td>
            <td class="text-right">—</td>
          </tr>`
        )
        .join("");
    }

    const tasksBody = document.getElementById("tasks-table-body");
    if (tasksBody) {
      tasksBody.innerHTML = (data.tasks || [])
        .map(
          t => `<tr>
            <td>${t.title}</td>
            <td>${(data.projects || []).find(p => p.Id === t.project_id)?.Title || ''}</td>
            <td>${t.priority}</td>
            <td><span class="status-badge ${t.Status === 'in_progress' ? 'status-progress' : t.Status === 'done' ? 'status-done' : 'status-todo'}">${t.Status}</span></td>
            <td>${t.Deadline || ''}</td>
          </tr>`
        )
        .join("");
    }

    const messagesList = document.getElementById("messages-list");
    if (messagesList) {
      messagesList.innerHTML = (data.messages || [])
        .slice(0, 5)
        .map(
          m => `<li class="list-item">
            <span>${m.Content}</span>
            <span class="meta">${(data.projects || []).find(p => p.Id === m.project_id)?.Title || 'Direct'}</span>
          </li>`
        )
        .join("");
    }

    const paymentsList = document.getElementById("payments-list");
    if (paymentsList) {
      paymentsList.innerHTML = (data.payments || [])
        .slice(0, 5)
        .map(
          p => `<li class="list-item">
            <span>${p.Title} • ${fmtMoney(p.Amount)}</span>
            <span class="status-badge ${p.status === 'Pending' ? 'status-pending' : 'status-active'}">${p.status}</span>
          </li>`
        )
        .join("");
    }

    await refresh();

    function bind(id, handler) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        el.classList.add("loading");
        try {
          await handler();
          await refresh();
        } catch (err) {
          console.error(err);
        } finally {
          el.classList.remove("loading");
        }
      });
    }

    bind("qa-create-project", async () => {
      await fetch("http://localhost:5000/api/demo/project", { method: "POST", headers: { "Content-Type": "application/json" } });
    });

    bind("qa-add-freelancer", async () => {
      await fetch("http://localhost:5000/api/demo/member", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Website Redesign", freelancerEmail: "alex@demo.test" }) });
    });

    bind("qa-create-task", async () => {
      await fetch("http://localhost:5000/api/demo/task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade" }) });
    });

    bind("qa-update-task-status", async () => {
      await fetch("http://localhost:5000/api/demo/task/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "in_progress" }) });
    });

    bind("qa-send-message", async () => {
      await fetch("http://localhost:5000/api/demo/message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Website Redesign", content: "Quick action: checking in." }) });
    });

    bind("qa-mark-message-read", async () => {
      await fetch("http://localhost:5000/api/demo/message/read", { method: "POST" });
    });

    bind("qa-create-payment", async () => {
      await fetch("http://localhost:5000/api/demo/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade", amount: 199 }) });
    });

    bind("qa-view-reports", async () => {
      console.log("View Reports clicked");
    });
  } catch (e) {
    console.error(e);
  }
});
