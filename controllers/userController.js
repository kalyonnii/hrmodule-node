const dbConnect = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userLogin = asyncHandler(async (req, res) => {
    const { username, encryptedPassword } = req.body;
    if (!username || !encryptedPassword) {
        res.status(400).send("Please Enter Username and Password");
    }
    const sql = `SELECT * FROM users WHERE username = "${username}"`;
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.log("adminlogin error in controller");
        }
        if (
            result &&
            result.length == 1 &&
            (await bcrypt.compare(encryptedPassword, result[0].encryptedPassword))
        ) {
            const user = result[0];
            const accessToken = jwt.sign(
                {
                    user: user,
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "10h" }
            );
            res.status(200).json({ accessToken });
        } else {
            res.status(401).send("Username or Password Incorrect");
        }
    });
});
const userLogout = asyncHandler(async (req, res) => {
    const expiredToken = (
        req.headers.authorization || req.headers.Authorization
    ).replace("Bearer ", "");
    const decodedToken = jwt.decode(expiredToken);
    decodedToken.exp = Math.floor(Date.now() / 1000) - 60;
    const invalidatedToken = jwt.sign(
        decodedToken,
        process.env.ACCESS_TOKEN_SECRET
    );
    res.status(200).json({ message: "Logout successful" });

});

const userLogoutforIp = asyncHandler(async (req, res) => {
    const expiredToken = (
        req.headers.authorization || req.headers.Authorization
    ).replace("Bearer ", "");
    const decodedToken = jwt.decode(expiredToken);
    decodedToken.exp = Math.floor(Date.now() / 1000) - 60;
    const invalidatedToken = jwt.sign(
        decodedToken,
        process.env.ACCESS_TOKEN_SECRET
    );
    res.status(419).json({ message: "Logout successful" });
});
module.exports = { userLogout, userLogin, userLogoutforIp };
