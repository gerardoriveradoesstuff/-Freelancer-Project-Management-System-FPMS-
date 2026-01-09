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

exports.sendMessageSimpleAndMarkRead = (req, res) => {
  const senderId = Number(req.body?.senderId);
  const receiverId = Number(req.body?.receiverId);
  const projectId = req.body?.projectId === undefined ? null : req.body?.projectId;
  const content = String(req.body?.content || '').trim();
  if (!senderId || !receiverId || !content) return res.status(400).json({ message: 'senderId, receiverId, content required' });

  const markParams = [senderId, receiverId];
  let markSql = `UPDATE Message SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`;
  if (projectId !== null && projectId !== undefined) { markSql += ` AND project_id = ?`; markParams.push(projectId); }

  db.run(markSql, markParams, function (updateErr) {
    if (updateErr) return res.status(400).json({ message: 'Mark read failed' });
    const updated = this.changes || 0;
    db.run(
      `INSERT INTO Message (sender_id, receiver_id, project_id, Content) VALUES (?, ?, ?, ?)`,
      [senderId, receiverId, projectId, content],
      function (insertErr) {
        if (insertErr) return res.status(400).json({ message: 'Send message failed' });
        res.json({ message_id: this.lastID, marked_read: updated });
      }
    );
  });
};
