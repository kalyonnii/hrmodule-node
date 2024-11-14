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

const getHolidaysCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as holidaysCount FROM holidays";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getHolidaysCount error");
            return res.status(500).send("Error in Fetching the Holidays Count");
        }
        const holidaysCount = result[0]["holidaysCount"];
        res.status(200).send(String(holidaysCount));
    });
});

const getHolidays = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM holidays";
    const queryParams = req.query;
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getHolidays error:");
            return res.status(500).send("Error in Fetching the Holidays");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getHolidayById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM holidays WHERE holidayId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getHolidayById error:");
            return res.status(500).send("Error in Fetching the Holiday Data");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});


const createHoliday = asyncHandler((req, res) => {
    let holidayId = "H-" + generateRandomNumber(6);
    req.body["holidayId"] = holidayId;
    req.body["createdBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO holidays (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createHoliday error:");
            return res.status(500).send("Error in Creating the Holiday");
        }
        res.status(200).send(true);
    });
});

const updateHoliday = asyncHandler((req, res) => {
    const id = req.params.id;
    const checkRequiredFields = handleRequiredFields("holidays", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE holidays SET ${updateClause} WHERE holidayId = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("updateHoliday error:", updateErr);
            return res.status(500).send("Error in Updating the Holiday");
        }
        return res.status(200).send(updateResult);
    });
});



const deleteHoliday = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `DELETE FROM holidays WHERE holidayId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteHoliday error:", err);
            return res.status(500).send("Error in Deleting the Holiday");
        }
        res.status(200).json({ message: "Holiday Deleted Successfully" });
    });
});


module.exports = {
    getHolidayById,
    getHolidaysCount,
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
};
