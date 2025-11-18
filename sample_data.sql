PRAGMA foreign_keys = ON;

-- SCHEMA (CREATE TABLE statements)

CREATE TABLE IF NOT EXISTS Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role TEXT NOT NULL CHECK(Role IN ('client', 'freelancer', 'admin'))
);

CREATE TABLE IF NOT EXISTS Skill (
    Skill_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL UNIQUE,
    Description VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS Project (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Client_id INT,
    Deadline DATE,
    Status TEXT DEFAULT 'pending' CHECK(Status IN ('pending', 'active', 'completed', 'cancelled')),
    FOREIGN KEY (Client_id) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS User_Skill (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skill(Skill_Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Task (
    Task_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    Deadline DATE,
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status TEXT DEFAULT 'todo' CHECK(Status IN ('todo', 'in_progress', 'done')),
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Project_Member (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role TEXT DEFAULT 'Contributor' CHECK(role IN ('Manager', 'Contributor')),
    FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE CASCADE,
    UNIQUE (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS Message (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    project_id INT,
    Content TEXT NOT NULL,
    Sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Payment (
    Payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(255),
    Description TEXT,
    Amount DECIMAL(10, 2) NOT NULL,
    Client_id INT,
    recipient_id INT,
    project_id INT,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Completed', 'Failed')),
    FOREIGN KEY (Client_id) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (recipient_id) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Review (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Comment TEXT,
    Date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Type TEXT CHECK(Type IN ('client_to_freelancer', 'freelancer_to_client')),
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Task_Assignment (
  user_id INT,
  task_id INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, task_id),
  FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES Task(Task_Id) ON DELETE CASCADE
);


-- INSERT USERS

INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Alice Johnson', 'alice.johnson@example.com', 'hashed_pw_1', 'client');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Brian Carter', 'brian.carter@example.com', 'hashed_pw_2', 'client');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Cassandra Liu', 'cassandra.liu@example.com', 'hashed_pw_3', 'client');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Diego Morales', 'diego.morales@example.com', 'client_pw_4', 'client');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Evelyn Park', 'evelyn.park@example.com', 'client_pw_5', 'client');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Frank Nguyen', 'frank.nguyen@example.com', 'freelancer_pw_6', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Grace Kim', 'grace.kim@example.com', 'freelancer_pw_7', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Hector Alvarez', 'hector.alvarez@example.com', 'freelancer_pw_8', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Ivy Chen', 'ivy.chen@example.com', 'freelancer_pw_9', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Jason Patel', 'jason.patel@example.com', 'freelancer_pw_10', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Kelly O''Neil', 'kelly.oneil@example.com', 'freelancer_pw_11', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Liam Brooks', 'liam.brooks@example.com', 'freelancer_pw_12', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Maya Singh', 'maya.singh@example.com', 'freelancer_pw_13', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Noah Wright', 'noah.wright@example.com', 'freelancer_pw_14', 'freelancer');
INSERT INTO Users (FullName, Email, Password, Role) VALUES ('Admin User', 'admin@example.com', 'admin_pw_15', 'admin');

-- INSERT SKILLS

INSERT INTO Skill (Name, Description) VALUES ('Web Development', 'Frontend and backend development (React, Node.js, REST APIs)');
INSERT INTO Skill (Name, Description) VALUES ('UI/UX Design', 'User interface and experience design, prototyping');
INSERT INTO Skill (Name, Description) VALUES ('Mobile Development', 'iOS and Android app development, Flutter/React Native');
INSERT INTO Skill (Name, Description) VALUES ('Graphic Design', 'Branding, logos, print & digital assets');
INSERT INTO Skill (Name, Description) VALUES ('Data Analysis', 'Data cleaning, visualization, Python, SQL');
INSERT INTO Skill (Name, Description) VALUES ('SEO', 'Search engine optimization and content strategy');
INSERT INTO Skill (Name, Description) VALUES ('Content Writing', 'Blog posts, marketing copy, technical writing');
INSERT INTO Skill (Name, Description) VALUES ('DevOps', 'CI/CD, Docker, AWS, server management');
INSERT INTO Skill (Name, Description) VALUES ('QA Testing', 'Test plans, automated and manual testing');
INSERT INTO Skill (Name, Description) VALUES ('Illustration', 'Custom illustrations and iconography');
INSERT INTO Skill (Name, Description) VALUES ('Database Design', 'Schema design, SQL optimization');
INSERT INTO Skill (Name, Description) VALUES ('Social Media', 'Campaigns, scheduling, analytics');
INSERT INTO Skill (Name, Description) VALUES ('Motion Graphics', 'Short animations and explainer videos');
INSERT INTO Skill (Name, Description) VALUES ('Accessibility', 'WCAG compliance and accessible design');
INSERT INTO Skill (Name, Description) VALUES ('Product Management', 'Roadmapping, requirements, stakeholder communication');

-- ASSIGN SKILLS TO USERS (User_Skill)

INSERT INTO User_Skill (user_id, skill_id) VALUES (1, 1);
INSERT INTO User_Skill (user_id, skill_id) VALUES (2, 4);
INSERT INTO User_Skill (user_id, skill_id) VALUES (2, 15);
INSERT INTO User_Skill (user_id, skill_id) VALUES (3, 12);
INSERT INTO User_Skill (user_id, skill_id) VALUES (4, 11);
INSERT INTO User_Skill (user_id, skill_id) VALUES (5, 10);
INSERT INTO User_Skill (user_id, skill_id) VALUES (6, 1);
INSERT INTO User_Skill (user_id, skill_id) VALUES (6, 15);
INSERT INTO User_Skill (user_id, skill_id) VALUES (6, 2);
INSERT INTO User_Skill (user_id, skill_id) VALUES (7, 4);
INSERT INTO User_Skill (user_id, skill_id) VALUES (7, 9);
INSERT INTO User_Skill (user_id, skill_id) VALUES (8, 9);
INSERT INTO User_Skill (user_id, skill_id) VALUES (8, 4);
INSERT INTO User_Skill (user_id, skill_id) VALUES (9, 4);
INSERT INTO User_Skill (user_id, skill_id) VALUES (9, 8);
INSERT INTO User_Skill (user_id, skill_id) VALUES (9, 10);
INSERT INTO User_Skill (user_id, skill_id) VALUES (10, 13);
INSERT INTO User_Skill (user_id, skill_id) VALUES (10, 14);
INSERT INTO User_Skill (user_id, skill_id) VALUES (10, 1);
INSERT INTO User_Skill (user_id, skill_id) VALUES (11, 12);
INSERT INTO User_Skill (user_id, skill_id) VALUES (11, 7);
INSERT INTO User_Skill (user_id, skill_id) VALUES (12, 5);
INSERT INTO User_Skill (user_id, skill_id) VALUES (12, 3);
INSERT INTO User_Skill (user_id, skill_id) VALUES (12, 4);
INSERT INTO User_Skill (user_id, skill_id) VALUES (13, 2);
INSERT INTO User_Skill (user_id, skill_id) VALUES (13, 15);
INSERT INTO User_Skill (user_id, skill_id) VALUES (13, 7);
INSERT INTO User_Skill (user_id, skill_id) VALUES (14, 6);
INSERT INTO User_Skill (user_id, skill_id) VALUES (14, 14);
INSERT INTO User_Skill (user_id, skill_id) VALUES (15, 6);
INSERT INTO User_Skill (user_id, skill_id) VALUES (15, 10);

-- INSERT PROJECTS

INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Alice''s Project 1', 'Alice''s Project 1: redesign for Q4 campaign', 1, '2026-02-17', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Alice''s Project 2', 'Alice''s Project 2: redesign for Q4 campaign', 1, '2026-01-03', 'pending');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Alice''s Project 3', 'Alice''s Project 3: mobile app MVP', 1, '2026-02-04', 'completed');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Alice''s Project 4', 'Alice''s Project 4: mobile app MVP', 1, '2026-01-28', 'pending');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Brian''s Project 1', 'Brian''s Project 1: redesign for Q4 campaign', 2, '2026-02-08', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Brian''s Project 2', 'Brian''s Project 2: mobile app MVP', 2, '2025-11-26', 'completed');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Brian''s Project 3', 'Brian''s Project 3: redesign for Q4 campaign', 2, '2026-01-03', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Cassandra''s Project 1', 'Cassandra''s Project 1: marketing landing page', 3, '2026-01-02', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Cassandra''s Project 2', 'Cassandra''s Project 2: mobile app MVP', 3, '2026-02-13', 'cancelled');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Cassandra''s Project 3', 'Cassandra''s Project 3: redesign for Q4 campaign', 3, '2026-02-01', 'completed');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Cassandra''s Project 4', 'Cassandra''s Project 4: data analysis and dashboard', 3, '2026-02-17', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Diego''s Project 1', 'Diego''s Project 1: branding package', 4, '2025-12-20', 'cancelled');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Diego''s Project 2', 'Diego''s Project 2: data analysis and dashboard', 4, '2025-12-14', 'completed');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Diego''s Project 3', 'Diego''s Project 3: redesign for Q4 campaign', 4, '2025-12-15', 'completed');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Diego''s Project 4', 'Diego''s Project 4: mobile app MVP', 4, '2026-01-06', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Evelyn''s Project 1', 'Evelyn''s Project 1: data analysis and dashboard', 5, '2026-02-15', 'active');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Evelyn''s Project 2', 'Evelyn''s Project 2: branding package', 5, '2026-01-05', 'completed');
INSERT INTO Project (Title, Description, Client_id, Deadline, Status) VALUES ('Evelyn''s Project 3', 'Evelyn''s Project 3: branding package', 5, '2025-12-04', 'active');

