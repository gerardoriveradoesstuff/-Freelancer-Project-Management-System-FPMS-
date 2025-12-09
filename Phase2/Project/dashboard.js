document.addEventListener("DOMContentLoaded", async () => {
  try {
    const stored = localStorage.getItem("fpms_user");
    if (stored) {
      const u = JSON.parse(stored);
      const badge = document.querySelector(".user-badge");
      if (badge) badge.innerHTML = `<span class="avatar"></span>${u.fullName} • ${u.role}`;
    }

    const isLoggedIn = !!stored;
    const BASE = location.origin.startsWith('http') ? '' : 'http://localhost:5000';
    let showAllPayments = false;
    let showAllMessages = false;
    let actionProjectTitle = null;
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navDashboard = document.getElementById('nav-dashboard');
    const navLogout = document.getElementById('nav-logout');
    if (isLoggedIn) {
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
    } else {
      if (navLogin) navLogin.style.display = '';
      if (navRegister) navRegister.style.display = '';
      if (navDashboard) navDashboard.style.display = '';
      if (navLogout) navLogout.style.display = 'none';
    }

    async function fetchData() {
      const user = JSON.parse(localStorage.getItem("fpms_user") || "null");
      if (!user) {
        location.href = `${BASE}/login.html`;
        return { client: {}, stats: {}, projects: [], tasks: [], messages: [], payments: [] };
      }
      const res = await fetch(`${BASE}/api/demo/user/${user.id}`);
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
            <td>
              <select class="task-priority" data-task-id="${t.Task_Id}">
                <option value="Low" ${t.priority==='Low'?'selected':''}>Low</option>
                <option value="Medium" ${t.priority==='Medium'?'selected':''}>Medium</option>
                <option value="High" ${t.priority==='High'?'selected':''}>High</option>
              </select>
            </td>
            <td>
              <select class="task-status" data-task-id="${t.Task_Id}">
                <option value="todo" ${t.Status==='todo'?'selected':''}>todo</option>
                <option value="in_progress" ${t.Status==='in_progress'?'selected':''}>in_progress</option>
                <option value="done" ${t.Status==='done'?'selected':''}>done</option>
              </select>
            </td>
            <td>${t.Deadline || ''}</td>
          </tr>`
        )
        .join("");

        Array.from(document.querySelectorAll('.task-priority')).forEach(sel => {
          sel.addEventListener('change', async (e) => {
            const taskId = Number(e.target.getAttribute('data-task-id'));
            const priority = e.target.value;
            await fetch(`${BASE}/api/demo/task/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, priority }) });
            await refresh();
          });
        });
        Array.from(document.querySelectorAll('.task-status')).forEach(sel => {
          sel.addEventListener('change', async (e) => {
            const taskId = Number(e.target.getAttribute('data-task-id'));
            const status = e.target.value;
            await fetch(`${BASE}/api/demo/task/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, status }) });
            await refresh();
          });
        });
      }

      const messagesList = document.getElementById("messages-list");
      if (messagesList) {
        messagesList.innerHTML = (data.messages || [])
          .slice(0, showAllMessages ? Number.MAX_SAFE_INTEGER : 5)
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
          .slice(0, showAllPayments ? Number.MAX_SAFE_INTEGER : 5)
          .map(
            p => `<li class="list-item">
              <span>${p.Title} • ${fmtMoney(p.Amount)}</span>
              <span class="status-badge ${p.status === 'Pending' ? 'status-pending' : 'status-active'}">${p.status}</span>
            </li>`
          )
          .join("");
      }
    }

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

    await refresh();

    bind("qa-create-project", async () => {
      await fetch(`${BASE}/api/demo/project`, { method: "POST", headers: { "Content-Type": "application/json" } });
    });

    bind("qa-add-freelancer", async () => {
      await fetch(`${BASE}/api/demo/member`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, freelancerEmail: "alex@demo.test" }) });
    });

    bind("qa-create-task", async () => {
      await fetch(`${BASE}/api/demo/task`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle }) });
    });

    bind("qa-update-task-status", async () => {
      await fetch(`${BASE}/api/demo/task/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "in_progress" }) });
    });

    bind("qa-send-message", async () => {
      await fetch(`${BASE}/api/demo/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, content: "Quick action: checking in." }) });
    });

    bind("qa-mark-message-read", async () => {
      await fetch(`${BASE}/api/demo/message/read`, { method: "POST" });
    });

    bind("qa-create-payment", async () => {
      await fetch(`${BASE}/api/demo/payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, amount: 199 }) });
    });

  bind("qa-view-reports", async () => {
    console.log("View Reports clicked");
  });

  bind("view-all-payments", async () => {
    showAllPayments = !showAllPayments;
    const btn = document.getElementById('view-all-payments');
    if (btn) btn.textContent = showAllPayments ? 'Collapse' : 'View All';
  });

  bind("open-inbox", async () => {
    location.href = `${BASE}/messages.html`;
  });

  bind("view-all-projects", async () => {
    document.getElementById('projects-table-body')?.scrollIntoView({ behavior: 'smooth' });
  });

  bind("view-all-tasks", async () => {
    document.getElementById('tasks-table-body')?.scrollIntoView({ behavior: 'smooth' });
  });

    function log(title, data) {
      console.log(title, data);
      alert(title + " (check console)");
    }

    bind("q-users", async () => {
      const res = await fetch(`${BASE}/api/demo/query/users`);
      log("All Users", await res.json());
    });
    bind("q-freelancers", async () => {
      const res = await fetch(`${BASE}/api/demo/query/freelancers`);
      log("Freelancers", await res.json());
    });
    bind("q-projects-by-client", async () => {
      const res = await fetch(`${BASE}/api/demo/query/projects-by-client`);
      log("Projects by Client", await res.json());
    });
    bind("q-tasks-by-project", async () => {
      const res = await fetch(`${BASE}/api/demo/query/tasks-by-project`);
      log("Tasks by Project", await res.json());
    });
    bind("q-messages-by-project", async () => {
      const res = await fetch(`${BASE}/api/demo/query/messages-by-project`);
      log("Messages by Project", await res.json());
    });
    bind("q-payments-by-freelancer", async () => {
      const res = await fetch(`${BASE}/api/demo/query/payments-by-freelancer`);
      log("Payments by Freelancer", await res.json());
    });
    bind("q-reviews-by-freelancer", async () => {
      const res = await fetch(`${BASE}/api/demo/query/reviews-by-freelancer`);
      log("Reviews for Freelancer", await res.json());
    });
    bind("q-task-count-per-project", async () => {
      const res = await fetch(`${BASE}/api/demo/query/task-count-per-project`);
      log("Task Count per Project", await res.json());
    });
    bind("q-average-client-ratings", async () => {
      const res = await fetch(`${BASE}/api/demo/query/average-client-ratings`);
      log("Average Client Ratings", await res.json());
    });
    bind("q-projects-with-three-tasks", async () => {
      const res = await fetch(`${BASE}/api/demo/query/projects-with-three-tasks`);
      log("Projects with ≥ 3 Tasks", await res.json());
    });

    bind("um-insert-client", async () => {
      await fetch(`${BASE}/api/demo/evelyn/seed`, { method: "POST" });
      await refresh();
    });
    bind("um-insert-freelancer", async () => {
      await fetch(`${BASE}/api/demo/member`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, freelancerEmail: "priya@demo.test" }) });
      await refresh();
    });
    bind("um-create-project", async () => {
      await fetch(`${BASE}/api/demo/project`, { method: "POST" });
      await refresh();
    });
    bind("um-add-freelancer", async () => {
      await fetch(`${BASE}/api/demo/member`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade", freelancerEmail: "alex@demo.test" }) });
      await refresh();
    });
    bind("um-delete-user", async () => {
      await fetch(`${BASE}/api/demo/user/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "alex@demo.test" }) });
      await refresh();
    });

    bind("pm-create-task", async () => {
      await fetch(`${BASE}/api/demo/task`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade" }) });
      await refresh();
    });
    bind("pm-update-task-status", async () => {
      await fetch(`${BASE}/api/demo/task/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "in_progress" }) });
      await refresh();
    });
    bind("pm-send-message", async () => {
      await fetch(`${BASE}/api/demo/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, content: "Kickoff meeting set." }) });
      await refresh();
    });
    bind("pm-mark-message-read", async () => {
      await fetch(`${BASE}/api/demo/message/read`, { method: "POST" });
      await refresh();
    });
    bind("pm-create-payment", async () => {
      await fetch(`${BASE}/api/demo/payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, amount: 120 }) });
      await refresh();
    });
    bind("pm-delete-kickoff-message", async () => {
      await fetch(`${BASE}/api/demo/message/delete-kickoff`, { method: "POST" });
      await refresh();
    });

    bind("rp-freelancer-task-assignments", async () => {
      const res = await fetch(`${BASE}/api/demo/query/tasks-by-project`);
      log("Freelancer Task Assignments (by project)", await res.json());
    });
    bind("rp-projects-member-count", async () => {
      const res = await fetch(`${BASE}/api/demo/query/task-count-per-project`);
      log("Projects Member Count (approx via tasks)", await res.json());
    });
    bind("rp-team-skills-per-project", async () => {
      const res = await fetch(`${BASE}/api/demo/query/reviews-by-freelancer`);
      log("Team Skills per Project (demo reviews)", await res.json());
    });
    bind("rp-high-priority-todo-tasks", async () => {
      const res = await fetch(`${BASE}/api/demo/query/tasks-by-project`);
      const rows = await res.json();
      log("High Priority Todo Tasks", rows.filter(r => r.priority === 'High' && r.Status === 'todo'));
    });
    bind("rp-clients-unread-messages", async () => {
      const res = await fetch(`${BASE}/api/demo/evelyn`);
      const data = await res.json();
      log("Clients with Unread Messages", [{ client: data.client.fullName, unread: data.stats.unreadMessages }]);
    });

    bind("au-assign-by-skill", async () => {
      await fetch(`${BASE}/api/demo/automation/assign-by-skill`, { method: "POST" });
      await refresh();
    });
    bind("au-create-project-default-tasks", async () => {
      await fetch(`${BASE}/api/demo/project`, { method: "POST" });
      await fetch(`${BASE}/api/demo/task`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Demo Project" }) });
      await refresh();
    });
    bind("au-send-and-mark", async () => {
      await fetch(`${BASE}/api/demo/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, content: "Automated message." }) });
      await fetch(`${BASE}/api/demo/message/read`, { method: "POST" });
      await refresh();
    });
    bind("au-complete-project-pay", async () => {
      await fetch(`${BASE}/api/demo/automation/complete-project-pay`, { method: "POST" });
      await refresh();
    });
    bind("au-pay-completed-tasks", async () => {
      const res = await fetch(`${BASE}/api/demo/evelyn`);
      const data = await res.json();
      const doneTasks = (data.tasks || []).filter(t => t.Status === 'done');
      for (const t of doneTasks) {
        await fetch(`${BASE}/api/demo/payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: (data.projects || []).find(p => p.Id === t.project_id)?.Title || 'Client Portal Upgrade', amount: 100 }) });
      }
      await refresh();
    });
    bind("au-remove-inactive-freelancers", async () => {
      await fetch(`${BASE}/api/demo/automation/remove-inactive-freelancers`, { method: "POST" });
      await refresh();
    });
    bind("au-alert-overdue-task", async () => {
      await fetch(`${BASE}/api/demo/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: actionProjectTitle, content: "Alert: Overdue task detected." }) });
      await refresh();
    });
  } catch (e) {
    console.error(e);
  }
});
      actionProjectTitle = (data.projects || []).find(p => p.Status === 'active')?.Title
        || (data.projects || [])[0]?.Title
        || 'Client Portal Upgrade';
