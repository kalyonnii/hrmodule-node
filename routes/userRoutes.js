const express = require("express");
const {
  adminLogin,
  userLogout,
  userLogin,
} = require("../controllers/userController");
const router = express.Router();

router.route("/login").post(userLogin);
router.route("/logout").post(userLogout);

module.exports = router;
