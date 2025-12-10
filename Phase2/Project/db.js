const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "..", "freelance.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error(err.message);
    else {

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
                                        `INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Evelyn Park','evelyn.park@gmail.com','demo','client')`
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
        // Ensure Evelyn's email is updated to gmail for existing databases
        db.run(`UPDATE Users SET Email='evelyn.park@gmail.com' WHERE FullName='Evelyn Park' AND Role='client'`);
        // Mock seeding disabled
    }
});

module.exports = db;

// Lightweight SQL action logging wrappers
function cleanSql(sql) {
  return String(sql || "").replace(/\s+/g, " ").trim();
}

function safeParams(sql, params) {
  const s = String(sql || "");
  if (/password/i.test(s)) return "[masked]";
  try {
    return JSON.stringify(params ?? []);
  } catch {
    return "[unserializable]";
  }
}

const _run = db.run.bind(db);
db.run = function (sql, params, cb) {
  if (typeof params === "function") {
    cb = params;
    params = [];
  }
  const sqlText = cleanSql(sql);
  const paramsText = safeParams(sqlText, params);
  console.log(`[SQL] RUN ${sqlText} params=${paramsText}`);
  return _run(sql, params, function (err) {
    if (err) console.log(`[SQL] RUN ERROR ${err.message}`);
    else console.log(`[SQL] RUN OK changes=${this.changes ?? 0} lastID=${this.lastID ?? ''}`);
    if (typeof cb === "function") cb.call(this, err);
  });
};

const _get = db.get.bind(db);
db.get = function (sql, params, cb) {
  if (typeof params === "function") {
    cb = params;
    params = [];
  }
  const sqlText = cleanSql(sql);
  const paramsText = safeParams(sqlText, params);
  console.log(`[SQL] GET ${sqlText} params=${paramsText}`);
  return _get(sql, params, function (err, row) {
    if (err) console.log(`[SQL] GET ERROR ${err.message}`);
    else console.log(`[SQL] GET OK row=${row ? 1 : 0}`);
    if (typeof cb === "function") cb(err, row);
  });
};

const _all = db.all.bind(db);
db.all = function (sql, params, cb) {
  if (typeof params === "function") {
    cb = params;
    params = [];
  }
  const sqlText = cleanSql(sql);
  const paramsText = safeParams(sqlText, params);
  console.log(`[SQL] ALL ${sqlText} params=${paramsText}`);
  return _all(sql, params, function (err, rows) {
    if (err) console.log(`[SQL] ALL ERROR ${err.message}`);
    else console.log(`[SQL] ALL OK rows=${Array.isArray(rows) ? rows.length : 0}`);
    if (typeof cb === "function") cb(err, rows);
  });
};
