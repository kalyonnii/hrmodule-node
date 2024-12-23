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

const getSalaryHikesCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as salaryHikeCount FROM salaryhikes";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getSalaryHikesCount error");
            return res.status(500).send("Error In fetching Salary Hikes Count");
        }
        const salaryHikeCount = result[0]["salaryHikeCount"];
        res.status(200).send(String(salaryHikeCount));
    });
});

const getSalaryHikes = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM salaryhikes";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getSalaryHikes error:");
            return res.status(500).send("Error In Fetching Salary Hikes");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getSalaryHikesById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM salaryhikes WHERE hikeId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getSalaryHikesById error:");
            return res.status(500).send("Error In fetching Salry Hike Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createSalaryHike = asyncHandler((req, res) => {
    let hikeId = "S-" + generateRandomNumber(6);
    req.body["hikeId"] = hikeId;
    req.body["createdBy"] = req.user.username;
    req.body["lastUpdatedBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO salaryhikes (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createSalaryHike error:", err);
            return res.status(500).send("Error In creating Salary Hike");
        }
        res.status(200).send(true);
    });
});


// const createSalaryHike = asyncHandler((req, res) => {
//     let hikeId = "S-" + generateRandomNumber(6);
//     req.body["hikeId"] = hikeId;
//     req.body["createdBy"] = req.user.username;
//     req.body["lastUpdatedBy"] = req.user.username;

//     const employeeId = req.body.employeeId;
//     const newMonthlyHike = parseFloat(req.body.monthlyHike);
//     const checkEmployeeQuery = `SELECT monthlyHike FROM salaryhikes WHERE employeeId = ?`;
//     dbConnect.query(checkEmployeeQuery, [employeeId], (err, result) => {
//         if (err) {
//             console.log("Error checking employeeId:", err);
//             return res.status(500).send("Error in checking Employee ID");
//         }
//         if (result.length > 0) {
//             const currentMonthlyHike = parseFloat(result[0].monthlyHike);
//             const updatedMonthlyHike = currentMonthlyHike + newMonthlyHike;
//             req.body["monthlyHike"] = updatedMonthlyHike;
//         }
//         const createClause = createClauseHandler(req.body);
//         const insertQuery = `
//             INSERT INTO salaryhikes (${createClause[0]}) 
//             VALUES (${createClause[1]})
//         `;
//         dbConnect.query(insertQuery, (insertErr) => {
//             if (insertErr) {
//                 console.log("Error inserting new salary hike:", insertErr);
//                 return res.status(500).send("Error creating Salary Hike");
//             }
//             return res.status(200).send(true);
//         });
//     });
// });

const updateSalaryHike = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("salaryhikes", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    req.body["lastUpdatedBy"] = req.user.username;
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE salaryhikes SET ${updateClause} WHERE hikeId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateSalaryHike error:", updateErr);
            return res.status(500).send("Error in Updating the Salary Hike Details");
        }
        return res.status(200).send(updateResult);
    });
});



const deleteSalaryHike = asyncHandler((req, res) => {
    const sql = `DELETE FROM salaryhikes WHERE hikeId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteSalaryHike error:", err);
            return res.status(500).send("Error in Deleting the Salary Hike");
        }
        res.status(200).json({ message: "Salary Hike Deleted Successfully" });
    });
});

module.exports = {
    getSalaryHikesById,
    getSalaryHikes,
    getSalaryHikesCount,
    createSalaryHike,
    updateSalaryHike,
    deleteSalaryHike,
};
