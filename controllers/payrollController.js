const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const bcrypt = require("bcrypt");
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
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getPayrollById = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `SELECT * FROM payroll WHERE payslipId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getPayrollById error:");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createPayroll = asyncHandler(async (req, res) => {
    let payslipId = "U-" + generateRandomNumber(6);
    req.body["payslipId"] = payslipId;
    req.body["createdBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO payroll (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createPayroll error:");
        }
        res.status(200).send(true);
    });

});

const updatePayroll = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("payroll", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }

    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE payroll SET ${updateClause} WHERE payslipId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updatePayroll error:", updateErr);
            return res.status(500).send("Internal server error");
        }
        return res.status(200).send(updateResult);
    });
});



const deletePayroll = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `DELETE FROM payroll WHERE payslipId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deletePayroll error:", err);
            return res.status(500).send("Internal server error");
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
