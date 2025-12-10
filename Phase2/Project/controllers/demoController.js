const db = require("../db");

function seedEvelyn(callback) {
  db.serialize(() => {
    db.run(
      `INSERT INTO Users (FullName, Email, Password, Role) VALUES (?, ?, ?, ?)`,
      ["Evelyn Park", "evelyn.park@gmail.com", "demo", "client"],
      function () {
        db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
          if (!c) return callback();
          const clientId = c.Id;
          db.run(
            `INSERT OR IGNORE INTO Project (Title, Description, Client_id, Deadline, Status) VALUES (?, ?, ?, DATE('now','+30 day'), 'active')`,
            ["Website Redesign", "Update UI for homepage", clientId],
            function () {
              db.run(
                `INSERT OR IGNORE INTO Project (Title, Description, Client_id, Deadline, Status) VALUES (?, ?, ?, DATE('now','+60 day'), 'pending')`,
                ["Client Portal Upgrade", "Add self-service features", clientId],
                function () {
                  db.get(`SELECT Id FROM Project WHERE Title = 'Website Redesign' AND Client_id = ?`, [clientId], (e1, p1) => {
                    db.get(`SELECT Id FROM Project WHERE Title = 'Client Portal Upgrade' AND Client_id = ?`, [clientId], (e2, p2) => {
                      if (p1)
                        db.run(
                          `INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Design homepage', 'Design layout', DATE('now','+10 day'), 'High', 'in_progress')`,
                          [p1.Id]
                        );
                      if (p2)
                        db.run(
                          `INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'API integration', 'Connect backend', DATE('now','+20 day'), 'Medium', 'todo')`,
                          [p2.Id]
                        );
                      db.run(
                        `INSERT OR IGNORE INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Final Payment', 'Pending payout', 500.00, ?, NULL, ?, DATE('now'), 'Pending')`,
                        [clientId, p1 ? p1.Id : null],
                        function () {
                          callback();
                        }
                      );
                    });
                  });
                }
              );
            }
          );
        });
      }
    );
  });
}

