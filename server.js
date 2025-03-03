const express = require('express');
const cors = require("cors");
const app = express();
const https = require('https');
const fs = require('fs');
const applyIpWhitelist = require('./middleware/ipAddress.js');
const { scheduleCronJobs } = require('./controllers/nodemail.js');
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
app.use("/employees", applyIpWhitelist, require("./routes/employeesRoutes"));
app.use("/holidays", applyIpWhitelist, require("./routes/holidaysRoutes"));
app.use("/incentives", applyIpWhitelist, require("./routes/incentivesRoutes"));
app.use("/users", applyIpWhitelist, require("./routes/usersRoutes"));
app.use("/interviews", applyIpWhitelist, require("./routes/interviewRoutes"));
app.use("/designations", applyIpWhitelist, require("./routes/designationRoutes"));
app.use("/salaryhikes", applyIpWhitelist, require("./routes/salaryHikesRoutes"));
app.use("/attendance", applyIpWhitelist, require("./routes/attendanceRoutes"));
app.use("/leaves", applyIpWhitelist, require("./routes/leavemanagementRoutes"));
app.use("/payroll", applyIpWhitelist, require("./routes/payrollRoutes"));
app.use("/reports", applyIpWhitelist, require("./routes/reportsRoutes"));
// app.use("/mail", applyIpWhitelist, require("./routes/nodeMailRoutes"));
app.use("/ipAddress", applyIpWhitelist, require("./routes/ipAddressRoutes.js"));

scheduleCronJobs();
// app.listen(process.env.PORT, () => {
//     console.log(`Server running at http://localhost:${process.env.PORT}`);
// });

https.createServer(options, app).listen(process.env.PORT, () => {
    console.log(`HTTPS Server running on port ${process.env.PORT}`);
});
