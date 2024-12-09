const express = require('express');
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "*",
        // origin: 'http://localhost:58944', // Allow requests only from this port
        // methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'], // Specify allowed methods
        // credentials: true, // Allow cookies if needed
    })
);

app.use("/user", require("./routes/userRoutes"));
// app.use("/pdfGenerator", require("./routes/pdfGeneratorRoutes"));
app.use("/employees", require("./routes/employeesRoutes"));
app.use("/holidays", require("./routes/holidaysRoutes"));
app.use("/incentives", require("./routes/incentivesRoutes"));
app.use("/users", require("./routes/usersRoutes"));
app.use("/interviews", require("./routes/interviewRoutes"));
app.use("/designations", require("./routes/designationRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/leaves", require("./routes/leavemanagementRoutes"));
app.use("/payroll", require("./routes/payrollRoutes"));
app.use("/reports", require("./routes/reportsRoutes"));
app.use("/mail", require("./routes/nodeMailRoutes"));

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

