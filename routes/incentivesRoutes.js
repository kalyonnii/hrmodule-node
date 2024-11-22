const express = require("express");
const {
    getIncentiveById,
    getIncentivesCount,
    getIncentives,
    createIncentive,
    updateIncentive,
    deleteIncentive,
} = require("../controllers/incentivesController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getIncentives).post(validateToken, createIncentive);

router.route("/total").get(validateToken, getIncentivesCount);

router
    .route("/:id")
    .get(validateToken, getIncentiveById)
    .put(validateToken, updateIncentive)
    .delete(validateToken, deleteIncentive);


module.exports = router;
