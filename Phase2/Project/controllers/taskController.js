const db = require("../db");

exports.createTask = (req, res) => {
    const { project_id, title, description, deadline, priority } = req.body;

    const sql = `INSERT INTO Task 
                 (project_id, title, Description, Deadline, priority) 
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [project_id, title, description, deadline, priority], function (err) {
        if (err) return res.status(400).json({ message: "Error creating task" });

        res.json({ task_id: this.lastID });
    });
};

exports.getProjectTasks = (req, res) => {
    db.all(
        `SELECT * FROM Task WHERE project_id = ?`,
        [req.params.id],
        (err, rows) => res.json(rows)
    );
};
