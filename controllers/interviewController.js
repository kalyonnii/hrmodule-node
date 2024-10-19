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

const getInterviewCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as interviewsCount FROM interviews";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getInterviewCount error");
        }
        const interviewsCount = result[0]["interviewsCount"];
        res.status(200).send(String(interviewsCount));
    });
});

const getInterviews = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM interviews";
    const queryParams = req.query;
    // queryParams["sort"] = "scheduledDate";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getInterviews error:");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getInterviewById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM interviews WHERE interviewId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getInterviewById error:");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createInterview = asyncHandler((req, res) => {
    // let interviewId = generateRandomNumber(9);
    let interviewId = "I-" + generateRandomNumber(6);
    // console.log(req)
    req.body["interviewId"] = interviewId;
    req.body["interviewInternalStatus"] = 1;
    req.body["lastInterviewInternalStatus"] = 1;
    req.body["createdBy"] = req.user.username;
    req.body["lastUpdatedBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO interviews (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createInterview error:");
        }
        res.status(200).send(true);
    });
});

const updateInterview = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("interviews", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE interviews SET ${updateClause} WHERE interviewId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateInterview error:", updateErr);
            return res.status(500).send("Internal server error");
        }
        return res.status(200).send(updateResult);
    });
});



const deleteInterview = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `DELETE FROM interviews WHERE interviewId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteInterview error:", err);
            return res.status(500).send("Internal server error");
        }
        res.status(200).json({ message: "Interview Deleted Successfully" });
    });
});

const changeInterviewStatus = asyncHandler((req, res) => {
    const id = req.params.interviewId;
    const statusId = req.params.statusId;
    const createSql = `SELECT * FROM interviews WHERE interviewId = '${id}'`;
    dbConnect.query(createSql, (err, result) => {
        if (err) {
            console.log("changeInterviewStatus error:");
        }
        if (result && result[0] && statusId) {
            let statusData = {
                lastInterviewInternalStatus: result[0].interviewInternalStatus,
                interviewInternalStatus: statusId,
            };
            const updateClause = updateClauseHandler(statusData);
            const sql = `UPDATE interviews SET ${updateClause} WHERE interviewId = '${id}'`;
            dbConnect.query(sql, (err, result) => {
                if (err) {
                    console.log("changeInterviewStatus and updatecalss error:");
                }
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Interviews Found");
        }
    });
});
module.exports = {
    getInterviewById,
    getInterviews,
    getInterviewCount,
    createInterview,
    updateInterview,
    deleteInterview,
    changeInterviewStatus
};
