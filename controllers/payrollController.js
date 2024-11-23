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

const getPayrollCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as payrollCount FROM payroll";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getPayrollCount error");
            return res.status(500).send("Error in Fetching the Payroll Count");
        }
        const payrollCount = result[0]["payrollCount"];
        res.status(200).send(String(payrollCount));
    });
});

const getPayroll = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM payroll";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getPayroll error:");
            return res.status(500).send("Error in Fetching the Payroll");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getPayrollById = asyncHandler((req, res) => {
    // console.log(req.params)
    const sql = `SELECT * FROM payroll WHERE payslipId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getPayrollById error:");
            return res.status(500).send("Error in Fetching the Payroll Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createPayroll = asyncHandler(async (req, res) => {

    const payrollMonth = req.body.payrollMonth;
    const employeeId = req.body.employeeId;
    const checkPhoneQuery = `SELECT * FROM payroll WHERE payrollMonth = ? AND employeeId = ?`;
    dbConnect.query(checkPhoneQuery, [payrollMonth, employeeId], (err, result) => {
        if (err) {
            console.error("Error checking Payroll Month And Employee:", err);
            return res.status(500).send("Error in Checking the phone Number From Interview");
        } else {
            if (result.length > 0) {
                const payroll = result[0];
                res
                    .status(500)
                    .send(
                        `The payroll for ${payrollMonth} already exists for the Employee ${payroll.employeeName}  , 
                        Employee Id - ${employeeId}, created by - ${payroll.createdBy}`
                    );
            } else {
                let payslipId = "P-" + generateRandomNumber(6);
                req.body["payslipId"] = payslipId;
                req.body["createdBy"] = req.user.username;
                req.body["lastUpdatedBy"] = req.user.username;
                const createClause = createClauseHandler(req.body);
                const sql = `INSERT INTO payroll (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createPayroll error:");
                        return res.status(500).send("Error in Creating the Payroll");
                    }
                    res.status(200).send(true);
                });

            }
        }
    });

});

const updatePayroll = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { payrollMonth, employeeId } = req.body;
    const checkRequiredFields = handleRequiredFields("payroll", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const checkPhoneQuery = `SELECT * FROM payroll WHERE payrollMonth = ?  AND employeeId = ? AND payslipId != ?`;
    dbConnect.query(checkPhoneQuery, [payrollMonth, employeeId, id], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).send("Error in Checking the Phone Number");
        }
        if (result.length > 0) {
            const payroll = result[0];
            return res
                .status(409)
                .send(
                    `The payroll for ${payrollMonth} already exists for the Employee ${payroll.employeeName}  , 
                        Employee Id - ${employeeId}, created by - ${payroll.createdBy}`
                );
        }
        req.body["lastUpdatedBy"] = req.user.username;
        const updateClause = updateClauseHandler(req.body);
        const updateSql = `UPDATE payroll SET ${updateClause} WHERE payslipId = ?`;
        dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updatePayroll error:", updateErr);
                return res.status(500).send("Error in Updating the Payroll");
            }
            return res.status(200).send(updateResult);
        });

    });
});



const deletePayroll = asyncHandler((req, res) => {
    // console.log(req.params)
    const sql = `DELETE FROM payroll WHERE payslipId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deletePayroll error:", err);
            return res.status(500).send("Error in Deleting the Payroll");
        }
        res.status(200).json({ message: "Payroll Deleted Successfully" });
    });
});


module.exports = {
    getPayroll,
    getPayrollById,
    getPayrollCount,
    createPayroll,
    updatePayroll,
    deletePayroll
};