function seedEvelynExtended(callback) {
  db.serialize(() => {
    db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
      if (!c) return callback();
      const clientId = c.Id;

      db.run(`INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Alex Chen','alex@demo.test','demo','freelancer')`);
      db.run(`INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Priya Singh','priya@demo.test','demo','freelancer')`);

      db.run(`INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('Web Development','Frontend and backend web development')`);
      db.run(`INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('UI/UX','Design and user experience')`);
      db.run(`INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('API Integration','Connect services and APIs')`);

      db.get(`SELECT Id FROM Users WHERE Email='alex@demo.test'`, (eA, alex) => {
        db.get(`SELECT Id FROM Users WHERE Email='priya@demo.test'`, (eP, priya) => {
          db.get(`SELECT Skill_Id FROM Skill WHERE Name='Web Development'`, (eS1, s1) => {
            db.get(`SELECT Skill_Id FROM Skill WHERE Name='UI/UX'`, (eS2, s2) => {
              db.get(`SELECT Skill_Id FROM Skill WHERE Name='API Integration'`, (eS3, s3) => {
                if (alex && s1) db.run(`INSERT OR IGNORE INTO User_Skill (user_id, skill_id) VALUES (?, ?)`, [alex.Id, s1.Skill_Id]);
                if (alex && s3) db.run(`INSERT OR IGNORE INTO User_Skill (user_id, skill_id) VALUES (?, ?)`, [alex.Id, s3.Skill_Id]);
                if (priya && s2) db.run(`INSERT OR IGNORE INTO User_Skill (user_id, skill_id) VALUES (?, ?)`, [priya.Id, s2.Skill_Id]);

                db.run(`INSERT OR IGNORE INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Analytics Dashboard','Build reporting views', ?, DATE('now','-5 day'),'completed')`, [clientId]);
                db.run(`INSERT OR IGNORE INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Mobile App MVP','Build core flows', ?, DATE('now','+45 day'),'active')`, [clientId]);

                    db.get(`SELECT Id FROM Project WHERE Title='Website Redesign' AND Client_id=?`, [clientId], (e1, p1) => {
                  db.get(`SELECT Id FROM Project WHERE Title='Client Portal Upgrade' AND Client_id=?`, [clientId], (e2, p2) => {
                    db.get(`SELECT Id FROM Project WHERE Title='Analytics Dashboard' AND Client_id=?`, [clientId], (e3, p3) => {
                      db.get(`SELECT Id FROM Project WHERE Title='Mobile App MVP' AND Client_id=?`, [clientId], (e4, p4) => {
                      if (alex && p1) db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [alex.Id, p1.Id]);
                      if (priya && p1) db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [priya.Id, p1.Id]);
                      if (alex && p2) db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [alex.Id, p2.Id]);
                      if (priya && p3) db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [priya.Id, p3.Id]);

                      if (p1) db.run(`INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Content brief','Write copy plan', DATE('now','-10 day'),'Low','done')`, [p1.Id]);
                      if (p2) db.run(`INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Auth flow','Implement login/roles', DATE('now','+12 day'),'High','in_progress')`, [p2.Id]);
                      if (p3) db.run(`INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Charts','Build KPI charts', DATE('now','-7 day'),'Medium','done')`, [p3.Id]);
                      if (p4) db.run(`INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Onboarding','Create signup flow', DATE('now','+15 day'),'High','todo')`, [p4.Id]);
                      if (p4) db.run(`INSERT OR IGNORE INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Push notifications','Implement FCM', DATE('now','+25 day'),'Medium','in_progress')`, [p4.Id]);

                      db.get(`SELECT Task_Id FROM Task WHERE title='Design homepage' AND project_id=?`, [p1 ? p1.Id : -1], (eT1, t1) => {
                        db.get(`SELECT Task_Id FROM Task WHERE title='API integration' AND project_id=?`, [p2 ? p2.Id : -1], (eT2, t2) => {
                          if (alex && t1) db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) VALUES (?, ?)`, [alex.Id, t1.Task_Id]);
                          if (priya && t1) db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) VALUES (?, ?)`, [priya.Id, t1.Task_Id]);
                          if (alex && t2) db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) VALUES (?, ?)`, [alex.Id, t2.Task_Id]);
                          if (priya && p2) db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) SELECT ?, Task_Id FROM Task WHERE project_id=? LIMIT 1`, [priya.Id, p2.Id]);
                          if (alex && p4) db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) SELECT ?, Task_Id FROM Task WHERE project_id=? ORDER BY created_at DESC LIMIT 1`, [alex.Id, p4.Id]);

                          if (alex && p1) db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Initial concepts ready', 0)`, [alex.Id, clientId, p1.Id]);
                          if (clientId && p2) db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Please update the deadline', 1)`, [clientId, priya ? priya.Id : null, p2.Id]);
                          if (clientId && p4) db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Can we add dark mode?', 0)`, [clientId, alex ? alex.Id : null, p4.Id]);

                          if (p1) db.run(`INSERT OR IGNORE INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Design Milestone','Payment for design stage', 250.00, ?, ?, ?, DATE('now'), 'Completed')`, [clientId, alex ? alex.Id : null, p1.Id]);
                          if (p2) db.run(`INSERT OR IGNORE INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Implementation Milestone','Pending payout', 450.00, ?, ?, ?, DATE('now'), 'Pending')`, [clientId, priya ? priya.Id : null, p2.Id]);
                          if (p4) db.run(`INSERT OR IGNORE INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('MVP Sprint','Payment for sprint 1', 300.00, ?, ?, ?, DATE('now'), 'Pending')`, [clientId, alex ? alex.Id : null, p4.Id]);

                          if (p1 && priya) db.run(`INSERT OR IGNORE INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (?, ?, ?, 5, 'Great work on visuals', DATE('now'), 'client_to_freelancer')`, [p1.Id, clientId, priya.Id]);

                          callback();
                    });
                  });
                });
              });
            });
          });
              });
            });
          });
        });
      });
    });
  });
}

