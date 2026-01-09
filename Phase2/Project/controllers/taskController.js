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

exports.completeTaskAndPay = (req, res) => {
    const taskId = Number(req.params.taskId);
    const actorId = Number(req.body?.actorId);
    const amount = Number(req.body?.amount);
    const recipientIdBody = req.body?.recipientId ? Number(req.body.recipientId) : null;
    if (!taskId || !actorId || !amount || amount <= 0) return res.status(400).json({ message: 'taskId, actorId, positive amount required' });

    db.get(`SELECT Task_Id, project_id FROM Task WHERE Task_Id = ?`, [taskId], (eT, t) => {
        if (eT) return res.status(500).json({ error: eT.message });
        if (!t) return res.status(404).json({ message: 'Task not found' });
        db.get(`SELECT Client_id FROM Project WHERE Id = ?`, [t.project_id], (eP, p) => {
            if (eP) return res.status(500).json({ error: eP.message });
            if (!p) return res.status(404).json({ message: 'Project not found' });
            if (Number(p.Client_id) !== actorId) return res.status(403).json({ message: 'Only project client can pay for a task' });

            db.run(`UPDATE Task SET Status = 'done' WHERE Task_Id = ?`, [taskId], function (eU) {
                if (eU) return res.status(500).json({ error: eU.message });

                const pickRecipient = (cb) => {
                    if (recipientIdBody) return cb(null, recipientIdBody);
                    db.get(`SELECT user_id FROM Task_Assignment WHERE task_id = ? ORDER BY assigned_at DESC LIMIT 1`, [taskId], (eA, a) => cb(eA, a ? a.user_id : null));
                };

                pickRecipient((eR, recipientId) => {
                    if (eR) return res.status(500).json({ error: eR.message });
                    db.run(
                        `INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Task Payment', 'Task completion payout', ?, ?, ?, ?, DATE('now'), 'Pending')`,
                        [amount, p.Client_id, recipientId, t.project_id],
                        function (ePay) {
                            if (ePay) return res.status(500).json({ error: ePay.message });
                            res.json({ paid_task: taskId, payment_id: this.lastID, recipient_id: recipientId });
                        }
                    );
                });
            });
        });
    });
};

exports.createTaskAndAssign = (req, res) => {
    const { actorId, project_id, title, description, deadline, priority, assigneeId } = req.body;
    const pid = Number(project_id);
    const aid = Number(actorId);
    const uid = Number(assigneeId);
    if (!pid || !aid || !uid || !title || !description) return res.status(400).json({ message: 'actorId, project_id, assigneeId, title, description required' });

    db.get(`SELECT Client_id FROM Project WHERE Id = ?`, [pid], (eP, p) => {
        if (eP) return res.status(500).json({ error: eP.message });
        if (!p) return res.status(404).json({ message: 'Project not found' });
        const allowOr403 = (ok) => ok ? null : res.status(403).json({ message: 'Not authorized to create/assign tasks' });
        if (Number(p.Client_id) === aid) {} else {
            return db.get(`SELECT role FROM Project_Member WHERE project_id = ? AND user_id = ?`, [pid, aid], (eR, r) => {
                if (eR) return res.status(500).json({ error: eR.message });
                if (!r || String(r.role).toLowerCase() !== 'manager') return allowOr403(false);
                proceed();
            });
        }
        function proceed() {
        db.get(`SELECT 1 FROM Project_Member WHERE project_id = ? AND user_id = ?`, [pid, uid], (eM, m) => {
            if (eM) return res.status(500).json({ error: eM.message });
            if (!m) return res.status(400).json({ message: 'Assignee must be a member of the project' });
            db.run(
                `INSERT INTO Task (project_id, title, Description, Deadline, priority) VALUES (?, ?, ?, ?, ?)`,
                [pid, title, description, deadline || null, priority || 'Medium'],
                function (eT) {
                    if (eT) return res.status(500).json({ error: eT.message });
                    const taskId = this.lastID;
                    db.run(`INSERT INTO Task_Assignment (user_id, task_id) VALUES (?, ?)`, [uid, taskId], function (eA) {
                        if (eA) return res.status(500).json({ error: eA.message });
                        res.json({ task_id: taskId, assignee_id: uid });
                    });
                }
            );
        });
        }
    });
};

