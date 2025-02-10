const express = require("express");
const {
    getUsers,
    getUserById,
    getUsersCount,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus
} = require("../controllers/usersController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getUsers).post(validateToken, createUser);

router.route("/total").get(validateToken, getUsersCount);
router
    .route("/:userId/changestatus/:statusId")
    .put(validateToken, changeUserStatus);

router
    .route("/:id")
    .get(validateToken, getUserById)
    .put(validateToken, updateUser)
    .delete(validateToken, deleteUser);

module.exports = router;
