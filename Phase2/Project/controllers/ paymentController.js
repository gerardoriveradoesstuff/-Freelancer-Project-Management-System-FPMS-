const db = require("../db");

exports.createPayment = (req, res) => {
    const { title, description, amount, recipient_id, project_id, payment_date } = req.body;

    const sql = `INSERT INTO Payment 
        (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        sql,
        [title, description, amount, req.user.id, recipient_id, project_id, payment_date],
        function (err) {
            if (err) return res.status(400).json({ message: "Payment error" });

            res.json({ payment_id: this.lastID });
        }
    );
};

exports.getPayments = (req, res) => {
    db.all(
        `SELECT * FROM Payment WHERE Client_id = ? OR recipient_id = ?`,
        [req.user.id, req.user.id],
        (err, rows) => res.json(rows)
    );
};
