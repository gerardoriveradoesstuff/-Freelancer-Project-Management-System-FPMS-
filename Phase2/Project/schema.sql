PRAGMA foreign_keys = ON;

CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role TEXT NOT NULL CHECK(Role IN ('client', 'freelancer', 'admin'))
);

CREATE TABLE Skill (
    Skill_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL UNIQUE,
    Description VARCHAR(1000)
);

CREATE TABLE Project (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Client_id INT,
    Deadline DATE,
    Status TEXT DEFAULT 'pending' CHECK(Status IN ('pending', 'active', 'completed', 'cancelled')),
    FOREIGN KEY (Client_id) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE TABLE User_Skill (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skill(Skill_Id) ON DELETE CASCADE
);

CREATE TABLE Task (
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

CREATE TABLE Project_Member (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role TEXT DEFAULT 'Contributor' CHECK(role IN ('Manager', 'Contributor')),
    FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE CASCADE,
    UNIQUE (user_id, project_id)
);

CREATE TABLE Message (
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

CREATE TABLE Payment (
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

CREATE TABLE Review (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND RATING <= 5),
    Comment TEXT,
    Date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Type TEXT CHECK(Type IN ('client_to_freelancer', 'freelancer_to_client')),
    FOREIGN KEY (project_id) REFERENCES Project(Id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE TABLE Task_Assignment (
  user_id INT,
  task_id INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, task_id),
  FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES Task(Task_Id) ON DELETE CASCADE
);