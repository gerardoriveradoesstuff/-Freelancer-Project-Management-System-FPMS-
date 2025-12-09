const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/demo", require("./routes/demoRoutes"));

const PORT = 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
