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
            db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [freelancerId, projectId]);
          } else if (freelancerEmail) {
            db.get(`SELECT Id FROM Users WHERE Email = ? AND Role='freelancer'`, [freelancerEmail], (ge, row) => {
              if (!ge && row) db.run(`INSERT OR IGNORE INTO Project_Member (user_id, project_id, role) VALUES (?, ?, 'Contributor')`, [row.Id, projectId]);
            });
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
