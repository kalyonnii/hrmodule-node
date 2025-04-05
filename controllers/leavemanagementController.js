const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
    createClauseHandler,
    updateClauseHandler,
} = require("../middleware/clauseHandler");
const nodemailer = require('nodemailer');
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");
const { projectConstantsLocal } = require("../constants/project-constants");

const getLeavesCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as leavesCount FROM leavemanagement";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getLeavesCount error");
            return res.status(500).send("Error in Fetching the Leaves Count");
        }
        const leavesCount = result[0]["leavesCount"];
        res.status(200).send(String(leavesCount));
    });
});

const getLeaves = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM leavemanagement";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getLeaves error:");
            return res.status(500).send("Error in Fetching the Leaves");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getLeaveById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM leavemanagement WHERE leaveId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getLeaveById error:");
            return res.status(500).send("Error in Fetching the Leave Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});

const createLeave = asyncHandler((req, res) => {
    let leaveId = "L-" + generateRandomNumber(6);
    req.body["leaveId"] = leaveId;
    req.body["leaveInternalStatus"] = 1;
    req.body["lastLeaveInternalStatus"] = 1;
    req.body["createdBy"] = getUserDisplayName(req);
    req.body["lastUpdatedBy"] = getUserDisplayName(req);
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO leavemanagement (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createLeave error:");
            return res.status(500).send("Error in Creating the Leave");
        }
        sendLeaveEmail(req.body);
        res.status(200).send(true);
    });
});

async function sendLeaveEmail(leaveDetails) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    leaveDetails.employeeName = capitalizeFirst(leaveDetails.employeeName);
    leaveDetails.lastUpdatedBy = capitalizeFirst(leaveDetails.lastUpdatedBy);
    leaveDetails.durationType = capitalizeFirst(leaveDetails.durationType);

    let subject = `Leave Request from ${leaveDetails.employeeName}`;
    let statusText = `<b>Status</b>: ${capitalizeFirst(getStatusName(leaveDetails.leaveInternalStatus))}`;
    let actionText = '';
    let hrMessage = `<p>An employee has submitted a new leave request. Below are the details:</p>`;

    if (leaveDetails.leaveInternalStatus == 2) { // Approved
        subject = `Leave Request from ${leaveDetails.employeeName} Approved by ${leaveDetails.lastUpdatedBy}`;
        actionText = `<p><b>Approved By:</b> ${leaveDetails.lastUpdatedBy}</p>`;
        hrMessage = `<p>The leave request has been Approved. Below are the details:</p>`;
    } else if (leaveDetails.leaveInternalStatus == 3) { // Rejected
        subject = `Leave Request from ${leaveDetails.employeeName} Rejected by ${leaveDetails.lastUpdatedBy}`;
        actionText = `<p><b>Rejected By:</b> ${leaveDetails.lastUpdatedBy}</p>`;
        hrMessage = `<p>The leave request has been Rejected. Below are the details:</p>`;
    }

    let mailOptions = {
        from: process.env.EMAIL_USER,
        // to: 'ravi.n@winwaycreators.com, hema.p@winwaycreators.com, hr@winwaycreators.com, mudhiiguubbakalyonnii@gmail.com',
        to: 'fintalkcrm@gmail.com, hr@winwaycreators.com, mudhiiguubbakalyonnii@gmail.com',
        // to: 'mudhiiguubbakalyonnii@gmail.com', // Employee's email (make sure this exists in req.body)
        subject: subject,
        html: `
            <p>Dear HR Team,</p>
            ${hrMessage}
            <p><b>Leave ID:</b> ${leaveDetails.leaveId}</p>
            <p><b>Employee Name:</b> ${leaveDetails.employeeName}</p>
            <p><b>Leave From:</b> ${leaveDetails.leaveFrom}</p>
            <p><b>Leave To:</b> ${leaveDetails.leaveTo}</p>
            <p><b>Leave Type:</b> ${capitalizeFirst(leaveDetails.leaveType)}</p>
            <p><b>No Of Days:</b> ${leaveDetails.noOfDays}</p>
            <p><b>Duration Type:</b> ${leaveDetails.durationType}</p>
            <p><b>Reason:</b> ${capitalizeFirst(leaveDetails.reason)}</p>
            <p>${statusText}</p>
            ${actionText}
            <br>
            <p>Please review this request and take the necessary action.</p>
        `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

function getUserDisplayName(req) {
    const isEmployee = req?.user?.rbac?.includes('employee');
    return isEmployee ? req?.user?.employeeName : req?.user?.username;
}
// const updateLeave = asyncHandler((req, res) => {
//     const id = req.params.id;
//     const checkRequiredFields = handleRequiredFields("leaves", req.body);
//     if (!checkRequiredFields) {
//         return res.status(422).send("Please fill all required fields");
//     }
//     req.body["lastUpdatedBy"] = getUserDisplayName(req);
//     const updateClause = updateClauseHandler(req.body);
//     const updateSql = `UPDATE leavemanagement SET ${updateClause} WHERE leaveId = ?`;
//     dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
//         if (updateErr) {
//             console.error("updateLeave error:", updateErr);
//             return res.status(500).send("Error in Updating the Leave");
//         }
//         sendLeaveEmail(req.body);
//         return res.status(200).send(updateResult);
//     });
// });


const updateLeave = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("leaves", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    req.body["lastUpdatedBy"] = getUserDisplayName(req);
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE leavemanagement SET ${updateClause} WHERE leaveId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateLeave error:", updateErr);
            return res.status(500).send("Error in Updating the Leave");
        }
        // Fetch the updated data after update
        const fetchUpdatedLeaveSql = `SELECT * FROM leavemanagement WHERE leaveId = ?`;
        dbConnect.query(fetchUpdatedLeaveSql, [id], (fetchErr, updatedLeaveResult) => {
            if (fetchErr) {
                console.error("Error fetching updated leave data:", fetchErr);
                return res.status(500).send("Error retrieving updated leave details");
            }
            if (updatedLeaveResult.length > 0) {
                const updatedLeaveDetails = updatedLeaveResult[0];
                // Send the email with updated data
                sendLeaveEmail(updatedLeaveDetails);
            }
            return res.status(200).send(updateResult);
        });
    });
});