-- INSERT PROJECT_MEMBERS

INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 1, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 1, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 2, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 2, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 2, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 2, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (6, 3, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 3, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (8, 4, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 4, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 4, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (6, 4, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (13, 5, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 5, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 5, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 6, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 6, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 6, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 6, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 7, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 7, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (6, 8, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 8, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (13, 8, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 9, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 9, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 9, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 9, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 10, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (8, 10, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 11, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (13, 11, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (6, 11, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 11, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (9, 12, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (6, 12, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 12, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 13, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (13, 13, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (8, 14, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 14, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 14, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (9, 14, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 15, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (12, 15, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 15, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (9, 16, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (10, 16, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 16, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 16, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (14, 17, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (13, 17, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (6, 17, 'Contributor');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (7, 18, 'Manager');
INSERT INTO Project_Member (user_id, project_id, role) VALUES (11, 18, 'Contributor');

-- INSERT TASKS

INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (1, 'Produce marketing assets', 'Produce marketing assets for Alice''s Project 1. Deliverable includes specs and review notes.', '2026-01-20', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (1, 'Create wireframes', 'Create wireframes for Alice''s Project 1. Deliverable includes specs and review notes.', '2026-01-19', 'Low', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (1, 'Conduct user interviews', 'Conduct user interviews for Alice''s Project 1. Deliverable includes specs and review notes.', '2026-02-08', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (2, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Alice''s Project 2. Deliverable includes specs and review notes.', '2025-12-18', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (2, 'Produce marketing assets', 'Produce marketing assets for Alice''s Project 2. Deliverable includes specs and review notes.', '2025-11-04', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (2, 'Build API endpoints', 'Build API endpoints for Alice''s Project 2. Deliverable includes specs and review notes.', '2025-12-10', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (2, 'Conduct user interviews', 'Conduct user interviews for Alice''s Project 2. Deliverable includes specs and review notes.', '2025-11-10', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (2, 'Create wireframes', 'Create wireframes for Alice''s Project 2. Deliverable includes specs and review notes.', '2025-12-22', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (3, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Alice''s Project 3. Deliverable includes specs and review notes.', '2026-01-11', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (3, 'Build API endpoints', 'Build API endpoints for Alice''s Project 3. Deliverable includes specs and review notes.', '2026-01-12', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (4, 'Integrate payment gateway', 'Integrate payment gateway for Alice''s Project 4. Deliverable includes specs and review notes.', '2025-11-19', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (4, 'Optimize SEO', 'Optimize SEO for Alice''s Project 4. Deliverable includes specs and review notes.', '2026-01-27', 'High', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (5, 'Implement homepage', 'Implement homepage for Brian''s Project 1. Deliverable includes specs and review notes.', '2025-12-18', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (5, 'Build API endpoints', 'Build API endpoints for Brian''s Project 1. Deliverable includes specs and review notes.', '2026-02-01', 'Low', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (5, 'Build API endpoints', 'Build API endpoints for Brian''s Project 1. Deliverable includes specs and review notes.', '2026-01-06', 'High', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (6, 'Build API endpoints', 'Build API endpoints for Brian''s Project 2. Deliverable includes specs and review notes.', '2025-11-04', 'High', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (6, 'Optimize SEO', 'Optimize SEO for Brian''s Project 2. Deliverable includes specs and review notes.', '2025-11-05', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (6, 'Write unit tests', 'Write unit tests for Brian''s Project 2. Deliverable includes specs and review notes.', '2025-11-20', 'High', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (6, 'Optimize SEO', 'Optimize SEO for Brian''s Project 2. Deliverable includes specs and review notes.', '2025-11-25', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (7, 'Optimize SEO', 'Optimize SEO for Brian''s Project 3. Deliverable includes specs and review notes.', '2025-12-14', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (7, 'Implement homepage', 'Implement homepage for Brian''s Project 3. Deliverable includes specs and review notes.', '2025-12-26', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (7, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Brian''s Project 3. Deliverable includes specs and review notes.', '2025-11-13', 'Low', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (7, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Brian''s Project 3. Deliverable includes specs and review notes.', '2025-12-29', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (7, 'Produce marketing assets', 'Produce marketing assets for Brian''s Project 3. Deliverable includes specs and review notes.', '2025-11-24', 'High', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (8, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Cassandra''s Project 1. Deliverable includes specs and review notes.', '2025-12-17', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (8, 'Write unit tests', 'Write unit tests for Cassandra''s Project 1. Deliverable includes specs and review notes.', '2025-12-04', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (8, 'Design hero section', 'Design hero section for Cassandra''s Project 1. Deliverable includes specs and review notes.', '2026-01-02', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (8, 'Design hero section', 'Design hero section for Cassandra''s Project 1. Deliverable includes specs and review notes.', '2025-12-29', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (9, 'Conduct user interviews', 'Conduct user interviews for Cassandra''s Project 2. Deliverable includes specs and review notes.', '2026-02-05', 'High', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (9, 'Implement homepage', 'Implement homepage for Cassandra''s Project 2. Deliverable includes specs and review notes.', '2025-12-19', 'High', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (9, 'Produce marketing assets', 'Produce marketing assets for Cassandra''s Project 2. Deliverable includes specs and review notes.', '2025-11-02', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (10, 'Design hero section', 'Design hero section for Cassandra''s Project 3. Deliverable includes specs and review notes.', '2026-01-15', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (10, 'Optimize SEO', 'Optimize SEO for Cassandra''s Project 3. Deliverable includes specs and review notes.', '2026-01-13', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (10, 'Conduct user interviews', 'Conduct user interviews for Cassandra''s Project 3. Deliverable includes specs and review notes.', '2026-01-06', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (10, 'Optimize SEO', 'Optimize SEO for Cassandra''s Project 3. Deliverable includes specs and review notes.', '2025-12-01', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (11, 'Design hero section', 'Design hero section for Cassandra''s Project 4. Deliverable includes specs and review notes.', '2025-11-28', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (11, 'Create wireframes', 'Create wireframes for Cassandra''s Project 4. Deliverable includes specs and review notes.', '2026-01-06', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (12, 'Implement homepage', 'Implement homepage for Diego''s Project 1. Deliverable includes specs and review notes.', '2025-11-03', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (12, 'Optimize SEO', 'Optimize SEO for Diego''s Project 1. Deliverable includes specs and review notes.', '2025-12-20', 'Low', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (12, 'Implement homepage', 'Implement homepage for Diego''s Project 1. Deliverable includes specs and review notes.', '2025-11-16', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (12, 'Optimize SEO', 'Optimize SEO for Diego''s Project 1. Deliverable includes specs and review notes.', '2025-12-11', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (13, 'Create wireframes', 'Create wireframes for Diego''s Project 2. Deliverable includes specs and review notes.', '2025-11-22', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (13, 'Design hero section', 'Design hero section for Diego''s Project 2. Deliverable includes specs and review notes.', '2025-11-22', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (13, 'Build API endpoints', 'Build API endpoints for Diego''s Project 2. Deliverable includes specs and review notes.', '2025-11-05', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (13, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Diego''s Project 2. Deliverable includes specs and review notes.', '2025-12-04', 'High', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (14, 'Create wireframes', 'Create wireframes for Diego''s Project 3. Deliverable includes specs and review notes.', '2025-12-04', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (14, 'Build API endpoints', 'Build API endpoints for Diego''s Project 3. Deliverable includes specs and review notes.', '2025-11-03', 'High', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (14, 'Write unit tests', 'Write unit tests for Diego''s Project 3. Deliverable includes specs and review notes.', '2025-12-05', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (14, 'Create wireframes', 'Create wireframes for Diego''s Project 3. Deliverable includes specs and review notes.', '2025-11-15', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (14, 'Integrate payment gateway', 'Integrate payment gateway for Diego''s Project 3. Deliverable includes specs and review notes.', '2025-11-23', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (15, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Diego''s Project 4. Deliverable includes specs and review notes.', '2026-01-03', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (15, 'Write unit tests', 'Write unit tests for Diego''s Project 4. Deliverable includes specs and review notes.', '2025-12-29', 'High', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (15, 'Optimize SEO', 'Optimize SEO for Diego''s Project 4. Deliverable includes specs and review notes.', '2025-11-16', 'Medium', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (16, 'Create wireframes', 'Create wireframes for Evelyn''s Project 1. Deliverable includes specs and review notes.', '2026-02-01', 'High', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (16, 'Produce marketing assets', 'Produce marketing assets for Evelyn''s Project 1. Deliverable includes specs and review notes.', '2026-01-13', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (16, 'Conduct user interviews', 'Conduct user interviews for Evelyn''s Project 1. Deliverable includes specs and review notes.', '2025-11-14', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (16, 'Optimize SEO', 'Optimize SEO for Evelyn''s Project 1. Deliverable includes specs and review notes.', '2026-02-01', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (17, 'Create wireframes', 'Create wireframes for Evelyn''s Project 2. Deliverable includes specs and review notes.', '2025-11-11', 'Low', 'done');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (17, 'Optimize SEO', 'Optimize SEO for Evelyn''s Project 2. Deliverable includes specs and review notes.', '2025-12-11', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (17, 'Conduct user interviews', 'Conduct user interviews for Evelyn''s Project 2. Deliverable includes specs and review notes.', '2025-11-26', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (17, 'Write unit tests', 'Write unit tests for Evelyn''s Project 2. Deliverable includes specs and review notes.', '2025-11-02', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (18, 'Write unit tests', 'Write unit tests for Evelyn''s Project 3. Deliverable includes specs and review notes.', '2025-11-26', 'Low', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (18, 'Build API endpoints', 'Build API endpoints for Evelyn''s Project 3. Deliverable includes specs and review notes.', '2025-11-23', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (18, 'Optimize SEO', 'Optimize SEO for Evelyn''s Project 3. Deliverable includes specs and review notes.', '2025-12-04', 'Medium', 'todo');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (18, 'Produce marketing assets', 'Produce marketing assets for Evelyn''s Project 3. Deliverable includes specs and review notes.', '2025-11-14', 'Medium', 'in_progress');
INSERT INTO Task (project_id, title, Description, Deadline, priority, Status) VALUES (18, 'Setup CI/CD pipeline', 'Setup CI/CD pipeline for Evelyn''s Project 3. Deliverable includes specs and review notes.', '2025-11-02', 'Medium', 'done');

-- INSERT TASK_ASSIGNMENTS

INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 1);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 2);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 2);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 3);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 4);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 4);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 5);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 6);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 7);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 7);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 8);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 8);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 9);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 9);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 10);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 11);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (8, 12);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 13);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 13);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 14);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 15);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 16);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 16);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (8, 17);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 17);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 18);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 18);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 19);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 19);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 20);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 21);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 21);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 22);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 23);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 23);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (8, 24);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 25);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 26);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 27);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 28);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 28);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 29);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 29);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 30);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 30);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 31);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 31);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 32);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 32);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 33);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 33);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 34);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 34);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 35);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 35);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 36);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 36);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 37);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 38);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 39);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 40);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (8, 41);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 41);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 42);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 43);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 43);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 44);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 45);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 45);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 46);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 46);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (13, 47);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 48);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 49);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 50);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 51);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 52);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (8, 53);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (8, 54);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 55);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (9, 55);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 56);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 56);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 57);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (10, 58);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 59);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 60);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 60);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 61);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 62);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 63);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (6, 63);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (14, 64);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 64);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (7, 65);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (11, 65);
INSERT INTO Task_Assignment (user_id, task_id) VALUES (12, 66);

