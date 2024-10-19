const express = require("express");
const {
    getAttendanceById,
    getAttendance,
    getAttendanceCount,
    createAttendance,
    updateAttendance,
    deleteAttendance,
} = require("../controllers/attendanceController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getAttendance).post(validateToken, createAttendance);

router.route("/total").get(validateToken, getAttendanceCount);



router
    .route("/:id")
    .get(validateToken, getAttendanceById)
    .put(validateToken, updateAttendance)
    .delete(validateToken, deleteAttendance);


module.exports = router;
