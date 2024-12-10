const express = require("express");
const {
    getDesignationsById,
    getDesignations,
    getDesignationCount,
    createDesignation,
    updateDesignation,
    deleteDesignation,
    changeDesignationStatus
} = require("../controllers/designationsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getDesignations).post(validateToken, createDesignation);

router.route("/total").get(validateToken, getDesignationCount);


router
    .route("/:designationId/changestatus/:statusId")
    .put(validateToken, changeDesignationStatus);

router
    .route("/:id")
    .get(validateToken, getDesignationsById)
    .put(validateToken, updateDesignation)
    .delete(validateToken, deleteDesignation);


module.exports = router;
