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
