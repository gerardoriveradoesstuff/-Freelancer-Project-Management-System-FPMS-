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