exports.getEvelynData = (req, res) => {
  const result = {
    client: { fullName: "Evelyn Park" },
    stats: { activeProjects: 0, tasksInProgress: 0, unreadMessages: 0, pendingPaymentsAmount: 0 },
    projects: [],
    tasks: [],
    messages: [],
    payments: []
  };

  db.get(`SELECT Id FROM Users WHERE FullName = ? AND Role = 'client'`, ["Evelyn Park"], (err, client) => {
    if (err || !client) {
      return seedEvelyn(() => {
        db.get(`SELECT Id FROM Users WHERE FullName = ? AND Role = 'client'`, ["Evelyn Park"], (err2, client2) => {
          if (err2 || !client2) return res.json(result);
          proceed(client2.Id);
        });
      });
    }
    proceed(client.Id);
  });

  function proceed(clientId) {

    db.all(`SELECT * FROM Project WHERE Client_id = ?`, [clientId], (errP, projects) => {
      if (!errP && projects) result.projects = projects;

      const projectIds = projects && projects.length ? projects.map(p => p.Id) : [];
      const placeholders = projectIds.map(() => "?").join(",");

      const tasksQuery = projectIds.length
        ? `SELECT * FROM Task WHERE project_id IN (${placeholders})`
        : `SELECT * FROM Task WHERE 1=0`;

      db.all(tasksQuery, projectIds, (errT, tasks) => {
        if (!errT && tasks) result.tasks = tasks;

        db.all(
          `SELECT * FROM Message WHERE sender_id = ? OR receiver_id = ? ORDER BY Sent_at DESC`,
          [clientId, clientId],
          (errM, messages) => {
            if (!errM && messages) result.messages = messages;

            db.all(
              `SELECT * FROM Payment WHERE Client_id = ?`,
              [clientId],
              (errPay, payments) => {
                if (!errPay && payments) result.payments = payments;

                // Stats
                result.stats.activeProjects = (result.projects || []).filter(p => p.Status === "active").length;
                result.stats.tasksInProgress = (result.tasks || []).filter(t => t.Status === "in_progress").length;
                result.stats.unreadMessages = (result.messages || []).filter(m => !m.is_read).length;
                result.stats.pendingPaymentsAmount = (result.payments || [])
                  .filter(p => p.status === "Pending")
                  .reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);

                res.json(result);
              }
            );
          }
        );
      });
    });
  }
};

exports.seedEvelyn = (req, res) => {
  seedEvelynExtended(() => {
    res.json({ ok: true });
  });
};

exports.createProjectDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    const title = req.body?.title || `Demo Project ${Date.now()}`;
    const desc = req.body?.description || "Auto-created demo project";
    db.run(
      `INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES (?, ?, ?, DATE('now','+21 day'),'active')`,
      [title, desc, c.Id],
      function (err) {
        if (err) return res.status(400).json({ message: "Create project failed" });
        res.json({ projectId: this.lastID });
      }
    );
  });
};

exports.addFreelancerToProjectDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    const freelancerEmail = req.body?.freelancerEmail || "alex@demo.test";
    const projectTitle = req.body?.projectTitle || "Website Redesign";
    db.get(`SELECT Id FROM Users WHERE Email = ?`, [freelancerEmail], (eF, f) => {
      if (!f) return res.status(400).json({ message: "Freelancer not found" });
      db.get(`SELECT Id FROM Project WHERE Title = ? AND Client_id = ?`, [projectTitle, c.Id], (eP, p) => {
        if (!p) return res.status(400).json({ message: "Project not found" });
        db.run(
          `INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`,
          [f.Id, p.Id],
          function (err) {
            if (err) return res.status(400).json({ message: "Add member failed" });
            res.json({ ok: true });
          }
        );
      });
    });
  });
};

