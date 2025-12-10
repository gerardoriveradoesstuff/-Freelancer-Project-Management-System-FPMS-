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
