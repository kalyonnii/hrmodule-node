const express = require("express");
const {
    getInterviewById,
    getInterviews,
    getInterviewCount,
    createInterview,
    updateInterview,
    deleteInterview,
    changeInterviewStatus
} = require("../controllers/interviewController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getInterviews).post(validateToken, createInterview);

router.route("/total").get(validateToken, getInterviewCount);


router
    .route("/:interviewId/changestatus/:statusId")
    .put(validateToken, changeInterviewStatus);

router
    .route("/:id")
    .get(validateToken, getInterviewById)
    .put(validateToken, updateInterview)
    .delete(validateToken, deleteInterview);


module.exports = router;
