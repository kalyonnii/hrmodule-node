const express = require("express");
const {
    getPayroll,
    getPayrollById,
    getPayrollCount,
    createPayroll,
    updatePayroll,
    deletePayroll
} = require("../controllers/payrollController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getPayroll).post(validateToken, createPayroll);

router.route("/total").get(validateToken, getPayrollCount);

router
    .route("/:id")
    .get(validateToken, getPayrollById)
    .put(validateToken, updatePayroll)
    .delete(validateToken, deletePayroll);

module.exports = router;
