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
            return res.status(500).send("Error In fetching Interviews Count");
        }
        const interviewsCount = result[0]["interviewsCount"];
        res.status(200).send(String(interviewsCount));
    });
});

const getInterviews = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM interviews";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getInterviews error:");
            return res.status(500).send("Error In fetching Interviews");
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
            return res.status(500).send("Error In fetching Interview Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createInterview = asyncHandler((req, res) => {
    const phoneNumber = req.body.primaryPhone;
    const checkPhoneQuery = `SELECT * FROM interviews WHERE primaryPhone = ?`;
    dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).send("Error in checking phone number");
        } else {
            if (result.length > 0) {
                const interview = result[0];
                res
                    .status(500)
                    .send(
                        `Interview already exists with phone number ${phoneNumber}, 
                        created by - ${interview.createdBy}, Interview id - ${interview.interviewId}, Candidate Name - ${interview.candidateName}`
                    );
            } else {
                let interviewId = "I-" + generateRandomNumber(6);
                req.body["interviewId"] = interviewId;
                req.body["interviewInternalStatus"] = 1;
                req.body["lastInterviewInternalStatus"] = 1;
                req.body["createdBy"] = req.user.username;
                req.body["lastUpdatedBy"] = req.user.username;
                const createClause = createClauseHandler(req.body);
                const sql = `INSERT INTO interviews (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createInterview error:", err);
                        return res.status(500).send("Error In creating Interview");
                    }
                    res.status(200).send(true);
                });
            }
        }
    });
});

const updateInterview = asyncHandler((req, res) => {
    const id = req.params.id;
    const { primaryPhone } = req.body;
    const checkRequiredFields = handleRequiredFields("interviews", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const checkPhoneQuery = `SELECT * FROM interviews WHERE primaryPhone = ? AND interviewId != ?`;
    dbConnect.query(checkPhoneQuery, [primaryPhone, id], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).send("Error in checking phone number");
        }
        if (result.length > 0) {
            const interview = result[0];
            return res
                .status(409)
                .send(
                    `Interview already exists with phone number ${primaryPhone}, created by - ${interview.createdBy}, Interview ID - ${interview.interviewId}, Candidate Name - ${interview.candidateName}`
                );
        }
        const updateClause = updateClauseHandler(req.body);
        const updateSql = `UPDATE interviews SET ${updateClause} WHERE interviewId = ?`;
        dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updateInterview error:", updateErr);
                return res.status(500).send("Error in Updating the Interview Details");
            }
            return res.status(200).send(updateResult);
        });
    });
});


const deleteInterview = asyncHandler((req, res) => {
    // console.log(req.params)
    const sql = `DELETE FROM interviews WHERE interviewId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteInterview error:", err);
            return res.status(500).send("Error in Deleting the Interview");
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
            return res.status(500).send("Error in Changing the Interview Status");
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
                    return res.status(500).send("Error in Updating the Interview Status");
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
