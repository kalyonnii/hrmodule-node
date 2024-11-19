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
    const { subject, body, employeeName } = req.body;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mudhiiguubbakalyonnii4@gmail.com',
        subject: subject,
        html: `
        <p>Dear ${employeeName},</p>
      <p>I hope this message finds you well.</p>
      <p>After careful consideration, we regret to inform you that your employment with Our Company is terminated effective immediately.</p>
      <p>${body}</p>
      <p>Please be aware that, in accordance with company policy and your employment contract, you are not entitled to any salary for the current month.</p>
      <p>Thank you for your service to our company.</p>
      <p>All the best for your future endeavors.</p>
      
      <br />
      <p>Regards,</p>
      <p>Team - HR Dept</p>
      <p>+91 903-022-7331</p>
      <p>hr@winwaycreators.com</p>
      <p><a href="https://www.winwaycreators.com">www.winwaycreators.com</a></p>
       
      `,
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

