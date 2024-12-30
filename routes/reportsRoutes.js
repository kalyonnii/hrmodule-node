const express = require("express");

const {
    exportEmployees,
    exportInterviews,
    exportSalarySheet,
    exportLeaves,
    exportHolidays,
    exportIncentives,
    getReports,
    getReportsCount,
    deleteReport,
    exportAttendance,
    exportSalaryHikes,
    exportDesignations,
    exportUsers
} = require("../controllers/reportsController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/employees").get(validateToken, exportEmployees);
router.route("/interviews").get(validateToken, exportInterviews);
router.route("/salarysheet").get(validateToken, exportSalarySheet);
router.route("/leaves").get(validateToken, exportLeaves);
router.route("/holidays").get(validateToken, exportHolidays);
router.route("/incentives").get(validateToken, exportIncentives);
router.route("/salaryhikes").get(validateToken, exportSalaryHikes);
router.route("/designations").get(validateToken, exportDesignations);
router.route("/users").get(validateToken, exportUsers);
router.route("/attendance").get(validateToken, exportAttendance);
router.route("/reportsdata").get(validateToken, getReports);
router.route("/reportsCount").get(validateToken, getReportsCount);

router
    .route("/:id")
    .delete(validateToken, deleteReport);


module.exports = router;
