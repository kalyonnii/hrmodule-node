const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');
const dbConnect = require("../config/dbConnection");
const {
    getEmployeeName
} = require('./employeesController');

/**
 * Fetch today's attendance data from the database
 */
async function getAttendanceData() {
    try {
        const today = moment().format('YYYY-MM-DD');
        const sqlAttendance = `SELECT * FROM attendance WHERE attendanceDate = ?`;

        const attendanceData = await new Promise((resolve, reject) => {
            dbConnect.query(sqlAttendance, [today], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });

        return attendanceData.length > 0 ? attendanceData : []; // Ensure an array is always returned
    } catch (error) {
        console.error('Error getting attendance data:', error);
        return [];
    }
}

/**
 * Generate and send attendance report via email
 */
async function sendAttendanceReport() {
    try {
        const attendanceData = await getAttendanceData();
        if (attendanceData.length === 0) {
            console.log('No attendance data available for today.');
            return; // Don't proceed if there's no data
        }

        // Ensure attendanceData is parsed properly
        if (attendanceData[0]?.attendanceData) {
            attendanceData[0].attendanceData = JSON.parse(attendanceData[0].attendanceData);
        }
        // console.log('Fetched Attendance Data:', attendanceData);
        // Initialize counters
        let presentCount = 0;
        let absentCount = 0;
        let halfDayCount = 0;
        let lateCount = 0;
        // Fetch employee names asynchronously and count attendance statuses
        const tableRows = await Promise.all(
            attendanceData[0]?.attendanceData.map(async (item, index) => {
                const employeeName = await getEmployeeName(item.employeeId);
                // Update counts based on status
                switch (item.status) {
                    case 'Present':
                        presentCount++;
                        break;
                    case 'Absent':
                        absentCount++;
                        break;
                    case 'Half-day':
                        halfDayCount++;
                        break;
                    case 'Late':
                        lateCount++;
                        break;
                }
                return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${employeeName.toUpperCase()}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.status}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.checkInTime || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.reason || '-'}</td>
                    </tr>
                `;
            })
        );

        // Get formatted date
        const formattedDate = moment().format('MMM DD, YYYY');
        // Email HTML with count summary
        const emailHtml = `
            <h2>Attendance Report - ${formattedDate}</h2>
            <p><strong>Present:</strong> ${presentCount}</p>
            <p><strong>Absent:</strong> ${absentCount}</p>
            <p><strong>Half-day:</strong> ${halfDayCount}</p>
            <p><strong>Late:</strong> ${lateCount}</p>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Employee Name</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Check-in Time</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;
        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'ravi.n@winwaycreators.com, hema.p@winwaycreators.com, mudhiiguubbakalyonnii@gmail.com, cnarendra329@gmail.com',
            subject: `Attendance Report - ${formattedDate}`,
            html: emailHtml,
        };
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Error generating attendance report:', error);
    }
}


function scheduleCronJobs() {
    cron.schedule('00 5 * * *', () => { // 14:30 UTC = 8:00 PM IST
        console.log('Running cron job for sending attendance report at 10:30 AM IST');
        sendAttendanceReport();
    });
}


module.exports = {
    scheduleCronJobs,
};












// const cron = require('node-cron');
// const nodemailer = require('nodemailer');
// const asyncHandler = require("express-async-handler");

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// const sendTerminationmail = asyncHandler(async (req, res) => {
//     const { subject, body, employeeName, mobile ,email} = req.body;
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: subject,
//         html: `
//         <p>Dear ${employeeName},</p>
//       <p>I hope this message finds you well.</p>
//       <p>After careful consideration, we regret to inform you that your employment with Our Company is terminated effective immediately.</p>
//       <p>${body}</p>
//       <p>Please be aware that, in accordance with company policy and your employment contract, you are not entitled to any salary for the current month.</p>
//       <p>Thank you for your service to our company.</p>
//       <p>All the best for your future endeavors.</p>

//       <br />
//       <p>Regards,</p>
//       <p>Team - HR Dept</p>
//       <p>+91 ${mobile}</p>
//       <p>hr@winwaycreators.com</p>
//       <p><a href="https://www.winwaycreators.com">www.winwaycreators.com</a></p>

//       `,
//     };
//     try {
//         const info = await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: 'Email sent successfully', info: info.response });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         res.status(500).send('Failed to send email');
//     };
// });


// module.exports = {
//     sendTerminationmail,
// };