-- 1. List all users
SELECT * FROM Users;

-- 2. Get all freelancers
SELECT FullName, Email FROM Users WHERE Role='freelancer';

-- 3. Projects for a specific client
SELECT Title, Status, Deadline FROM Project WHERE Client_id=1;

-- 4. Tasks for a project
SELECT t.title, t.Status, t.Deadline
FROM Task t
JOIN Project p ON t.project_id = p.Id
WHERE p.Id = 2;

-- 5. Messages between a client and freelancers in project 3
SELECT sender_id, receiver_id, Content
FROM Message
WHERE project_id = 3;

-- 6. Payments received by freelancer 6
SELECT Title, Amount, payment_date, status
FROM Payment
WHERE recipient_id = 6;

-- 7. Reviews received by a freelancer
SELECT reviewer_id, Rating, Comment
FROM Review
WHERE reviewee_id = 7;

-- 8. Count of tasks per project
SELECT project_id, COUNT(*) AS num_tasks
FROM Task
GROUP BY project_id;

-- 9. Average rating given by clients
SELECT AVG(Rating) AS avg_rating
FROM Review
WHERE Type='client_to_freelancer';

-- 10. Projects with at least 3 tasks
SELECT p.Title
FROM Project p
JOIN Task t ON p.Id = t.project_id
GROUP BY p.Id
HAVING COUNT(t.Task_Id) >= 3;




--- Query 1 
--- Projects with High Priority 'Todo' Tasks and Assigned Freelancers
SELECT
  T1.Title,
  GROUP_CONCAT(T4.FullName) AS AssignedFreelancers
FROM Project AS T1
INNER JOIN Task AS T2
  ON T1.Id = T2.project_id
INNER JOIN Task_Assignment AS T3
  ON T2.Task_Id = T3.task_id
INNER JOIN Users AS T4
  ON T3.user_id = T4.Id
WHERE
  T2.Status = 'todo' AND T2.priority = 'High' AND T4.Role = 'freelancer'
GROUP BY
  T1.Id,
  T1.Title;


------ Query 2 
---Clients with Unread Messages in 'Active' Projects and Total Payments

 SELECT
  T1.FullName,
  COUNT(T2.message_id) AS UnreadMessagesInActiveProjects,
  SUM(CASE WHEN T3.Status = 'Completed' THEN T3.Amount ELSE 0 END) AS TotalCompletedPaymentAmount
FROM Users AS T1
INNER JOIN Project AS T4
  ON T1.Id = T4.Client_id
LEFT JOIN Message AS T2
  ON T1.Id = T2.receiver_id AND T2.project_id = T4.Id AND T2.is_read = FALSE
LEFT JOIN Payment AS T3
  ON T1.Id = T3.Client_id
WHERE
  T1.Role = 'client' AND T4.Status = 'active'
GROUP BY
  T1.Id,
  T1.FullName
HAVING
  COUNT(T2.message_id) > 0;



------------- Project Phase # 3 ----------------






---- #1 Assign a Freelancer to a Project Only If They Have the Required Skil------

SELECT u.Id, u.FullName
FROM Users u
JOIN User_Skill us ON u.Id = us.user_id
JOIN Skill s ON us.skill_id = s.Skill_Id
WHERE s.Name = 'Web Development'
AND u.Role = 'freelancer';

INSERT INTO Project_Member (user_id, project_id, role)
VALUES (5, 3, 'Contributor');





------ #2 Create a Project and Automatically Create Default Tasks -----

INSERT INTO Project (Title, Description, Client_id, Deadline)
VALUES ('Website Redesign', 'Update UI for homepage', 2, '2025-06-01');

SELECT last_insert_rowid();

INSERT INTO Task (project_id, title, Description, Deadline)
VALUES (10, 'Planning', 'Plan project phases', '2025-05-01');

INSERT INTO Task (project_id, title, Description, Deadline)
VALUES (10, 'Development', 'Code features', '2025-05-15');

INSERT INTO Task (project_id, title, Description, Deadline)
VALUES (10, 'Testing', 'Test complete system', '2025-05-25');





----------- #3 Send a Message + Mark Previous Messages as Read ---------

