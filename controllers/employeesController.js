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

const getEmployeesCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as employeesCount FROM employees";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getEmployeesCount error");
        }
        const employeesCount = result[0]["employeesCount"];
        res.status(200).send(String(employeesCount));
    });
});



const createEmployeeFromInterview = asyncHandler((req, res) => {



    const phoneNumber = req.body.primaryPhone;
    const checkPhoneQuery = `SELECT * FROM employees WHERE primaryPhone = ?`;
    dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            res.status(500).json({ error: "Internal server error" });
        } else {
            if (result.length > 0) {
                const employee = result[0];
                res
                    .status(500)
                    .send(
                        `Employee already exists with phone number ${phoneNumber}, 
                        created by - ${employee.createdBy}, Employee id - ${employee.employeeId}, Employee Name - ${employee.employeeName}`
                    );
            } else {
                let employeeId = generateRandomNumber(9);
                console.log(req.body)
                req.body["employeeId"] = employeeId;
                req.body["employeeInternalStatus"] = 1;
                req.body["lastEmployeeInternalStatus"] = 1;
                req.body["createdBy"] = req.user.username;
                req.body["lastUpdatedBy"] = req.user.username;
                const createClause = createClauseHandler(req.body);
                const sql = `INSERT INTO employees (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createEmployeeFromInterview error:", err);
                    }
                    console.log(employeeId)
                    res.status(200).json({ id: employeeId });
                });
            }
        }
    });


});


const getEmployees = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM employees";
    const queryParams = req.query;
    console.log(queryParams)
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    console.log(sql)
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getEmployees error:");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getEmployeeById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM employees WHERE employeeId = ${req.params.id}`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getEmployeeById error:");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createEmployee = asyncHandler((req, res) => {
    const phoneNumber = req.body.primaryPhone;
    const checkPhoneQuery = `SELECT * FROM employees WHERE primaryPhone = ?`;
    dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            res.status(500).json({ error: "Internal server error" });
        } else {
            if (result.length > 0) {
                const employee = result[0];
                res
                    .status(500)
                    .send(
                        `Employee already exists with phone number ${phoneNumber}, 
                        created by - ${employee.createdBy}, Employee id - ${employee.employeeId}, Employee Name - ${employee.employeeName}`
                    );
            } else {
                let employeeId = generateRandomNumber(9);
                // console.log(req)
                req.body["employeeId"] = employeeId;
                req.body["employeeInternalStatus"] = 1;
                req.body["lastEmployeeInternalStatus"] = 1;
                req.body["createdBy"] = req.user.username;
                req.body["lastUpdatedBy"] = req.user.username;
                const createClause = createClauseHandler(req.body);
                const sql = `INSERT INTO employees (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createEmployee error:");
                    }
                    res.status(200).send(true);
                });
            }
        }
    });

});

const updateEmployee = asyncHandler((req, res) => {
    const id = req.params.id;
    const { primaryPhone } = req.body;
    console.log(primaryPhone)
    const checkRequiredFields = handleRequiredFields("employees", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const checkPhoneQuery = `SELECT * FROM employees WHERE primaryPhone = ? AND employeeId != ?`;
    dbConnect.query(checkPhoneQuery, [primaryPhone, id], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (result.length > 0) {
            const employee = result[0];
            return res
                .status(409)
                .send(
                    `Employee already exists with phone number ${primaryPhone}, created by - ${employee.createdBy}, Employee ID - ${employee.employeeId}, Employee Name - ${employee.employeeName}`
                );
        }
        const updateClause = updateClauseHandler(req.body);
        const updateSql = `UPDATE employees SET ${updateClause} WHERE employeeId = ?`;
        dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updateEmployee error:", updateErr);
                return res.status(500).send("Internal server error");
            }
            console.log(updateResult);
            return res.status(200).send(updateResult);
        });
    });
});


const deleteEmployee = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `DELETE FROM employees WHERE employeeId = ${req.params.id}`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteEmployee error:", err);
            return res.status(500).send("Internal server error");
        }
        res.status(200).json({ message: "Employee Deleted Successfully" });
    });
});

const changeEmployeeStatus = asyncHandler((req, res) => {
    const id = req.params.employeeId;
    const statusId = req.params.statusId;
    const createSql = `SELECT * FROM employees WHERE employeeId = ${id}`;
    dbConnect.query(createSql, (err, result) => {
        if (err) {
            console.log("changeEmployeeStatus error:");
        }
        if (result && result[0] && statusId) {
            let statusData = {
                lastEmployeeInternalStatus: result[0].employeeInternalStatus,
                employeeInternalStatus: statusId,
            };
            const updateClause = updateClauseHandler(statusData);
            const sql = `UPDATE employees SET ${updateClause} WHERE employeeId = ${id}`;
            dbConnect.query(sql, (err, result) => {
                if (err) {
                    console.log("changeEmployeeStatus and updatecalss error:");
                }
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Employees Found");
        }
    });
});
module.exports = {
    getEmployeeById,
    getEmployeesCount,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changeEmployeeStatus,
    createEmployeeFromInterview
};
