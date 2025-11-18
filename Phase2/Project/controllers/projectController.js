const db = require("../db");

exports.createProject = (req, res) => {
    const { title, description, deadline } = req.body;
    const clientId = req.user.id;

    const sql = `INSERT INTO Project (Title, Description, Client_id, Deadline) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [title, description, clientId, deadline], function (err) {
        if (err) return res.status(400).json({ message: "Error creating project" });

        res.json({ projectId: this.lastID, message: "Project created" });
    });
};

exports.getClientProjects = (req, res) => {
    db.all(
        `SELECT * FROM Project WHERE Client_id = ?`,
        [req.user.id],
        (err, rows) => res.json(rows)
    );
};

exports.getAllProjects = (req, res) => {
    db.all(`SELECT * FROM Project`, [], (err, rows) => res.json(rows));
};
