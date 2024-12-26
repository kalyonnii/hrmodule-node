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

const getIncentivesCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as incentivesCount FROM incentives";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getIncentivesCount error");
            return res.status(500).send("Error in Fetching the Incentives Count");
        }
        const incentivesCount = result[0]["incentivesCount"];
        res.status(200).send(String(incentivesCount));
    });
});

const getIncentives = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM incentives";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getIncentives error:");
            return res.status(500).send("Error in Fetching the Incentives");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getIncentiveById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM incentives WHERE incentiveId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getIncentiveById error:");
            return res.status(500).send("Error in Fetching the Incentive Data");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});

const createIncentive = asyncHandler((req, res) => {
    let incentiveId = "C-" + generateRandomNumber(6);
    req.body["incentiveId"] = incentiveId;
    req.body["createdBy"] = req.user.username;
    req.body["lastUpdatedBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO incentives (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createIncentive error:");
            return res.status(500).send("Error in Creating the Incentive");
        }
        res.status(200).send(true);
    });
});

const updateIncentive = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("incentives", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    req.body["lastUpdatedBy"] = req.user.username;
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE incentives SET ${updateClause} WHERE incentiveId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateIncentive error:", updateErr);
            return res.status(500).send("Error in Updating the Incentive");
        }
        return res.status(200).send(updateResult);
    });
});

const deleteIncentive = asyncHandler((req, res) => {
    const sql = `DELETE FROM incentives WHERE incentiveId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteIncentive error:", err);
            return res.status(500).send("Error in Deleting the Incentive");
        }
        res.status(200).json({ message: "Incentive Deleted Successfully" });
    });
});

module.exports = {
    getIncentiveById,
    getIncentivesCount,
    getIncentives,
    createIncentive,
    updateIncentive,
    deleteIncentive,
};
