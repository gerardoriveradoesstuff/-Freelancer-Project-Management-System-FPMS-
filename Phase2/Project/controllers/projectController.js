const db = require('../db');

exports.createProject = (req, res) => {
    const { title, description, deadline, clientId } = req.body;

    db.run('INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES (?, ?, ?, ?, ?)', [title, description, clientId, deadline, 'active'], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const projectId = this.lastID;
        const tasks = [
            { title: 'Planning', description: 'Plan project phases', deadline: deadline },
            { title: 'Development', description: 'Code features', deadline: deadline },
            { title: 'Testing', description: 'Test complete system', deadline: deadline }
        ];

        const placeholders = tasks.map(() => '(?, ?, ?, ?)').join(',');
        const values = tasks.reduce((acc, task) => acc.concat([projectId, task.title, task.description, task.deadline]), []);

        db.run(`INSERT INTO Task (project_id, title, Description, Deadline) VALUES ${placeholders}`, values, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Project and tasks created successfully', projectId });
        });
    });
};