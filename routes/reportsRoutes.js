const express = require("express");

const {
    exportEmployees,
    exportInterviews,
    exportSalarySheet,
    exportLeaves,
    exportHolidays
} = require("../controllers/reportsController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/employees").get(validateToken, exportEmployees);
router.route("/interviews").get(validateToken, exportInterviews);
router.route("/salarysheet").get(validateToken, exportSalarySheet);
router.route("/leaves").get(validateToken, exportLeaves);
router.route("/holidays").get(validateToken, exportHolidays);





module.exports = router;
