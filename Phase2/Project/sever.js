const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/demo", require("./routes/demoRoutes"));

// Serve frontend files from Phase2/Project directory
app.use(express.static(__dirname));

<<<<<<< HEAD
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`FPMS server listening on http://localhost:${PORT}`);
});
=======
const PORT = 5000;
app.listen(PORT);
>>>>>>> origin/main
