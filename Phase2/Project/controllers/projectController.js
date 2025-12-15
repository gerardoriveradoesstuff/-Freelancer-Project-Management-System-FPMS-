const db = require('../db');

exports.createProject = (req, res) => {
  const { email, title, description, deadline, clientId, clientEmail, freelancerEmail, freelancerId } = req.body;

  function insertWithClient(cid) {
    db.run(
      `INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES (?, ?, ?, ?, ?)`,
      [title, description, cid, deadline, 'active'],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const projectId = this.lastID;

        let d = new Date(deadline);
        const fmt = (dt) => dt.toISOString().slice(0, 10);
        const addDays = (base, days) => {
          const nd = new Date(base);
          nd.setDate(nd.getDate() + days);
          return nd;
        };
        const tasks = [
          { title: 'Planning', description: 'Plan project phases', deadline: fmt(addDays(d, -30)) },
          { title: 'Development', description: 'Code features', deadline: fmt(addDays(d, -15)) },
          { title: 'Testing', description: 'Test complete system', deadline: fmt(addDays(d, -5)) }
        ];

        const placeholders = tasks.map(() => '(?, ?, ?, ?)').join(',');
        const values = tasks.reduce((acc, task) => acc.concat([projectId, task.title, task.description, task.deadline]), []);

        db.run(`INSERT INTO Task (project_id, title, Description, Deadline) VALUES ${placeholders}`, values, (e2) => {
          if (e2) return res.status(500).json({ error: e2.message });
          if (freelancerId) {
            db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Manager')`, [freelancerId, projectId]);
            db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [cid, projectId]);
          } else {
            db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Manager')`, [cid, projectId]);
            if (freelancerEmail) {
              db.get(`SELECT Id FROM Users WHERE Email = ? AND Role='freelancer'`, [freelancerEmail], (ge, row) => {
                if (!ge && row) db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [row.Id, projectId]);
              });
            }
          }
          res.json({ message: 'Project and tasks created successfully', projectId });
        });
      }
    );
  }

  if (clientId) {
    insertWithClient(clientId);
  } else if (clientEmail) {
    db.get(`SELECT Id FROM Users WHERE Email = ? AND Role='client'`, [clientEmail], (ge, row) => {
      if (ge) return res.status(500).json({ error: ge.message });
      if (!row) return res.status(404).json({ message: 'Client email not found' });
      insertWithClient(row.Id);
    });
  } else if (email) {
    db.get(`SELECT Id FROM Users WHERE Email = ? AND Role='client'`, [email], (ge, row) => {
      if (ge) return res.status(500).json({ error: ge.message });
      if (!row) return res.status(404).json({ message: 'Client email not found' });
      insertWithClient(row.Id);
    });
  } else {
    res.status(400).json({ message: 'Provide clientId or clientEmail' });
  }
};

exports.addProjectMember = (req, res) => {
  const projectId = Number(req.params.id);
  const email = String(req.body?.email || '').trim();
  const actorId = Number(req.body?.actorId);
  if (!projectId || !email || !actorId) return res.status(400).json({ message: 'projectId, email, actorId required' });

  db.get(`SELECT Id, Client_id FROM Project WHERE Id = ?`, [projectId], (eP, p) => {
    if (eP) return res.status(500).json({ error: eP.message });
    if (!p) return res.status(404).json({ message: 'Project not found' });

    const allow = () => {
      db.get(`SELECT Id FROM Users WHERE Email = ?`, [email], (eU, u) => {
        if (eU) return res.status(500).json({ error: eU.message });
        if (!u) return res.status(404).json({ message: 'User not found' });
        db.run(
          `INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`,
          [u.Id, projectId],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ added: this.changes, projectId, userId: u.Id });
          }
        );
      });
    };

    if (Number(p.Client_id) === actorId) return allow();
    db.get(
      `SELECT role FROM Project_Member WHERE user_id = ? AND project_id = ?`,
      [actorId, projectId],
      (eM, m) => {
        if (eM) return res.status(500).json({ error: eM.message });
        if (m && String(m.role).toLowerCase() === 'manager') return allow();
        res.status(403).json({ message: 'Not authorized' });
      }
    );
  });
};