exports.createTaskDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    const projectTitle = req.body?.projectTitle || "Client Portal Upgrade";
    const title = req.body?.title || `Quick Task ${Date.now()}`;
    const desc = req.body?.description || "Auto-created demo task";
    const priority = req.body?.priority || "High";
    db.get(`SELECT Id FROM Project WHERE Title = ? AND Client_id = ?`, [projectTitle, c.Id], (eP, p) => {
      if (!p) return res.status(400).json({ message: "Project not found" });
      db.run(
        `INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, ?, ?, DATE('now','+7 day'), ?, 'todo')`,
        [p.Id, title, desc, priority],
        function (err) {
          if (err) return res.status(400).json({ message: "Create task failed" });
          res.json({ taskId: this.lastID });
        }
      );
    });
  });
};

exports.updateTaskPriorityStatusDemo = (req, res) => {
  const taskId = Number(req.body?.taskId);
  const priority = req.body?.priority;
  const status = req.body?.status;
  console.log(`[Task] update request taskId=${taskId} priority=${priority || ''} status=${status || ''}`);
  if (!taskId) return res.status(400).json({ message: "taskId required" });
  if (!priority && !status) return res.status(400).json({ message: "No fields to update" });
  const fields = [];
  const values = [];
  if (priority) { fields.push("priority = ?"); values.push(priority); }
  if (status) { fields.push("Status = ?"); values.push(status); }
  values.push(taskId);
  const sql = `UPDATE Task SET ${fields.join(", ")} WHERE Task_Id = ?`;
  db.run(sql, values, function (err) {
    if (err) return res.status(400).json({ message: "Update failed" });
    console.log(`[Task] updated taskId=${taskId} changes=${this.changes}`);
    res.json({ updated: this.changes });
  });
};

exports.updateTaskStatusDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    const newStatus = req.body?.status || "in_progress";
    db.get(
      `SELECT t.Task_Id FROM Task t JOIN Project p ON p.Id = t.project_id WHERE p.Client_id = ? AND t.Status = 'todo' ORDER BY t.created_at DESC LIMIT 1`,
      [c.Id],
      (eT, t) => {
        if (!t) return res.status(400).json({ message: "No todo task found" });
        db.run(`UPDATE Task SET Status = ? WHERE Task_Id = ?`, [newStatus, t.Task_Id], function (err) {
          if (err) return res.status(400).json({ message: "Update status failed" });
          res.json({ ok: true });
        });
      }
    );
  });
};

exports.sendMessageDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    const projectTitle = req.body?.projectTitle || "Website Redesign";
    const content = req.body?.content || "Demo: Please review the latest changes.";
    db.get(`SELECT Id FROM Project WHERE Title = ? AND Client_id = ?`, [projectTitle, c.Id], (eP, p) => {
      if (!p) return res.status(400).json({ message: "Project not found" });
      db.get(
        `SELECT u.Id FROM Project_Member pm JOIN Users u ON u.Id = pm.user_id WHERE pm.project_id = ? LIMIT 1`,
        [p.Id],
        (eM, m) => {
          const receiverId = m ? m.Id : c.Id;
          db.run(
            `INSERT INTO Message (sender_id, receiver_id, project_id, Content) VALUES (?, ?, ?, ?)`,
            [c.Id, receiverId, p.Id, content],
            function (err) {
              if (err) return res.status(400).json({ message: "Send message failed" });
              res.json({ message_id: this.lastID });
            }
          );
        }
      );
    });
  });
};

exports.markMessageReadDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    db.run(
      `UPDATE Message SET is_read = 1 WHERE receiver_id = ? AND is_read = 0`,
      [c.Id],
      function (err) {
        if (err) return res.status(400).json({ message: "Mark read failed" });
        res.json({ updated: this.changes });
      }
    );
  });
};

