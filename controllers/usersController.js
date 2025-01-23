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

const getUsersCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as usersCount FROM users";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getUsersCount error");
            return res.status(500).send("Error in Fetching the Users Count");
        }
        const usersCount = result[0]["usersCount"];
        res.status(200).send(String(usersCount));
    });
});

const getUsers = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM users";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getUsers error:");
            return res.status(500).send("Error in Fetching the Users");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getUserById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM users WHERE userId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getUserById error:");
            return res.status(500).send("Error in Fetching the User Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});

// const createUser = asyncHandler(async (req, res) => {
//     let userId = "U-" + generateRandomNumber(6);
//     let password = req.body.password;
//     let encryptedPassword = await bcrypt.hash(password, 12);
//     req.body["encryptedPassword"] = encryptedPassword;
//     req.body["userId"] = userId;
//     req.body["createdBy"] = req.user.username;
//     req.body["lastUpdatedBy"] = req.user.username;
//     const checkIfExistsQuery = `SELECT * FROM users WHERE username = ?`;
//     dbConnect.query(checkIfExistsQuery, [req.body.username], (err, results) => {
//         if (err) {
//             console.error("Error checking if user exists:", err);
//             return res.status(500).send("Error in Checking Username");
//         }
//         if (results.length > 0) {
//             res.status(400).send("Username already exists");
//             return;
//         }
//         const createClause = createClauseHandler(req.body);
//         const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;
//         dbConnect.query(sql, (err, result) => {
//             if (err) {
//                 console.log("createUser error:");
//                 return res.status(500).send("Error in Creating the User");
//             }
//             res.status(200).send(true);
//         });
//     });
// });


const createUser = asyncHandler(async (req, res) => {
    let userId = "U-" + generateRandomNumber(6);
    let password = req.body.password;
    let encryptedPassword = await bcrypt.hash(password, 12);
    req.body["encryptedPassword"] = encryptedPassword;
    req.body["userId"] = userId;
    req.body["createdBy"] = req.user.username;
    req.body["lastUpdatedBy"] = req.user.username;
    const checkIfExistsQuery = `SELECT * FROM users WHERE username = ?`;
    dbConnect.query(checkIfExistsQuery, [req.body.username], (err, results) => {
        if (err) {
            console.error("Error checking if user exists:", err);
            return res.status(500).send("Error in Checking Username");
        }
        if (results.length > 0) {
            res.status(400).send("Username already exists");
            return;
        }
        const createClause = createClauseHandler(req.body);
        const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;
        dbConnect.query(sql, (err, result) => {
            if (err) {
                console.log("createUser error:");
                return res.status(500).send("Error in Creating the User");
            }
            const rbacValues = {
                1: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,users,adminSalaryHikes,events,reports,ipAddress',
                2: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,adminSalaryHikes,events,reports',
                3: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,adminSalaryHikes,events,reports',
                4: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,users,adminSalaryHikes,events,reports,passwordView,delete,ipAddress',
            };
            const rbacValue = rbacValues[req.body.designation];
            if (rbacValue) {
                console.log(userId)
                const updateRbacQuery = `UPDATE users SET rbac = ? WHERE userId = ?`;
                dbConnect.query(updateRbacQuery, [rbacValue, userId], (err, updateResult) => {
                    if (err) {
                        console.error("Error updating RBAC:", err);
                        return res.status(500).send("Error in Updating RBAC");
                    }
                    res.status(200).send(true);
                });
            } else {
                res.status(200).send(true);
            }
        });
    });
});
const updateUser = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("users", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    let password = req.body.password.toString();
    let encryptedPassword = await bcrypt.hash(password, 12);
    req.body["encryptedPassword"] = encryptedPassword;
    const checkIfExistsQuery = `SELECT * FROM users WHERE username = ? AND userId !=?`;
    dbConnect.query(checkIfExistsQuery, [req.body.username, id], (err, results) => {
        if (err) {
            console.error("Error checking if user exists:", err);
            return res.status(500).send("Error in Checking Username");
        }
        if (results.length > 0) {
            res.status(400).send("Username already exists");
            return;
        }
        req.body["lastUpdatedBy"] = req.user.username;
        const updateClause = updateClauseHandler(req.body);
        const updateSql = `UPDATE users SET ${updateClause} WHERE userId = ?`;
        dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updateUser error:", updateErr);
                return res.status(500).send("Error in Updating User");
            }
            const rbacValues = {
                1: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,users,adminSalaryHikes,events,reports,ipAddress',
                2: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,adminSalaryHikes,events,reports',
                3: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,adminSalaryHikes,events,reports',
                4: 'adminEmployees,interviews,adminAttendance,adminPayroll,adminLeaves,holidays,adminIncentives,departments,users,adminSalaryHikes,events,reports,passwordView,delete,ipAddress',
            };
            const rbacValue = rbacValues[req.body.designation];
            if (rbacValue) {
                const updateRbacQuery = `UPDATE users SET rbac = ? WHERE userId = ?`;
                dbConnect.query(updateRbacQuery, [rbacValue, id], (err, updateResult) => {
                    if (err) {
                        console.error("Error updating RBAC:", err);
                        return res.status(500).send("Error in Updating RBAC");
                    }
                    console.log(updateResult)
                    res.status(200).send(updateResult);
                });
            } else {
                return res.status(200).send(updateResult);
            }
        });
    });
});

const deleteUser = asyncHandler((req, res) => {
    const sql = `DELETE FROM users WHERE userId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteUser error:", err);
            return res.status(500).send("Error in Deleting User");
        }
        res.status(200).json({ message: "User Deleted Successfully" });
    });
});

module.exports = {
    getUsers,
    getUserById,
    getUsersCount,
    createUser,
    updateUser,
    deleteUser
};
