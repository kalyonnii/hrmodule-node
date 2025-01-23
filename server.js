const express = require('express');
const cors = require("cors");
const app = express();
const https = require('https');
const fs = require('fs');
const ipWhitelist = require('./middleware/ipAddress.js');
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

app.use("/user", ipWhitelist, require("./routes/userRoutes"));
app.use("/employees", ipWhitelist, require("./routes/employeesRoutes"));
app.use("/holidays", ipWhitelist, require("./routes/holidaysRoutes"));
app.use("/incentives", ipWhitelist, require("./routes/incentivesRoutes"));
app.use("/users", ipWhitelist, require("./routes/usersRoutes"));
app.use("/interviews", ipWhitelist, require("./routes/interviewRoutes"));
app.use("/designations", ipWhitelist, require("./routes/designationRoutes"));
app.use("/salaryhikes", ipWhitelist, require("./routes/salaryHikesRoutes"));
app.use("/attendance", ipWhitelist, require("./routes/attendanceRoutes"));
app.use("/leaves", ipWhitelist, require("./routes/leavemanagementRoutes"));
app.use("/payroll", ipWhitelist, require("./routes/payrollRoutes"));
app.use("/reports", ipWhitelist, require("./routes/reportsRoutes"));
app.use("/mail", ipWhitelist, require("./routes/nodeMailRoutes"));
app.use("/ipAddress", ipWhitelist, require("./routes/ipAddressRoutes.js"));

// app.listen(process.env.PORT, () => {
//     console.log(`Server running at http://localhost:${process.env.PORT}`);
// });

https.createServer(options, app).listen(process.env.PORT, () => {
    console.log(`HTTPS Server running on port ${process.env.PORT}`);
});