exports.createPaymentDemo = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    const projectTitle = req.body?.projectTitle || "Client Portal Upgrade";
    const amount = Number(req.body?.amount || 199.0);
    const title = req.body?.title || "Demo Payment";
    db.get(`SELECT Id FROM Project WHERE Title = ? AND Client_id = ?`, [projectTitle, c.Id], (eP, p) => {
      if (!p) return res.status(400).json({ message: "Project not found" });
      db.get(
        `SELECT u.Id FROM Project_Member pm JOIN Users u ON u.Id = pm.user_id WHERE pm.project_id = ? LIMIT 1`,
        [p.Id],
        (eM, m) => {
          const recipientId = m ? m.Id : null;
          db.run(
            `INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES (?, 'Demo payment', ?, ?, ?, ?, DATE('now'), 'Pending')`,
            [title, amount, c.Id, recipientId, p.Id],
            function (err) {
              if (err) return res.status(400).json({ message: "Create payment failed" });
              res.json({ payment_id: this.lastID });
            }
          );
        }
      );
    });
  });
};

exports.seedEvelynMessages = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (eC, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    db.get(`SELECT Id FROM Users WHERE Email='alex@demo.test'`, (eA, alex) => {
      db.get(`SELECT Id FROM Users WHERE Email='priya@demo.test'`, (eP, priya) => {
        db.get(`SELECT Id FROM Project WHERE Title='Website Redesign' AND Client_id=?`, [c.Id], (e1, p1) => {
          db.get(`SELECT Id FROM Project WHERE Title='Client Portal Upgrade' AND Client_id=?`, [c.Id], (e2, p2) => {
            let inserted = 0;
            db.serialize(() => {
              if (alex && p1) {
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Hey Alex, can you share the latest mockups?', 0)`, [c.Id, alex.Id, p1.Id], function(){ inserted += this.changes; });
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Sure, uploading now. Do you prefer dark header?', 0)`, [alex.Id, c.Id, p1.Id], function(){ inserted += this.changes; });
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Dark header sounds good. Add CTA on hero.', 1)`, [c.Id, alex.Id, p1.Id], function(){ inserted += this.changes; });
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Got it. I will push updated homepage by EOD.', 1)`, [alex.Id, c.Id, p1.Id], function(){ inserted += this.changes; });
              }
              if (priya && p2) {
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Priya, auth flow needs password reset.', 0)`, [c.Id, priya.Id, p2.Id], function(){ inserted += this.changes; });
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Acknowledged. I will add reset + email.', 0)`, [priya.Id, c.Id, p2.Id], function(){ inserted += this.changes; });
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Please extend the deadline by 3 days.', 1)`, [c.Id, priya.Id, p2.Id], function(){ inserted += this.changes; });
                db.run(`INSERT OR IGNORE INTO Message (sender_id, receiver_id, project_id, Content, is_read) VALUES (?, ?, ?, 'Extended. Added note to tasks.', 1)`, [priya.Id, c.Id, p2.Id], function(){ inserted += this.changes; });
              }
            });
            setTimeout(() => {
              res.json({ inserted });
            }, 50);
          });
        });
      });
    });
  });
};