const deleteLeave = asyncHandler((req, res) => {
    const sql = `DELETE FROM leavemanagement WHERE leaveId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteLeave error:", err);
            return res.status(500).send("Error in Deleting the Leave");
        }
        res.status(200).json({ message: "Leave Deleted Successfully" });
    });
});

// const changeLeaveStatus = asyncHandler((req, res) => {
//     const id = req.params.leaveId;
//     const statusId = req.params.statusId;
//     const createSql = `SELECT * FROM leavemanagement WHERE leaveId = '${id}'`;
//     dbConnect.query(createSql, (err, result) => {
//         if (err) {
//             console.log("changeLeaveStatus error:");
//             return res.status(500).send("Error in Changing the Leave Status");
//         }
//         if (result && result[0] && statusId) {
//             let statusData = {
//                 lastLeaveInternalStatus: result[0].leaveInternalStatus,
//                 leaveInternalStatus: statusId,
//             };
//             statusData["lastUpdatedBy"] = getUserDisplayName(req);
//             const updateClause = updateClauseHandler(statusData);
//             const sql = `UPDATE leavemanagement SET ${updateClause} WHERE leaveId = '${id}'`;
//             dbConnect.query(sql, (err, result) => {
//                 if (err) {
//                     console.log("changeLeaveStatus and updatecalss error:");
//                     return res.status(500).send("Error in Updating the Leave Status");
//                 }
//                 sendLeaveEmail(statusData);
//                 res.status(200).send(true);
//             });
//         } else {
//             res.status(422).send("No Leaves Found");
//         }
//     });
// });


const changeLeaveStatus = asyncHandler((req, res) => {
    const id = req.params.leaveId;
    const statusId = req.params.statusId;
    const createSql = `SELECT * FROM leavemanagement WHERE leaveId = '${id}'`;
    dbConnect.query(createSql, (err, result) => {
        if (err) {
            console.log("changeLeaveStatus error:");
            return res.status(500).send("Error in Changing the Leave Status");
        }
        if (result && result.length > 0 && statusId) {
            let leaveDetails = result[0]; // Get the leave details
            leaveDetails.lastLeaveInternalStatus = leaveDetails.leaveInternalStatus;
            leaveDetails.leaveInternalStatus = statusId;
            leaveDetails.lastUpdatedBy = getUserDisplayName(req);

            const updateClause = updateClauseHandler({
                lastLeaveInternalStatus: leaveDetails.lastLeaveInternalStatus,
                leaveInternalStatus: leaveDetails.leaveInternalStatus,
                lastUpdatedBy: leaveDetails.lastUpdatedBy
            });
            const sql = `UPDATE leavemanagement SET ${updateClause} WHERE leaveId = '${id}'`;
            dbConnect.query(sql, (err, updateResult) => {
                if (err) {
                    console.log("changeLeaveStatus and updateClause error:");
                    return res.status(500).send("Error in Updating the Leave Status");
                }

                // Send email with the complete leave details
                sendLeaveEmail(leaveDetails);
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Leaves Found");
        }
    });
});

function getStatusName(statusId) {
    const leavesInternalStatusList = projectConstantsLocal.LEAVE_STATUS
    if (Array.isArray(leavesInternalStatusList) && leavesInternalStatusList.length > 0) {
        let leaveStatusName = leavesInternalStatusList.filter(
            (leaveStatus) => leaveStatus.id == statusId
        );
        return (leaveStatusName.length > 0 && leaveStatusName[0].name) || '';
    }
    return '';
}

function capitalizeFirst(value) {
    if (value && typeof value === 'string') {
        value = value.trim();
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    return '';
}
module.exports = {
    getLeaveById,
    getLeaves,
    getLeavesCount,
    createLeave,
    updateLeave,
    deleteLeave,
    changeLeaveStatus
};
