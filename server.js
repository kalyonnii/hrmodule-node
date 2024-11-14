const express = require('express');
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

app.use("/user", require("./routes/userRoutes"));
app.use("/pdfGenerator", require("./routes/pdfGeneratorRoutes"));
app.use("/employees", require("./routes/employeesRoutes"));
app.use("/holidays", require("./routes/holidaysRoutes"));
app.use("/users", require("./routes/usersRoutes"));
app.use("/interviews", require("./routes/interviewRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/leaves", require("./routes/leavemanagementRoutes"));
app.use("/payroll", require("./routes/payrollRoutes"));
app.use("/reports", require("./routes/reportsRoutes"));
app.use("/mail", require("./routes/nodeMailRoutes"));

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