exports.getUserDashboard = (req, res) => {
  const userId = Number(req.params.id);
  const result = {
    client: {},
    stats: { activeProjects: 0, tasksInProgress: 0, unreadMessages: 0, pendingPaymentsAmount: 0 },
    projects: [],
    tasks: [],
    messages: [],
    payments: []
  };

  db.get(`SELECT Id, FullName, Role FROM Users WHERE Id = ?`, [userId], (eU, u) => {
    if (!u) return res.json(result);
    result.client = { id: u.Id, fullName: u.FullName, role: u.Role };
    const role = String(u.Role || '').toLowerCase();
    const projectsSql = role === 'freelancer'
      ? `SELECT p.* FROM Project p JOIN Project_Member pm ON pm.project_id = p.Id WHERE pm.user_id = ?`
      : `SELECT * FROM Project WHERE Client_id = ?`;

    db.all(projectsSql, [userId], (eP, projects) => {
      result.projects = projects || [];
      const projectIds = result.projects.map(p => p.Id);
      const placeholders = projectIds.length ? projectIds.map(() => "?").join(",") : "";
      const tasksSql = projectIds.length ? `SELECT * FROM Task WHERE project_id IN (${placeholders})` : `SELECT * FROM Task WHERE 1=0`;

      db.all(tasksSql, projectIds, (eT, tasks) => {
        result.tasks = tasks || [];
        db.all(`SELECT * FROM Message WHERE sender_id = ? OR receiver_id = ? ORDER BY Sent_at DESC`, [userId, userId], (eM, msgs) => {
          result.messages = msgs || [];
          const paymentsSql = role === 'freelancer' ? `SELECT * FROM Payment WHERE recipient_id = ?` : `SELECT * FROM Payment WHERE Client_id = ?`;
          db.all(paymentsSql, [userId], (ePay, pays) => {
            result.payments = pays || [];

            result.stats.activeProjects = result.projects.filter(p => p.Status === 'active').length;
            result.stats.tasksInProgress = result.tasks.filter(t => t.Status === 'in_progress').length;
            result.stats.unreadMessages = result.messages.filter(m => !m.is_read).length;
            result.stats.pendingPaymentsAmount = result.payments
              .filter(p => p.status === 'Pending')
              .reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);

            res.json(result);
          });
        });
      });
    });
  });
};

exports.deleteDemoUser = (req, res) => {
  const email = req.body?.email || "alex@demo.test";
  db.run(`DELETE FROM Users WHERE Email = ?`, [email], function (err) {
    if (err) return res.status(400).json({ message: "Delete failed" });
    res.json({ deleted: this.changes });
  });
};

exports.deleteKickoffMessageDemo = (req, res) => {
  db.run(`DELETE FROM Message WHERE Content LIKE '%Initial concepts%'`, [], function (err) {
    if (err) return res.status(400).json({ message: "Delete message failed" });
    res.json({ deleted: this.changes });
  });
};

exports.automationCompleteProjectAndPay = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName = ?`, ["Evelyn Park"], (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    db.get(`SELECT Id FROM Project WHERE Title='Website Redesign' AND Client_id=?`, [c.Id], (eP, p) => {
      if (!p) return res.status(400).json({ message: "Project not found" });
      db.run(`UPDATE Project SET Status='completed' WHERE Id=?`, [p.Id], function (err) {
        if (err) return res.status(400).json({ message: "Update project failed" });
        db.get(`SELECT u.Id FROM Project_Member pm JOIN Users u ON u.Id=pm.user_id WHERE pm.project_id=? LIMIT 1`, [p.Id], (eM, m) => {
          db.run(
            `INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Completion Bonus','Auto payout', 300.00, ?, ?, ?, DATE('now'), 'Completed')`,
            [c.Id, m ? m.Id : null, p.Id],
            function (err2) {
              if (err2) return res.status(400).json({ message: "Payment failed" });
              res.json({ ok: true });
            }
          );
        });
      });
    });
  });
};

exports.automationAssignBySkill = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName='Evelyn Park'`, (e, c) => {
    if (!c) return res.status(400).json({ message: "Client not found" });
    db.get(`SELECT Id FROM Project WHERE Title='Client Portal Upgrade' AND Client_id=?`, [c.Id], (eP, p) => {
      if (!p) return res.status(400).json({ message: "Project not found" });
      db.get(`SELECT Task_Id FROM Task WHERE project_id=? AND Status='todo' ORDER BY created_at DESC LIMIT 1`, [p.Id], (eT, t) => {
        db.get(`SELECT u.Id FROM Users u JOIN User_Skill us ON us.user_id=u.Id JOIN Skill s ON s.Skill_Id=us.skill_id WHERE s.Name='API Integration' LIMIT 1`, (eS, u) => {
          if (!t || !u) return res.status(400).json({ message: "No task or skill match" });
          db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) VALUES (?, ?)`, [u.Id, t.Task_Id], function (err) {
            if (err) return res.status(400).json({ message: "Assign failed" });
            res.json({ ok: true });
          });
        });
      });
    });
  });
};