--step 1 
UPDATE Message
SET is_read = TRUE
WHERE receiver_id = 4
AND project_id = 3
AND is_read = FALSE;

-- step 2 
INSERT INTO Message (sender_id, receiver_id, project_id, Content)
VALUES (4, 7, 3, 'I finished the design!');



------------ #4 Complete a Project and Pay the Freelancer ----------

-- step 1 
UPDATE Project
SET Status = 'completed'
WHERE Id = 6;

-- step 2 
UPDATE Task
SET Status = 'done'
WHERE project_id = 6;

-- step 3 
INSERT INTO Payment (Title, Amount, Client_id, recipient_id, project_id, payment_date, status)
VALUES ('Final Payment', 500.00, 2, 9, 6, DATE('now'), 'Pending');


--------- # 5 Pay only users who completed ALL their tasks in a project

-- step 1 
SELECT 
    u.Id,
    u.FullName,
    COUNT(t.Task_Id) AS total_tasks,
    SUM(CASE WHEN t.Status = 'done' THEN 1 ELSE 0 END) AS completed_tasks
FROM Users u

JOIN Task_Assignment ta 
    ON u.Id = ta.user_id

JOIN Task t 
    ON ta.task_id = t.Task_Id

JOIN Project p 
    ON t.project_id = p.Id

WHERE p.Id = 6

GROUP BY u.Id
HAVING total_tasks = completed_tasks;

--- step 2 --

INSERT INTO Payment (Title, Amount, Client_id, recipient_id, project_id, payment_date, status)
SELECT 
    'Task Completion Bonus',
    200.00,
    p.Client_id,
    u.Id,
    p.Id,
    DATE('now'),
    'Pending'
FROM Users u
JOIN Task_Assignment ta ON u.Id = ta.user_id
JOIN Task t ON ta.task_id = t.Task_Id
JOIN Project p ON t.project_id = p.Id
WHERE p.Id = 6
GROUP BY u.Id
HAVING COUNT(t.Task_Id) = SUM(CASE WHEN t.Status = 'done' THEN 1 ELSE 0 END);



----- #6  Automatically remove inactive freelancers from a project


---step 1 
SELECT 
    u.Id,
    u.FullName,
    MAX(t.created_at) AS last_task_activity
FROM Users u

JOIN Task_Assignment ta
    ON u.Id = ta.user_id

JOIN Task t
    ON ta.task_id = t.Task_Id

JOIN Project p
    ON t.project_id = p.Id

JOIN Project_Member pm
    ON pm.user_id = u.Id AND pm.project_id = p.Id

WHERE u.Role = 'freelancer'

GROUP BY u.Id, u.FullName
HAVING DATE(last_task_activity) < DATE('now', '-30 days');

--- step 2 

DELETE FROM Project_Member
WHERE user_id IN (
    SELECT u.Id
    FROM Users u
    JOIN Task_Assignment ta ON u.Id = ta.user_id
    JOIN Task t ON ta.task_id = t.Task_Id
    JOIN Project p ON t.project_id = p.Id
    GROUP BY u.Id
    HAVING DATE(MAX(t.created_at)) < DATE('now', '-30 days')
);




----- #7 Alert client if freelancer misses deadline AND send warning

--- step 1 

SELECT DISTINCT
    t.Task_Id,
    t.project_id,
    t.Deadline,
    assignee.Id AS freelancer_id,
    p.Client_id
FROM Task t

JOIN Task_Assignment ta
    ON t.Task_Id = ta.task_id

JOIN Users assignee
    ON assignee.Id = ta.user_id

JOIN Project p
    ON t.project_id = p.Id

WHERE DATE(t.Deadline) < DATE('now')
AND t.Status != 'done';


--- step 2 

INSERT INTO Message (sender_id, receiver_id, project_id, Content)

SELECT 
    p.Client_id,
    u.Id,
    p.Id,
    'You have an overdue task that needs immediate attention.'

FROM Task t
JOIN Task_Assignment ta ON t.Task_Id = ta.task_id
JOIN Users u ON u.Id = ta.user_id
JOIN Project p ON t.project_id = p.Id

WHERE DATE(t.Deadline) < DATE('now')
AND t.Status != 'done';





