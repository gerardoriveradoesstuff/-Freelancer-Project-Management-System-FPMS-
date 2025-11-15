const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

function auth(req, res, next) {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "No token" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
}

module.exports = auth;
