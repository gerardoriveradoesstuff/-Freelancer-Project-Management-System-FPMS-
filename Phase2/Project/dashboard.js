document.addEventListener("DOMContentLoaded", async () => {
  try {
    const stored = localStorage.getItem("fpms_user");
    if (stored) {
      const u = JSON.parse(stored);
      const badge = document.querySelector(".user-badge");
      if (badge) badge.textContent = `${u.fullName} • ${u.role}`;
    }

    async function fetchData() {
      const user = JSON.parse(localStorage.getItem("fpms_user") || "null");
      if (!user) {
        location.href = "/login.html";
        return { client: {}, stats: {}, projects: [], tasks: [], messages: [], payments: [] };
      }
      const res = await fetch(`/api/demo/user/${user.id}`);
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

    function log(title, data) {
      console.log(title, data);
      alert(title + " (check console)");
    }

    bind("q-users", async () => {
      const res = await fetch("/api/demo/query/users");
      log("All Users", await res.json());
    });
    bind("q-freelancers", async () => {
      const res = await fetch("/api/demo/query/freelancers");
      log("Freelancers", await res.json());
    });
    bind("q-projects-by-client", async () => {
      const res = await fetch("/api/demo/query/projects-by-client");
      log("Projects by Client", await res.json());
    });
    bind("q-tasks-by-project", async () => {
      const res = await fetch("/api/demo/query/tasks-by-project");
      log("Tasks by Project", await res.json());
    });
    bind("q-messages-by-project", async () => {
      const res = await fetch("/api/demo/query/messages-by-project");
      log("Messages by Project", await res.json());
    });
    bind("q-payments-by-freelancer", async () => {
      const res = await fetch("/api/demo/query/payments-by-freelancer");
      log("Payments by Freelancer", await res.json());
    });
    bind("q-reviews-by-freelancer", async () => {
      const res = await fetch("/api/demo/query/reviews-by-freelancer");
      log("Reviews for Freelancer", await res.json());
    });
    bind("q-task-count-per-project", async () => {
      const res = await fetch("/api/demo/query/task-count-per-project");
      log("Task Count per Project", await res.json());
    });
    bind("q-average-client-ratings", async () => {
      const res = await fetch("/api/demo/query/average-client-ratings");
      log("Average Client Ratings", await res.json());
    });
    bind("q-projects-with-three-tasks", async () => {
      const res = await fetch("/api/demo/query/projects-with-three-tasks");
      log("Projects with ≥ 3 Tasks", await res.json());
    });

    bind("um-insert-client", async () => {
      await fetch("/api/demo/evelyn/seed", { method: "POST" });
      await refresh();
    });
    bind("um-insert-freelancer", async () => {
      await fetch("/api/demo/member", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Website Redesign", freelancerEmail: "priya@demo.test" }) });
      await refresh();
    });
    bind("um-create-project", async () => {
      await fetch("/api/demo/project", { method: "POST" });
      await refresh();
    });
    bind("um-add-freelancer", async () => {
      await fetch("/api/demo/member", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade", freelancerEmail: "alex@demo.test" }) });
      await refresh();
    });
    bind("um-delete-user", async () => {
      await fetch("/api/demo/user/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "alex@demo.test" }) });
      await refresh();
    });

    bind("pm-create-task", async () => {
      await fetch("/api/demo/task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade" }) });
      await refresh();
    });
    bind("pm-update-task-status", async () => {
      await fetch("/api/demo/task/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "in_progress" }) });
      await refresh();
    });
    bind("pm-send-message", async () => {
      await fetch("/api/demo/message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Website Redesign", content: "Kickoff meeting set." }) });
      await refresh();
    });
    bind("pm-mark-message-read", async () => {
      await fetch("/api/demo/message/read", { method: "POST" });
      await refresh();
    });
    bind("pm-create-payment", async () => {
      await fetch("/api/demo/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade", amount: 120 }) });
      await refresh();
    });
    bind("pm-delete-kickoff-message", async () => {
      await fetch("/api/demo/message/delete-kickoff", { method: "POST" });
      await refresh();
    });

    bind("rp-freelancer-task-assignments", async () => {
      const res = await fetch("/api/demo/query/tasks-by-project");
      log("Freelancer Task Assignments (by project)", await res.json());
    });
    bind("rp-projects-member-count", async () => {
      const res = await fetch("/api/demo/query/task-count-per-project");
      log("Projects Member Count (approx via tasks)", await res.json());
    });
    bind("rp-team-skills-per-project", async () => {
      const res = await fetch("/api/demo/query/reviews-by-freelancer");
      log("Team Skills per Project (demo reviews)", await res.json());
    });
    bind("rp-high-priority-todo-tasks", async () => {
      const res = await fetch("/api/demo/query/tasks-by-project");
      const rows = await res.json();
      log("High Priority Todo Tasks", rows.filter(r => r.priority === 'High' && r.Status === 'todo'));
    });
    bind("rp-clients-unread-messages", async () => {
      const res = await fetch("/api/demo/evelyn");
      const data = await res.json();
      log("Clients with Unread Messages", [{ client: data.client.fullName, unread: data.stats.unreadMessages }]);
    });

    bind("au-assign-by-skill", async () => {
      await fetch("/api/demo/automation/assign-by-skill", { method: "POST" });
      await refresh();
    });
    bind("au-create-project-default-tasks", async () => {
      await fetch("/api/demo/project", { method: "POST" });
      await fetch("/api/demo/task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Demo Project" }) });
      await refresh();
    });
    bind("au-send-and-mark", async () => {
      await fetch("/api/demo/message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Website Redesign", content: "Automated message." }) });
      await fetch("/api/demo/message/read", { method: "POST" });
      await refresh();
    });
    bind("au-complete-project-pay", async () => {
      await fetch("/api/demo/automation/complete-project-pay", { method: "POST" });
      await refresh();
    });
    bind("au-pay-completed-tasks", async () => {
      const res = await fetch("/api/demo/evelyn");
      const data = await res.json();
      const doneTasks = (data.tasks || []).filter(t => t.Status === 'done');
      for (const t of doneTasks) {
        await fetch("/api/demo/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: (data.projects || []).find(p => p.Id === t.project_id)?.Title || 'Client Portal Upgrade', amount: 100 }) });
      }
      await refresh();
    });
    bind("au-remove-inactive-freelancers", async () => {
      await fetch("/api/demo/automation/remove-inactive-freelancers", { method: "POST" });
      await refresh();
    });
    bind("au-alert-overdue-task", async () => {
      await fetch("/api/demo/message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectTitle: "Client Portal Upgrade", content: "Alert: Overdue task detected." }) });
      await refresh();
    });
  } catch (e) {
    console.error(e);
  }
});
