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
