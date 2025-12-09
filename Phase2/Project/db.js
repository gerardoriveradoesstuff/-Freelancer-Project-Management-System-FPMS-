const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error(err.message);
    else {
        console.log("Connected to SQLite DB");

        const schemaPath = path.join(__dirname, "schema.sql");
        if (fs.existsSync(schemaPath)) {
            try {
                const schemaSql = fs.readFileSync(schemaPath, "utf8");
                db.exec(schemaSql, (e) => {
                    if (e) console.error("Schema error", e.message);
                    else {
                        db.get("SELECT COUNT(*) AS cnt FROM Users", (ue, row) => {
                            if (!ue && row && row.cnt === 0) {
                                db.serialize(() => {
                                    db.run(
                                        `INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Evelyn Park','evelyn@class.test','demo','client')`
                                    );
                                    db.get(`SELECT Id FROM Users WHERE FullName='Evelyn Park'`, (ge, c) => {
                                        if (c) {
                                            db.run(
                                                `INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Website Redesign','Update UI for homepage', ?, DATE('now','+30 day'),'active')`,
                                                [c.Id]
                                            );
                                            db.run(
                                                `INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Client Portal Upgrade','Add self-service features', ?, DATE('now','+60 day'),'pending')`,
                                                [c.Id]
                                            );
                                            db.get(`SELECT Id FROM Project WHERE Title='Website Redesign' AND Client_id = ?`, [c.Id], (e1, p1) => {
                                                if (p1)
                                                    db.run(
                                                        `INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'Design homepage','Design layout', DATE('now','+10 day'),'High','in_progress')`,
                                                        [p1.Id]
                                                    );
                                            });
                                            db.get(`SELECT Id FROM Project WHERE Title='Client Portal Upgrade' AND Client_id = ?`, [c.Id], (e2, p2) => {
                                                if (p2)
                                                    db.run(
                                                        `INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (?, 'API integration','Connect backend', DATE('now','+20 day'),'Medium','todo')`,
                                                        [p2.Id]
                                                    );
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            } catch (readErr) {
                console.error("Failed to read schema.sql", readErr.message);
            }
        }
    }
});

module.exports = db;
