const express = require("express");

const {
    exportEmployees,
    exportInterviews,
    exportSalarySheet,
    exportLeaves,
    exportHolidays,
    getReports,
    getReportsCount,
    deleteReport,
    exportAttendance
} = require("../controllers/reportsController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/employees").get(validateToken, exportEmployees);
router.route("/interviews").get(validateToken, exportInterviews);
router.route("/salarysheet").get(validateToken, exportSalarySheet);
router.route("/leaves").get(validateToken, exportLeaves);
router.route("/holidays").get(validateToken, exportHolidays);
router.route("/attendance").get(validateToken, exportAttendance);
router.route("/reportsdata").get(validateToken, getReports);
router.route("/reportsCount").get(validateToken, getReportsCount);

router
    .route("/:id")
    .delete(validateToken, deleteReport);


module.exports = router;
