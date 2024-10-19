const express = require("express");
const {
    getEmployeeById,
    getEmployeesCount,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changeEmployeeStatus
} = require("../controllers/employeesController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getEmployees).post(validateToken, createEmployee);

router.route("/total").get(validateToken, getEmployeesCount);


router
    .route("/:employeeId/changestatus/:statusId")
    .put(validateToken, changeEmployeeStatus);

router
    .route("/:id")
    .get(validateToken, getEmployeeById)
    .put(validateToken, updateEmployee)
    .delete(validateToken, deleteEmployee);


module.exports = router;
