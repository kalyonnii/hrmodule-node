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

const getDesignationCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as designationsCount FROM designations";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getDesignationCount error");
            return res.status(500).send("Error In fetching Designations Count");
        }
        const designationsCount = result[0]["designationsCount"];
        res.status(200).send(String(designationsCount));
    });
});

const getDesignations = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM designations";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    console.log(sql)
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getDesignations error:");
            return res.status(500).send("Error In Fetching Designations");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getDesignationsById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM designations WHERE designationId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getDesignationsById error:");
            return res.status(500).send("Error In fetching Designation Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createDesignation = asyncHandler((req, res) => {
    let designationId = "D-" + generateRandomNumber(6);
    req.body["designationId"] = designationId;
    req.body["designationInternalStatus"] = 1;
    req.body["lastDesignationInternalStatus"] = 1;
    req.body["createdBy"] = req.user.username;
    req.body["lastUpdatedBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO designations (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createDesignation error:", err);
            return res.status(500).send("Error In creating Designation");
        }
        res.status(200).send(true);
    });
});

const updateDesignation = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("designations", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    req.body["lastUpdatedBy"] = req.user.username;
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE designations SET ${updateClause} WHERE designationId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateDesignation error:", updateErr);
            return res.status(500).send("Error in Updating the Designation Details");
        }
        return res.status(200).send(updateResult);
    });
});



const deleteDesignation = asyncHandler((req, res) => {
    const sql = `DELETE FROM designations WHERE designationId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteDesignation error:", err);
            return res.status(500).send("Error in Deleting the Designation");
        }
        res.status(200).json({ message: "Designation Deleted Successfully" });
    });
});

const changeDesignationStatus = asyncHandler((req, res) => {
    const id = req.params.designationId;
    const statusId = req.params.statusId;
    console.log(id)
    const createSql = `SELECT * FROM designations WHERE designationId = '${id}'`;
    dbConnect.query(createSql, (err, result) => {
        if (err) {
            console.log("changeDesignationStatus error:");
            return res.status(500).send("Error in Changing the Designation Status");
        }
        if (result && result[0] && statusId) {
            let statusData = {
                lastDesignationInternalStatus: result[0].designationInternalStatus,
                designationInternalStatus: statusId,
            };
            const updateClause = updateClauseHandler(statusData);
            const sql = `UPDATE designations SET ${updateClause} WHERE designationId = '${id}'`;
            dbConnect.query(sql, (err, result) => {
                if (err) {
                    console.log("changeDesignationStatus and updatecalss error:");
                    return res.status(500).send("Error in Updating the Designation Status");
                }
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Designations Found");
        }
    });
});
module.exports = {
    getDesignationsById,
    getDesignations,
    getDesignationCount,
    createDesignation,
    updateDesignation,
    deleteDesignation,
    changeDesignationStatus
};
