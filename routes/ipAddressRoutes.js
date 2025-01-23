const express = require("express");
const {
    createIpAddress,
    getIpAddress,
    getIpAddressCount,
    getIpAddressById,
    updateIpAddress,
    deleteIpAddress
} = require("../controllers/ipAddressController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router
    .route("/")
    .get(validateToken, getIpAddress)
    .post(validateToken, createIpAddress);
router.route("/total").get(validateToken, getIpAddressCount);
router
    .route("/:id")
    .get(validateToken, getIpAddressById)
    .delete(validateToken, deleteIpAddress)
    .put(validateToken, updateIpAddress);

module.exports = router;
