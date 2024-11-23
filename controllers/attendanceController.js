const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
    createClauseHandler,
    updateClauseHandler,
} = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const getAttendanceCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as attendanceCount FROM attendance";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getAttendanceCount error");
            return res.status(500).send("Error in Fetching the Attendance Count");
        }
        const attendanceCount = result[0]["attendanceCount"];
        res.status(200).send(String(attendanceCount));
    });
});

const getAttendance = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM attendance";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getAttendance error:");
            return res.status(500).send("Error in Fetching the Attendance");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getAttendanceById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM attendance WHERE attendanceId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getAttendanceById error:");
            return res.status(500).send("Error in Fetching the Attendance Data");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createAttendance = asyncHandler((req, res) => {
    const date = req.body.attendanceDate;
    // console.log(date)
    const checkPhoneQuery = `SELECT * FROM attendance WHERE attendanceDate = ?`;
    dbConnect.query(checkPhoneQuery, [date], (err, result) => {
        if (err) {
            console.error("Error checking Attendance Date:", err);
            return res.status(500).send("Error In Checking the Attendance Date");
        } else {
            if (result.length > 0) {
                const attendance = result[0];
                res
                    .status(500)
                    .send(
                        `Attendance already exists with this Date ${date}, 
                        created by - ${attendance.createdBy}, Attendance id - ${attendance.attendanceId}`
                    );
            } else {
                let attendanceId = "A-" + generateRandomNumber(6);
                req.body["attendanceId"] = attendanceId;
                req.body["createdBy"] = req.user.username;
                req.body["lastUpdatedBy"] = req.user.username;
                const createClause = createClauseHandler(req.body);
                const sql = `INSERT INTO attendance (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createAttendance error:");
                        return res.status(500).send("Error In Creating Attendance");
                    }
                    res.status(200).send(true);
                });
            }
        }
    });
});

const updateAttendance = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { attendanceDate, attendanceData } = req.body;
    // console.log(id)
    // console.log(attendanceDate)
    const checkRequiredFields = handleRequiredFields("attendance", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const checkPhoneQuery = `SELECT * FROM attendance WHERE attendanceDate = ? AND attendanceId != ?`;
    dbConnect.query(checkPhoneQuery, [attendanceDate, id], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).send("Error in Checking the Attendance Date");
        }
        if (result.length > 0) {
            const attendance = result[0];
            // console.log(attendance)
            return res
                .status(409)
                .send(
                    `Attendance already exists with Attendance Date ${attendanceDate}, created by - ${attendance.createdBy}, Attendance ID - ${attendance.attendanceId}`
                );
        }
        const lastupdatedby = req.user.username;
        const updateSql = `UPDATE attendance 
                           SET attendanceDate = ?, attendanceData = ? , lastUpdatedBy = ?
                           WHERE attendanceId = ?`;
        const values = [attendanceDate, JSON.stringify(attendanceData), lastupdatedby, id];
        dbConnect.query(updateSql, values, (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updateAttendance error:", updateErr);
                return res.status(500).send("Error in Updating the Attendance");
            }
            return res.status(200).send(updateResult);
        });
    });
});


const deleteAttendance = asyncHandler((req, res) => {
    // console.log(req.params)
    const sql = `DELETE FROM attendance WHERE attendanceId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteAttendance error:", err);
            return res.status(500).send("Error in Deleting the Attendance");
        }
        res.status(200).json({ message: "Attendance Deleted Successfully" });
    });
});


[
    {
        employeeid: 5642523,
        joiningdate: "04/15/2024",
        workingDays: 27,
        presentdays: 21,
        absentdays: 6,
        casualdays: 2,
        noofdoublelopdays: 2,
        latelopdays: 1,
        totalabsentdays: 10,
        totaldeductions: 10,
        salary: 10,
        daysalary: 866,
        netsalarywithoutdoublelop: 21666,
        netsalarywithdoublelop: 21000,
        petrolexpenses: 0,
        accountnumber: "874657346794",
        ifsccode: "SAHFS6567",
        branchname: "hyderabad"
    }
]

module.exports = {
    getAttendanceById,
    getAttendance,
    getAttendanceCount,
    createAttendance,
    updateAttendance,
    deleteAttendance,
};