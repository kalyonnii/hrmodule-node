const cron = require('node-cron');
const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTerminationmail = asyncHandler(async (req, res) => {
    const { subject, body } = req.body;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mudhiiguubbakalyonnii4@gmail.com',
        subject: subject,
        html: `<p>${body}</p>`
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully', info: info.response });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
    };
});


module.exports = {
    sendTerminationmail,
};