-- INSERT MESSAGES

INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (12, 13, 1, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-19', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (14, 11, 1, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-24', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 13, 1, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-08', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (11, 10, 1, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-17', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 9, 1, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-11-01', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (9, 13, 2, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-08', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (1, 7, 2, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-25', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 13, 2, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-16', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (11, 9, 3, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-25', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (1, 14, 3, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-26', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (1, 9, 3, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-25', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (1, 14, 3, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-24', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (14, 7, 3, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-29', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (13, 7, 4, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-24', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 13, 4, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-14', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (1, 10, 4, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-25', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (9, 13, 4, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-05', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (2, 9, 5, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-11', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (2, 14, 5, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-27', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (13, 2, 5, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-23', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 9, 5, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-07', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (2, 14, 5, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-12', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (2, 8, 6, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-13', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (13, 9, 6, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-02', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 2, 6, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-09', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (2, 6, 6, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-14', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (14, 7, 7, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-19', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 12, 7, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-22', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (8, 12, 7, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-23', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 11, 8, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-22', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (6, 14, 8, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-19', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (14, 12, 8, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-08', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 10, 8, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-04', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (6, 9, 8, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-23', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 13, 9, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-12', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 13, 9, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-25', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 10, 10, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-22', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 9, 10, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-14', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (13, 12, 10, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-22', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (9, 8, 11, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-20', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (11, 13, 11, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-20', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 8, 11, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-02', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 14, 11, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-11-01', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (3, 7, 11, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-07', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (11, 14, 12, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-02', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (6, 7, 12, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-12', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (9, 6, 12, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-18', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (6, 4, 12, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-21', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (9, 7, 13, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-27', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (13, 7, 13, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-18', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 4, 13, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-04', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 11, 13, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-23', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 8, 13, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-05', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (12, 9, 14, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-11-01', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (6, 4, 14, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-09', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (4, 9, 15, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-24', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (4, 10, 15, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-31', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (8, 11, 15, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-27', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (14, 13, 15, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-03', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (10, 11, 16, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-18', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (9, 14, 16, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-30', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (5, 13, 16, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-11', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 9, 17, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-11-01', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 13, 17, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-12', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (5, 6, 17, 'I''ve pushed a fix for the mobile layout — let me know if it looks better on your device.', '2025-10-17', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (5, 12, 17, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-21', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (5, 13, 18, 'Payment reminder: please confirm milestone completion so I can process the payout.', '2025-10-19', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (5, 13, 18, 'Can we shift the milestone schedule by one week? There''s a dependency delay.', '2025-10-02', 0);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (11, 10, 18, 'Quick update: initial deliverables uploaded to the repo. Please review when you have a moment.', '2025-10-20', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (7, 6, 18, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-12', 1);
INSERT INTO Message (sender_id, receiver_id, project_id, Content, Sent_at, is_read) VALUES (6, 9, 18, 'Client request: could we tighten up the header spacing and increase CTA contrast?', '2025-10-07', 1);

-- INSERT PAYMENTS

INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Alice''s Project 1. Final payout', 250.00, 1, 14, 1, '2026-02-04', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Alice''s Project 2. 50% milestone payment', 400.00, 1, 6, 2, '2025-12-25', 'Failed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Alice''s Project 3. Final payout', 250.00, 1, 6, 3, '2026-01-13', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Alice''s Project 4. Platform fee included', 500.00, 1, 6, 4, '2026-01-25', 'Pending');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #2', 'Milestone Payment #2 for Alice''s Project 4. 50% milestone payment', 1200.00, 1, 7, 4, '2025-09-02', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Brian''s Project 1. Initial deposit', 1200.00, 2, 7, 5, '2026-01-25', 'Failed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #2', 'Milestone Payment #2 for Brian''s Project 1. Initial deposit', 1500.00, 2, 14, 5, '2025-12-29', 'Failed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Brian''s Project 2. Platform fee included', 750.00, 2, 12, 6, '2025-10-26', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Brian''s Project 3. 50% milestone payment', 250.00, 2, 11, 7, '2025-12-30', 'Pending');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Cassandra''s Project 1. Initial deposit', 1200.00, 3, 14, 8, '2025-12-01', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Cassandra''s Project 2. Final payout', 250.00, 3, 14, 9, '2025-10-05', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #2', 'Milestone Payment #2 for Cassandra''s Project 2. Initial deposit', 750.00, 3, 11, 9, '2025-09-11', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Cassandra''s Project 3. Platform fee included', 750.00, 3, 11, 10, '2026-01-09', 'Failed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Cassandra''s Project 4. 50% milestone payment', 250.00, 3, 7, 11, '2026-02-11', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Diego''s Project 1. Initial deposit', 1200.00, 4, 6, 12, '2025-11-15', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Diego''s Project 2. 50% milestone payment', 500.00, 4, 12, 13, '2025-10-26', 'Failed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Diego''s Project 3. Initial deposit', 250.00, 4, 14, 14, '2025-11-03', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Diego''s Project 4. Platform fee included', 1200.00, 4, 11, 15, '2025-12-20', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Evelyn''s Project 1. 50% milestone payment', 1200.00, 5, 14, 16, '2025-12-18', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #2', 'Milestone Payment #2 for Evelyn''s Project 1. 50% milestone payment', 250.00, 5, 8, 16, '2025-12-29', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Evelyn''s Project 2. Initial deposit', 250.00, 5, 8, 17, '2025-08-21', 'Completed');
INSERT INTO Payment (Title, Description, Amount, Client_id, recipient_id, project_id, payment_date, status) VALUES ('Milestone Payment #1', 'Milestone Payment #1 for Evelyn''s Project 3. Platform fee included', 1500.00, 5, 6, 18, '2025-11-01', 'Completed');

-- INSERT REVIEWS

INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (1, 1, 11, 4, 'Minor revisions required but overall satisfied with the outcome.', '2025-09-13', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (2, 1, 8, 3, 'Exceeded expectations — would hire again.', '2025-10-29', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (2, 7, 1, 5, 'There were a few delays due to third-party dependencies.', '2025-10-01', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (3, 13, 1, 4, 'Great communication and proactive problem solving.', '2026-03-01', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (3, 1, 11, 4, 'Delivered high-quality work and met the milestone on time.', '2026-02-14', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (4, 13, 1, 2, 'Great communication and proactive problem solving.', '2025-10-07', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (4, 1, 9, 4, 'Great communication and proactive problem solving.', '2025-09-13', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (6, 10, 2, 4, 'Delivered high-quality work and met the milestone on time.', '2025-11-27', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (6, 13, 2, 3, 'Great communication and proactive problem solving.', '2025-12-09', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (7, 9, 2, 2, 'There were a few delays due to third-party dependencies.', '2025-09-07', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (7, 6, 2, 2, 'There were a few delays due to third-party dependencies.', '2025-09-04', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (9, 12, 3, 5, 'Minor revisions required but overall satisfied with the outcome.', '2025-10-25', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (10, 3, 11, 3, 'Exceeded expectations — would hire again.', '2026-02-16', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (10, 3, 12, 3, 'Great communication and proactive problem solving.', '2026-02-15', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (11, 3, 12, 4, 'Minor revisions required but overall satisfied with the outcome.', '2025-10-18', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (11, 3, 7, 2, 'Exceeded expectations — would hire again.', '2025-09-30', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (13, 11, 4, 5, 'Great communication and proactive problem solving.', '2025-12-22', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (13, 4, 10, 3, 'Great communication and proactive problem solving.', '2026-01-03', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (14, 4, 8, 5, 'There were a few delays due to third-party dependencies.', '2025-12-30', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (14, 13, 4, 5, 'Minor revisions required but overall satisfied with the outcome.', '2025-12-20', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (15, 7, 4, 5, 'Minor revisions required but overall satisfied with the outcome.', '2025-09-12', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (16, 6, 5, 2, 'Minor revisions required but overall satisfied with the outcome.', '2025-10-03', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (17, 5, 6, 4, 'Minor revisions required but overall satisfied with the outcome.', '2026-01-08', 'client_to_freelancer');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (17, 7, 5, 4, 'Exceeded expectations — would hire again.', '2026-01-23', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (18, 6, 5, 3, 'Minor revisions required but overall satisfied with the outcome.', '2025-09-24', 'freelancer_to_client');
INSERT INTO Review (project_id, reviewer_id, reviewee_id, Rating, Comment, Date, Type) VALUES (18, 5, 6, 5, 'Delivered high-quality work and met the milestone on time.', '2025-09-11', 'client_to_freelancer');

-- End of sample dataset
