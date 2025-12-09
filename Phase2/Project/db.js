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
        if (process.env.SEED_MOCK === '1') {
            const mockSql = `
INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Client One','client1@example.com','demo','client');
INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Client Two','client2@example.com','demo','client');
INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Freelancer One','freelancer1@example.com','demo','freelancer');
INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Freelancer Two','freelancer2@example.com','demo','freelancer');
INSERT OR IGNORE INTO Users (FullName, Email, Password, Role) VALUES ('Freelancer Three','freelancer3@example.com','demo','freelancer');

INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('Web Development','Frontend and backend web development');
INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('UI/UX Design','User interface and experience');
INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('Mobile Development','iOS and Android');
INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('Data Analysis','SQL and visualization');
INSERT OR IGNORE INTO Skill (Name, Description) VALUES ('DevOps','CI/CD and cloud');

INSERT OR IGNORE INTO User_Skill (user_id, skill_id)
SELECT u.Id, s.Skill_Id FROM Users u, Skill s WHERE u.Email='freelancer1@example.com' AND s.Name IN ('Web Development','DevOps');
INSERT OR IGNORE INTO User_Skill (user_id, skill_id)
SELECT u.Id, s.Skill_Id FROM Users u, Skill s WHERE u.Email='freelancer2@example.com' AND s.Name IN ('UI/UX Design','Web Development');
INSERT OR IGNORE INTO User_Skill (user_id, skill_id)
SELECT u.Id, s.Skill_Id FROM Users u, Skill s WHERE u.Email='freelancer3@example.com' AND s.Name IN ('Mobile Development','Data Analysis');

INSERT INTO Project (Title, Description, Client_id, Deadline, Status)
SELECT 'Website Revamp','Redesign corporate site with CMS',(SELECT Id FROM Users WHERE Email='client1@example.com'),'2026-01-15','active'
WHERE NOT EXISTS (SELECT 1 FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com'));
INSERT INTO Project (Title, Description, Client_id, Deadline, Status)
SELECT 'Mobile App MVP','Build cross-platform MVP',(SELECT Id FROM Users WHERE Email='client1@example.com'),'2026-02-01','pending'
WHERE NOT EXISTS (SELECT 1 FROM Project WHERE Title='Mobile App MVP' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com'));
INSERT INTO Project (Title, Description, Client_id, Deadline, Status)
SELECT 'Data Dashboard','Interactive analytics dashboard',(SELECT Id FROM Users WHERE Email='client2@example.com'),'2026-01-20','active'
WHERE NOT EXISTS (SELECT 1 FROM Project WHERE Title='Data Dashboard' AND Client_id=(SELECT Id FROM Users WHERE Email='client2@example.com'));

INSERT OR IGNORE INTO Project_Member (user_id, project_id, role)
SELECT (SELECT Id FROM Users WHERE Email='freelancer1@example.com'), (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Manager';
INSERT OR IGNORE INTO Project_Member (user_id, project_id, role)
SELECT (SELECT Id FROM Users WHERE Email='freelancer2@example.com'), (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Contributor';
INSERT OR IGNORE INTO Project_Member (user_id, project_id, role)
SELECT (SELECT Id FROM Users WHERE Email='freelancer3@example.com'), (SELECT Id FROM Project WHERE Title='Mobile App MVP' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Manager';
INSERT OR IGNORE INTO Project_Member (user_id, project_id, role)
SELECT (SELECT Id FROM Users WHERE Email='freelancer1@example.com'), (SELECT Id FROM Project WHERE Title='Data Dashboard' AND Client_id=(SELECT Id FROM Users WHERE Email='client2@example.com')), 'Manager';

INSERT INTO Task (project_id, title, Description, Deadline, priority, Status)
SELECT (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Design mockups','Create high-fidelity designs','2026-01-05','High','in_progress'
WHERE NOT EXISTS (SELECT 1 FROM Task WHERE title='Design mockups' AND project_id=(SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')));
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status)
SELECT (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Build CMS','Implement content management','2026-01-10','Medium','todo'
WHERE NOT EXISTS (SELECT 1 FROM Task WHERE title='Build CMS' AND project_id=(SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')));
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status)
SELECT (SELECT Id FROM Project WHERE Title='Mobile App MVP' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'API integration','Connect to backend APIs','2026-01-25','Medium','todo'
WHERE NOT EXISTS (SELECT 1 FROM Task WHERE title='API integration' AND project_id=(SELECT Id FROM Project WHERE Title='Mobile App MVP' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')));
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status)
SELECT (SELECT Id FROM Project WHERE Title='Data Dashboard' AND Client_id=(SELECT Id FROM Users WHERE Email='client2@example.com')), 'ETL pipeline','Prepare and load data','2026-01-12','High','in_progress'
WHERE NOT EXISTS (SELECT 1 FROM Task WHERE title='ETL pipeline' AND project_id=(SELECT Id FROM Project WHERE Title='Data Dashboard' AND Client_id=(SELECT Id FROM Users WHERE Email='client2@example.com')));

INSERT INTO Message (sender_id, receiver_id, project_id, Content)
SELECT (SELECT Id FROM Users WHERE Email='client1@example.com'), (SELECT Id FROM Users WHERE Email='freelancer1@example.com'), (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Hi, can you share the latest mockups?'
WHERE NOT EXISTS (SELECT 1 FROM Message WHERE Content='Hi, can you share the latest mockups?');
INSERT INTO Message (sender_id, receiver_id, project_id, Content)
SELECT (SELECT Id FROM Users WHERE Email='freelancer1@example.com'), (SELECT Id FROM Users WHERE Email='client1@example.com'), (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')), 'Sure, uploading them today.'
WHERE NOT EXISTS (SELECT 1 FROM Message WHERE Content='Sure, uploading them today.');

INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status)
SELECT 'Initial deposit','Kickoff payment', 500.00,
       (SELECT Id FROM Users WHERE Email='client1@example.com'),
       (SELECT Id FROM Users WHERE Email='freelancer1@example.com'),
       (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')),
       DATE('now'), 'Completed'
WHERE NOT EXISTS (SELECT 1 FROM Payment WHERE Title='Initial deposit' AND project_id=(SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')));

INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type)
SELECT (SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')),
       (SELECT Id FROM Users WHERE Email='client1@example.com'),
       (SELECT Id FROM Users WHERE Email='freelancer1@example.com'),
       5,'Great work on the redesign','2026-01-16','client_to_freelancer'
WHERE NOT EXISTS (
  SELECT 1 FROM Review WHERE project_id=(SELECT Id FROM Project WHERE Title='Website Revamp' AND Client_id=(SELECT Id FROM Users WHERE Email='client1@example.com')) AND reviewer_id=(SELECT Id FROM Users WHERE Email='client1@example.com') AND reviewee_id=(SELECT Id FROM Users WHERE Email='freelancer1@example.com') AND Type='client_to_freelancer'
);
`;
            db.exec(mockSql, (e2) => {
                if (e2) console.error("Mock seed error", e2.message);
                else console.log("Mock seed done");
            });
        }
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
