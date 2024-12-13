const express = require("express");
const {
    getSalaryHikesById,
    getSalaryHikes,
    getSalaryHikesCount,
    createSalaryHike,
    updateSalaryHike,
    deleteSalaryHike,
} = require("../controllers/salaryHikesController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getSalaryHikes).post(validateToken, createSalaryHike);

router.route("/total").get(validateToken, getSalaryHikesCount);

router
    .route("/:id")
    .get(validateToken, getSalaryHikesById)
    .put(validateToken, updateSalaryHike)
    .delete(validateToken, deleteSalaryHike);


module.exports = router;