exports.getProjectMembers = (req, res) => {
  const projectId = Number(req.params.id);
  if (!projectId) return res.status(400).json({ message: 'projectId required' });
  db.all(
    `SELECT u.Id, u.FullName, u.Email, pm.role FROM Project_Member pm JOIN Users u ON u.Id = pm.user_id WHERE pm.project_id = ? ORDER BY u.FullName`,
    [projectId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};

exports.completeProjectAndPay = (req, res) => {
  const projectId = Number(req.params.id);
  const actorId = Number(req.body?.actorId);
  const amount = Number(req.body?.amount);
  const recipientIdBody = req.body?.recipientId ? Number(req.body.recipientId) : null;
  if (!projectId || !actorId || !amount || amount <= 0) return res.status(400).json({ message: 'projectId, actorId, positive amount required' });

  db.get(`SELECT Id, Client_id FROM Project WHERE Id = ?`, [projectId], (eP, p) => {
    if (eP) return res.status(500).json({ error: eP.message });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    if (Number(p.Client_id) !== actorId) return res.status(403).json({ message: 'Only project client can complete and pay' });

    const pickRecipient = (cb) => {
      if (recipientIdBody) return cb(null, recipientIdBody);
      db.get(
        `SELECT u.Id FROM Project_Member pm JOIN Users u ON u.Id = pm.user_id WHERE pm.project_id = ? AND pm.role = 'Contributor' ORDER BY u.FullName LIMIT 1`,
        [projectId],
        (eR, r) => cb(eR, r ? r.Id : null)
      );
    };

    db.run(`UPDATE Project SET Status = 'completed' WHERE Id = ?`, [projectId], function (eU) {
      if (eU) return res.status(500).json({ error: eU.message });
      db.run(`UPDATE Task SET Status = 'done' WHERE project_id = ?`, [projectId], function (eT) {
        if (eT) return res.status(500).json({ error: eT.message });
        pickRecipient((eRec, recipientId) => {
          if (eRec) return res.status(500).json({ error: eRec.message });
          db.run(
            `INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Final Payment', 'Completion payout', ?, ?, ?, ?, DATE('now'), 'Pending')`,
            [amount, p.Client_id, recipientId, projectId],
            function (ePay) {
              if (ePay) return res.status(500).json({ error: ePay.message });
              res.json({ completed: true, tasksUpdated: this.changes ?? 0, payment_id: this.lastID, recipient_id: recipientId });
            }
          );
        });
      });
    });
  });
};

exports.autoPayCompletedMembers = (req, res) => {
  const projectId = Number(req.params.id);
  const actorId = Number(req.body?.actorId);
  const amount = Number(req.body?.amount) || 200;
  if (!projectId || !actorId) return res.status(400).json({ message: 'projectId, actorId required' });

  db.get(`SELECT Id, Client_id FROM Project WHERE Id = ?`, [projectId], (eP, p) => {
    if (eP) return res.status(500).json({ error: eP.message });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    if (Number(p.Client_id) !== actorId) return res.status(403).json({ message: 'Only project client can auto pay' });

    const sql = `
      INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status)
      SELECT 'Task Completion Bonus', 'Auto payout: all tasks completed', ?, p.Client_id, u.Id, p.Id, DATE('now'), 'Pending'
      FROM Users u
      JOIN Task_Assignment ta ON u.Id = ta.user_id
      JOIN Task t ON ta.task_id = t.Task_Id
      JOIN Project p ON t.project_id = p.Id
      WHERE p.Id = ?
      GROUP BY u.Id
      HAVING COUNT(t.Task_Id) = SUM(CASE WHEN t.Status = 'done' THEN 1 ELSE 0 END)
      AND NOT EXISTS (
        SELECT 1 FROM Payment pay
        WHERE pay.project_id = p.Id AND pay.recipient_id = u.Id AND pay.status = 'Pending' AND pay.Title = 'Task Completion Bonus'
      )
    `;

    db.run(sql, [amount, projectId], function (eI) {
      if (eI) return res.status(500).json({ error: eI.message });
      res.json({ projectId, inserted: this.changes ?? 0, amount });
    });
  });
};

exports.removeProjectMember = (req, res) => {
  const projectId = Number(req.params.id);
  const userId = Number(req.params.userId);
  const actorId = Number(req.body?.actorId);
  if (!projectId || !userId || !actorId) return res.status(400).json({ message: 'projectId, userId, actorId required' });

  db.get(`SELECT Id, Client_id FROM Project WHERE Id = ?`, [projectId], (eP, p) => {
    if (eP) return res.status(500).json({ error: eP.message });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    if (Number(p.Client_id) === userId) return res.status(400).json({ message: 'Cannot remove project client' });

    const allow = () => {
      db.run(`DELETE FROM Project_Member WHERE user_id = ? AND project_id = ?`, [userId, projectId], function (eD) {
        if (eD) return res.status(500).json({ error: eD.message });
        db.run(
          `DELETE FROM Task_Assignment WHERE user_id = ? AND task_id IN (SELECT Task_Id FROM Task WHERE project_id = ?)`,
          [userId, projectId],
          function (eA) {
            if (eA) return res.status(500).json({ error: eA.message });
            res.json({ removed_member: this.changes ?? 0, removed_assignments: this.changes ?? 0, projectId, userId });
          }
        );
      });
    };

    if (Number(p.Client_id) === actorId) return allow();
    db.get(
      `SELECT role FROM Project_Member WHERE user_id = ? AND project_id = ?`,
      [actorId, projectId],
      (eM, m) => {
        if (eM) return res.status(500).json({ error: eM.message });
        if (m && String(m.role).toLowerCase() === 'manager') return allow();
        res.status(403).json({ message: 'Not authorized' });
      }
    );
  });
};

exports.alertDeadlineMissed = (req, res) => {
  const projectId = Number(req.params.id);
  if (!projectId) return res.status(400).json({ message: 'projectId required' });

  db.get(`SELECT Id, Client_id FROM Project WHERE Id = ?`, [projectId], (eP, p) => {
    if (eP) return res.status(500).json({ error: eP.message });
    if (!p) return res.status(404).json({ message: 'Project not found' });

    db.get(`SELECT Id FROM Users WHERE Email='system@fpms.local' OR FullName='System' LIMIT 1`, (eS, sys) => {
      if (eS) return res.status(500).json({ error: eS.message });
      const systemId = sys ? sys.Id : null;
      if (!systemId) return res.status(500).json({ message: 'System user missing' });

      db.all(
        `SELECT Task_Id, title, Deadline FROM Task WHERE project_id = ? AND Status <> 'done' AND Deadline IS NOT NULL AND DATE(Deadline) < DATE('now')`,
        [projectId],
        (eT, tasks) => {
          if (eT) return res.status(500).json({ error: eT.message });
          if (!Array.isArray(tasks) || tasks.length === 0) return res.json({ projectId, alerts_sent: 0 });

          let pending = tasks.length; let sent = 0; let errOnce = null;
          tasks.forEach(t => {
            db.all(`SELECT u.FullName FROM Task_Assignment ta JOIN Users u ON u.Id = ta.user_id WHERE ta.task_id = ? ORDER BY u.FullName`, [t.Task_Id], (eA, assignees) => {
              if (eA && !errOnce) errOnce = eA;
              const names = (assignees || []).map(a => a.FullName).join(', ');
              const content = `Alert: Task '${t.title}' missed its deadline (${t.Deadline}). Assigned: ${names || '—'}`;
              db.get(
                `SELECT 1 AS exists FROM Message WHERE sender_id = ? AND receiver_id = ? AND project_id = ? AND Content = ? LIMIT 1`,
                [systemId, p.Client_id, projectId, content],
                (eC, existsRow) => {
                  if (eC && !errOnce) errOnce = eC;
                  if (!existsRow) {
                    db.run(
                      `INSERT INTO Message (sender_id, receiver_id, project_id, Content) VALUES (?, ?, ?, ?)`,
                      [systemId, p.Client_id, projectId, content],
                      function (eI) {
                        if (!eI) sent++;
                        if (--pending === 0) {
                          if (errOnce) return res.status(500).json({ error: errOnce.message });
                          res.json({ projectId, alerts_sent: sent });
                        }
                      }
                    );
                  } else {
                    if (--pending === 0) {
                      if (errOnce) return res.status(500).json({ error: errOnce.message });
                      res.json({ projectId, alerts_sent: sent });
                    }
                  }
                }
              );
            });
          });
        }
      );
    });
  });
};
