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

const getLeavesCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as leavesCount FROM leavemanagement";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    console.log(sql);
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
    req.body["createdBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO leavemanagement (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createLeave error:");
            return res.status(500).send("Error in Creating the Leave");
        }
        res.status(200).send(true);
    });
});

const updateLeave = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("leaves", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE leavemanagement SET ${updateClause} WHERE leaveId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateLeave error:", updateErr);
            return res.status(500).send("Error in Updating the Leave");
        }
        return res.status(200).send(updateResult);
    });
});



const deleteLeave = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `DELETE FROM leavemanagement WHERE leaveId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteLeave error:", err);
            return res.status(500).send("Error in Deleting the Leave");
        }
        res.status(200).json({ message: "Leave Deleted Successfully" });
    });
});

const changeLeaveStatus = asyncHandler((req, res) => {
    const id = req.params.leaveId;
    const statusId = req.params.statusId;
    const createSql = `SELECT * FROM leavemanagement WHERE leaveId = '${id}'`;
    dbConnect.query(createSql, (err, result) => {
        if (err) {
            console.log("changeLeaveStatus error:");
            return res.status(500).send("Error in Changing the Leave Status");
        }
        if (result && result[0] && statusId) {
            let statusData = {
                lastLeaveInternalStatus: result[0].leaveInternalStatus,
                leaveInternalStatus: statusId,
            };
            const updateClause = updateClauseHandler(statusData);
            const sql = `UPDATE leavemanagement SET ${updateClause} WHERE leaveId = '${id}'`;
            dbConnect.query(sql, (err, result) => {
                if (err) {
                    console.log("changeLeaveStatus and updatecalss error:");
                    return res.status(500).send("Error in Updating the Leave Status");
                }
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Leaves Found");
        }
    });
});
module.exports = {
    getLeaveById,
    getLeaves,
    getLeavesCount,
    createLeave,
    updateLeave,
    deleteLeave,
    changeLeaveStatus
};
