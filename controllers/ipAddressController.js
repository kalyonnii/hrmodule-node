const asyncHandler = require("express-async-handler");
const handleGlobalFilters = require("../middleware/filtersHandler");
const dbConnect = require("../config/dbConnection");

const parseNestedJSON = require("../middleware/parseHandler");
const {
    createClauseHandler,
    updateClauseHandler,
} = require("../middleware/clauseHandler");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const createIpAddress = asyncHandler((req, res) => {
    let ipAddressId = "IP-" + generateRandomNumber(6);
    req.body["ipAddressId"] = ipAddressId;
    req.body["createdBy"] = req.user.username;
    req.body["lastUpdatedBy"] = req.user.username;
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO ipaddresses (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("createIpAddress error:");
            return res.status(500).send("Error In creating Ip Address");
        }
        res.status(200).send(true);
    });
});

const getIpAddress = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM ipaddresses";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getIpAddress error:");
            return res.status(500).send("Error In fetching Ip Address");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getIpAddressCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as ipAddressCount FROM ipaddresses";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getIpAddressCount error");
            return res.status(500).send("Error In fetching Ip Address Count");
        }
        const ipAddressCount = result[0]["ipAddressCount"];
        res.status(200).send(String(ipAddressCount));
    });
});

const getIpAddressById = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `SELECT * FROM ipaddresses WHERE ipAddressId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getIpAddressById error:");
            return res.status(500).send("Error In fetching Ip Address Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result[0]);
    });
});

const updateIpAddress = asyncHandler((req, res) => {
    const id = req.params.id;
    const updateClause = updateClauseHandler(req.body);
    const sql = `UPDATE ipaddresses SET ${updateClause} WHERE ipAddressId = '${id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("updateIpAddress error:");
            return res.status(500).send("Error in Updating the Ip Address Details");
        }
        res.status(200).send(result);
    });
});

const deleteIpAddress = asyncHandler((req, res) => {
    const sql = `DELETE FROM ipaddresses WHERE ipAddressId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteIpAddress error:", err);
            return res.status(500).send("Error in Deleting the Ip Address");
        }
        res.status(200).json({ message: "Ip Address Deleted Successfully" });
    });
});

module.exports = {
    createIpAddress,
    getIpAddress,
    getIpAddressCount,
    getIpAddressById,
    updateIpAddress,
    deleteIpAddress
};