const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpire } = require("../config");
 

exports.register = (req, res) => {
    const { fullName, email, password, role } = req.body;

    const hash = bcrypt.hashSync(password, 10);

    const sql = `INSERT INTO Users (FullName, Email, Password, Role) VALUES (?, ?, ?, ?)`;

    db.run(sql, [fullName, email, hash, role], function (err) {
        if (err)
            return res.status(400).json({ message: "Email already exists" });

        res.json({ message: "User registered successfully" });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.get(
        `SELECT * FROM Users WHERE Email = ?`,
        [email],
        (err, user) => {
            if (!user) return res.status(400).json({ message: "User not found" });

            const validPass = bcrypt.compareSync(password, user.Password);
            if (!validPass)
                return res.status(400).json({ message: "Wrong password" });

            const token = jwt.sign(
                { id: user.Id, role: user.Role },
                jwtSecret,
                { expiresIn: jwtExpire }
            );

            res.json({
                message: "Logged in",
                token,
                user: {
                    id: user.Id,
                    fullName: user.FullName,
                    role: user.Role
                }
            });
        }
    );
};

exports.registerSimple = (req, res) => {
    const fullName = req.body.fullname || req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role || 'client';

    const sql = `INSERT INTO Users (FullName, Email, Password, Role) VALUES (?, ?, ?, ?)`;
    db.run(sql, [fullName, email, password, role], function (err) {
        if (err) return res.status(400).json({ message: "Email already exists" });
        res.json({ message: "User registered", userId: this.lastID });
    });
};

exports.loginSimple = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.get(`SELECT * FROM Users WHERE Email = ?`, [email], (err, user) => {
        if (!user) return res.status(400).json({ message: "User not found" });
        if (user.Password !== password) return res.status(400).json({ message: "Wrong password" });
        res.json({ message: "Logged in", user: { id: user.Id, fullName: user.FullName, role: user.Role } });
    });
};

exports.resetPasswordSimple = (req, res) => {
    const email = req.body.email;
    const newPassword = req.body.newPassword;

    db.run(`UPDATE Users SET Password = ? WHERE Email = ?`, [newPassword, email], function (err) {
        if (err) return res.status(400).json({ message: "Reset failed" });
        if (this.changes === 0) return res.status(404).json({ message: "Email not found" });
        res.json({ message: "Password updated" });
    });
};

exports.getUserProfileForViewer = (req, res) => {
  const targetId = Number(req.params.userId);
  const viewerId = Number(req.query.viewerId);
  if (!targetId || !viewerId) return res.status(400).json({ message: 'userId (target) and viewerId required' });

  db.get(`SELECT Id, FullName, Email, Role FROM Users WHERE Id = ?`, [targetId], (eU, userRow) => {
    if (eU) return res.status(500).json({ error: eU.message });
    if (!userRow) return res.status(404).json({ message: 'User not found' });

    db.all(`SELECT s.Skill_Id, s.Name FROM User_Skill us JOIN Skill s ON s.Skill_Id = us.skill_id WHERE us.user_id = ? ORDER BY s.Name`, [targetId], (eS, skills) => {
      if (eS) return res.status(500).json({ error: eS.message });

      const tasksSql = `
        SELECT t.Task_Id, t.title, t.Status, t.priority, t.project_id, p.Title AS project_title
        FROM Task t
        JOIN Task_Assignment ta ON ta.task_id = t.Task_Id
        JOIN Project p ON p.Id = t.project_id
        WHERE ta.user_id = ?
          AND t.project_id IN (
            SELECT pm1.project_id FROM Project_Member pm1 WHERE pm1.user_id = ?
          )
        ORDER BY p.Title, t.title
      `;
      db.all(tasksSql, [targetId, viewerId], (eT, tasks) => {
        if (eT) return res.status(500).json({ error: eT.message });
        res.json({ user: userRow, skills: skills || [], shared_tasks: tasks || [] });
      });
    });
  });
};

exports.getUserReviewsForViewer = (req, res) => {
  const targetId = Number(req.params.userId);
  const viewerId = Number(req.query.viewerId);
  if (!targetId || !viewerId) return res.status(400).json({ message: 'userId (target) and viewerId required' });

  const sql = `
    SELECT r.review_id, r.project_id, p.Title AS project_title, r.reviewer_id, ur.FullName AS reviewer_name, r.Rating, r.Comment, r.Date, r.Type
    FROM Review r
    JOIN Project p ON p.Id = r.project_id
    JOIN Users ur ON ur.Id = r.reviewer_id
    WHERE r.reviewee_id = ?
      AND r.project_id IN (SELECT pm.project_id FROM Project_Member pm WHERE pm.user_id = ?)
    ORDER BY r.Date DESC, r.created_at DESC
  `;
  db.all(sql, [targetId, viewerId], (e, rows) => {
    if (e) return res.status(500).json({ error: e.message });
    res.json(rows || []);
  });
};

exports.addReviewForUser = (req, res) => {
  const revieweeId = Number(req.params.userId);
  const reviewerId = Number(req.body?.reviewerId);
  const projectId = Number(req.body?.projectId);
  const rating = Number(req.body?.rating);
  const comment = String(req.body?.comment || '').trim();
  if (!revieweeId || !reviewerId || !projectId || !rating || rating < 1 || rating > 5 || !comment) return res.status(400).json({ message: 'reviewerId, projectId, rating(1-5), comment required' });

  db.get(`SELECT Id FROM Project WHERE Id = ?`, [projectId], (eP, p) => {
    if (eP) return res.status(500).json({ error: eP.message });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    db.get(`SELECT 1 FROM Project_Member WHERE project_id = ? AND user_id = ?`, [projectId, reviewerId], (eR, r) => {
      if (eR) return res.status(500).json({ error: eR.message });
      if (!r) return res.status(403).json({ message: 'Reviewer must be a member of the project' });
      db.get(`SELECT 1 FROM Project_Member WHERE project_id = ? AND user_id = ?`, [projectId, revieweeId], (eV, v) => {
        if (eV) return res.status(500).json({ error: eV.message });
        if (!v) return res.status(400).json({ message: 'Reviewee must be a member of the project' });
        db.get(`SELECT Role FROM Users WHERE Id = ?`, [reviewerId], (eRoleR, roleR) => {
          if (eRoleR) return res.status(500).json({ error: eRoleR.message });
          db.get(`SELECT Role FROM Users WHERE Id = ?`, [revieweeId], (eRoleV, roleV) => {
            if (eRoleV) return res.status(500).json({ error: eRoleV.message });
            const reviewerRole = String(roleR?.Role || '').toLowerCase();
            const revieweeRole = String(roleV?.Role || '').toLowerCase();
            const type = reviewerRole === 'client' && revieweeRole === 'freelancer' ? 'client_to_freelancer' : 'freelancer_to_client';
            db.run(
              `INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (?, ?, ?, ?, ?, DATE('now'), ?)`,
              [projectId, reviewerId, revieweeId, rating, comment, type],
              function (eI) {
                if (eI) return res.status(500).json({ error: eI.message });
                res.json({ review_id: this.lastID });
              }
            );
          });
        });
      });
    });
  });
};