exports.assignTask = (req, res) => {
    const taskId = Number(req.params.taskId);
    const actorId = Number(req.body?.actorId);
    const assigneeId = Number(req.body?.assigneeId);
    const assigneeIds = Array.isArray(req.body?.assigneeIds) ? req.body.assigneeIds.map(Number).filter(Boolean) : null;
    const targetIds = assigneeIds && assigneeIds.length ? assigneeIds : (assigneeId ? [assigneeId] : []);
    if (!taskId || !actorId || !targetIds.length) return res.status(400).json({ message: 'taskId, actorId, assigneeIds required' });

    db.get(`SELECT Task_Id, project_id FROM Task WHERE Task_Id = ?`, [taskId], (eT, t) => {
        if (eT) return res.status(500).json({ error: eT.message });
        if (!t) return res.status(404).json({ message: 'Task not found' });

        db.get(`SELECT Client_id FROM Project WHERE Id = ?`, [t.project_id], (eP, p) => {
            if (eP) return res.status(500).json({ error: eP.message });
            if (!p) return res.status(404).json({ message: 'Project not found' });

            const authorize = (cb) => {
                if (Number(p.Client_id) === actorId) return cb();
                db.get(`SELECT role FROM Project_Member WHERE project_id = ? AND user_id = ?`, [t.project_id, actorId], (eR, r) => {
                    if (eR) return res.status(500).json({ error: eR.message });
                    if (!r || String(r.role).toLowerCase() !== 'manager') return res.status(403).json({ message: 'Not authorized to assign tasks' });
                    cb();
                });
            };

            const proceed = () => {
                const placeholders = targetIds.map(() => '?').join(',');
                const validateMembersSql = `SELECT user_id FROM Project_Member WHERE project_id = ? AND user_id IN (${placeholders})`;
                db.all(validateMembersSql, [t.project_id, ...targetIds], (eM, rows) => {
                    if (eM) return res.status(500).json({ error: eM.message });
                    const validSet = new Set((rows || []).map(r => r.user_id));
                    const invalid = targetIds.filter(id => !validSet.has(id));
                    if (invalid.length) return res.status(400).json({ message: 'All assignees must be members of the project' });

                    db.all(`SELECT user_id FROM Task_Assignment WHERE task_id = ?`, [taskId], (eC, current) => {
                        if (eC) return res.status(500).json({ error: eC.message });
                        const currentSet = new Set((current || []).map(r => r.user_id));
                        const toInsert = targetIds.filter(id => !currentSet.has(id));
                        const toDelete = Array.from(currentSet).filter(id => !validSet.has(id) || !targetIds.includes(id));

                        const doDelete = (cb) => {
                            if (!toDelete.length) return cb();
                            const delPlaceholders = toDelete.map(() => '?').join(',');
                            const delSql = `DELETE FROM Task_Assignment WHERE task_id = ? AND user_id IN (${delPlaceholders})`;
                            db.run(delSql, [taskId, ...toDelete], function (eD) {
                                if (eD) return res.status(500).json({ error: eD.message });
                                cb();
                            });
                        };

                        doDelete(() => {
                            if (!toInsert.length) return res.json({ task_id: taskId, assignee_ids: targetIds });
                            let pending = toInsert.length; let errOnce = null;
                            toInsert.forEach(id => {
                                db.run(`INSERT OR IGNORE INTO Task_Assignment (user_id, task_id) VALUES (?, ?)`, [id, taskId], function (eA) {
                                    if (eA && !errOnce) errOnce = eA;
                                    if (--pending === 0) {
                                        if (errOnce) return res.status(500).json({ error: errOnce.message });
                                        res.json({ task_id: taskId, assignee_ids: targetIds });
                                    }
                                });
                            });
                        });
                    });
                });
            };

            authorize(proceed);
        });
    });
};

exports.getTaskAssignees = (req, res) => {
    const taskId = Number(req.params.taskId);
    if (!taskId) return res.status(400).json([]);
    db.all(
        `SELECT u.Id, u.FullName, u.Email FROM Task_Assignment ta JOIN Users u ON u.Id = ta.user_id WHERE ta.task_id = ? ORDER BY u.FullName`,
        [taskId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        }
    );
};
