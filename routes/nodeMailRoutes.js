const express = require("express");
const {
    sendTerminationmail
} = require("../controllers/nodemail");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/terminationmail").post(validateToken, sendTerminationmail);


module.exports = router;
