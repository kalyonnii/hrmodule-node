const express = require("express");
const {
    getHolidayById,
    getHolidaysCount,
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
} = require("../controllers/holidaysController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getHolidays).post(validateToken, createHoliday);

router.route("/total").get(validateToken, getHolidaysCount);

router
    .route("/:id")
    .get(validateToken, getHolidayById)
    .put(validateToken, updateHoliday)
    .delete(validateToken, deleteHoliday);


module.exports = router;
