const express = require("express");
const {
    getSalaryHikesById,
    getSalaryHikes,
    getSalaryHikesCount,
    createSalaryHike,
    updateSalaryHike,
    deleteSalaryHike,
    changeSalaryHikeStatus
} = require("../controllers/salaryHikesController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getSalaryHikes).post(validateToken, createSalaryHike);

router.route("/total").get(validateToken, getSalaryHikesCount);
router
    .route("/:hikeId/changestatus/:statusId")
    .put(validateToken, changeSalaryHikeStatus);

router
    .route("/:id")
    .get(validateToken, getSalaryHikesById)
    .put(validateToken, updateSalaryHike)
    .delete(validateToken, deleteSalaryHike);


module.exports = router;
