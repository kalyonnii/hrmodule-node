const express = require('express');
const cors = require("cors");
const app = express();
const https = require('https');
const fs = require('fs');
app.use(express.json());

app.use(
    cors({
        origin: "*",
        // origin: ['http://localhost:58944', 'https://app.thefintalk.in'],// Allow requests only from this port
        // methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'], // Specify allowed methods
        // credentials: true, // Allow cookies if needed
    })
);

const options = {
    key: fs.readFileSync('./ssl/privkey.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    ca: fs.readFileSync('./ssl/chain.pem')
};

app.use("/user", require("./routes/userRoutes"));
app.use("/employees", require("./routes/employeesRoutes"));
app.use("/holidays", require("./routes/holidaysRoutes"));
app.use("/incentives", require("./routes/incentivesRoutes"));
app.use("/users", require("./routes/usersRoutes"));
app.use("/interviews", require("./routes/interviewRoutes"));
app.use("/designations", require("./routes/designationRoutes"));
app.use("/salaryhikes", require("./routes/salaryHikesRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/leaves", require("./routes/leavemanagementRoutes"));
app.use("/payroll", require("./routes/payrollRoutes"));
app.use("/reports", require("./routes/reportsRoutes"));
app.use("/mail", require("./routes/nodeMailRoutes"));

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

// https.createServer(options, app).listen(process.env.PORT, () => {
//     console.log(`HTTPS Server running on port ${process.env.PORT}`);
// });