exports.automationRemoveInactiveFreelancers = (req, res) => {
  db.run(
    `DELETE FROM Users WHERE Role='freelancer' AND Id NOT IN (SELECT user_id FROM Project_Member)`,
    [],
    function (err) {
      if (err) return res.status(400).json({ message: "Remove failed" });
      res.json({ deleted: this.changes });
    }
  );
};

exports.queryUsers = (req, res) => {
  db.all(`SELECT * FROM Users`, [], (e, rows) => res.json(rows));
};
exports.queryFreelancers = (req, res) => {
  db.all(`SELECT * FROM Users WHERE Role='freelancer'`, [], (e, rows) => res.json(rows));
};
exports.queryProjectsByClient = (req, res) => {
  db.get(`SELECT Id FROM Users WHERE FullName='Evelyn Park'`, (e, c) => {
    if (!c) return res.json([]);
    db.all(`SELECT * FROM Project WHERE Client_id=?`, [c.Id], (e2, rows) => res.json(rows));
  });
};
exports.queryTasksByProject = (req, res) => {
  const title = req.query?.title || 'Client Portal Upgrade';
  db.get(`SELECT Id FROM Users WHERE FullName='Evelyn Park'`, (e, c) => {
    db.get(`SELECT Id FROM Project WHERE Title=? AND Client_id=?`, [title, c ? c.Id : -1], (eP, p) => {
      if (!p) return res.json([]);
      db.all(`SELECT * FROM Task WHERE project_id=?`, [p.Id], (e2, rows) => res.json(rows));
    });
  });
};
exports.queryMessagesByProject = (req, res) => {
  const title = req.query?.title || 'Website Redesign';
  db.get(`SELECT Id FROM Users WHERE FullName='Evelyn Park'`, (e, c) => {
    db.get(`SELECT Id FROM Project WHERE Title=? AND Client_id=?`, [title, c ? c.Id : -1], (eP, p) => {
      if (!p) return res.json([]);
      db.all(`SELECT * FROM Message WHERE project_id=? ORDER BY Sent_at DESC`, [p.Id], (e2, rows) => res.json(rows));
    });
  });
};
exports.queryPaymentsByFreelancer = (req, res) => {
  const email = req.query?.email || 'alex@demo.test';
  db.get(`SELECT Id FROM Users WHERE Email=?`, [email], (e, u) => {
    if (!u) return res.json([]);
    db.all(`SELECT * FROM Payment WHERE recipient_id=?`, [u.Id], (e2, rows) => res.json(rows));
  });
};
exports.queryReviewsByFreelancer = (req, res) => {
  const email = req.query?.email || 'priya@demo.test';
  db.get(`SELECT Id FROM Users WHERE Email=?`, [email], (e, u) => {
    if (!u) return res.json([]);
    db.all(`SELECT * FROM Review WHERE reviewee_id=?`, [u.Id], (e2, rows) => res.json(rows));
  });
};
exports.queryTaskCountPerProject = (req, res) => {
  db.all(`SELECT p.Title, COUNT(t.Task_Id) as task_count FROM Project p LEFT JOIN Task t ON t.project_id=p.Id GROUP BY p.Id`, [], (e, rows) => res.json(rows));
};
exports.queryAverageClientRatings = (req, res) => {
  db.all(`SELECT u.FullName as client, AVG(r.Rating) as avg_rating FROM Review r JOIN Users u ON u.Id=r.reviewer_id WHERE r.Type='client_to_freelancer' GROUP BY u.Id`, [], (e, rows) => res.json(rows));
};
exports.queryProjectsWithThreeTasks = (req, res) => {
  db.all(`SELECT p.Title FROM Project p JOIN Task t ON t.project_id=p.Id GROUP BY p.Id HAVING COUNT(t.Task_Id) >= 3`, [], (e, rows) => res.json(rows));
};
