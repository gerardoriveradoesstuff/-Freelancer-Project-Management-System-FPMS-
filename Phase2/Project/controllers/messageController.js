const db = require("../db");

exports.sendMessage = (req, res) => {
    const { receiver_id, project_id, content } = req.body;

    const sql = `INSERT INTO Message (sender_id, receiver_id, project_id, Content)
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [req.user.id, receiver_id, project_id, content], function (err) {
        if (err) return res.status(400).json({ message: "Error sending message" });

        res.json({ message_id: this.lastID });
    });
};

exports.getMessages = (req, res) => {
    db.all(
        `SELECT * FROM Message 
         WHERE (sender_id = ? OR receiver_id = ?)
         ORDER BY Sent_at DESC`,
        [req.user.id, req.user.id],
        (err, rows) => res.json(rows)
    );
};
