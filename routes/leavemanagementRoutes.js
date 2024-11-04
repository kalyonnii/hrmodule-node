const express = require("express");
const {
    getLeaveById,
    getLeaves,
    getLeavesCount,
    createLeave,
    updateLeave,
    deleteLeave,
    changeLeaveStatus
} = require("../controllers/leavemanagementController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getLeaves).post(validateToken, createLeave);

router.route("/total").get(validateToken, getLeavesCount);


router
    .route("/:leaveId/changestatus/:statusId")
    .put(validateToken, changeLeaveStatus);

router
    .route("/:id")
    .get(validateToken, getLeaveById)
    .put(validateToken, updateLeave)
    .delete(validateToken, deleteLeave);


module.exports = router;
