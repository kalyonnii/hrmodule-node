const dbConnect = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ipWhitelist = require("../middleware/ipAddress");
// const userLogin = asyncHandler(async (req, res) => {
//     const { username, encryptedPassword } = req.body;
//     if (!username || !encryptedPassword) {
//         res.status(400).send("Please Enter Username and Password");
//     }
//     const sql = `SELECT * FROM users WHERE username = "${username}"`;
//     dbConnect.query(sql, async (err, result) => {
//         if (err) {
//             console.log("adminlogin error in controller");
//         }
//         if (
//             result &&
//             result.length == 1 &&
//             (await bcrypt.compare(encryptedPassword, result[0].encryptedPassword))
//         ) {
//             const user = result[0];
//             const accessToken = jwt.sign(
//                 {
//                     user: user,
//                 },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: "3h" }
//             );
//             res.status(200).json({ accessToken });
//         } else {
//             res.status(401).send("Username or Password Incorrect");
//         }
//     });
// });

// const userLogin = asyncHandler(async (req, res) => {
//     const { username, encryptedPassword } = req.body;
//     if (!username || !encryptedPassword) {
//         return res.status(400).send("Please Enter Username and Password");
//     }
//     const sqlUser = `SELECT * FROM users WHERE username = ?`;
//     dbConnect.query(sqlUser, [username], async (err, userResult) => {
//         if (err) {
//             console.error("Error querying users table:", err);
//             return res.status(500).send("Internal Server Error");
//         }
//         if (
//             userResult &&
//             userResult.length === 1 &&
//             (await bcrypt.compare(encryptedPassword, userResult[0].encryptedPassword))
//         ) {
//             const user = userResult[0];
//             const accessToken = jwt.sign(
//                 { user },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: "3h" }
//             );
//             return res.status(200).json({ accessToken });
//         }
//         const sqlEmployee = `SELECT * FROM employees WHERE employeeName = ? AND employeeInternalStatus = 1 `;
//         dbConnect.query(sqlEmployee, [username], (err, employeeResult) => {
//             if (err) {
//                 console.error("Error querying employees table:", err);
//                 return res.status(500).send("Internal Server Error");
//             }
//             if (
//                 employeeResult &&
//                 employeeResult.length === 1 &&
//                 employeeResult[0].primaryPhone === encryptedPassword
//             ) {
//                 const user = employeeResult[0];
//                 const accessToken = jwt.sign(
//                     { user },
//                     process.env.ACCESS_TOKEN_SECRET,
//                     { expiresIn: "3h" }
//                 );
//                 return res.status(200).json({ accessToken });
//             } else {
//                 return res.status(401).send("Username or Password Incorrect");
//             }
//         });
//     });
// });


const userLogin = asyncHandler(async (req, res) => {
    const { username, encryptedPassword } = req.body;
    if (!username || !encryptedPassword) {
        return res.status(400).send("Please Enter Username and Password");
    }
    const sqlUser = `SELECT * FROM users WHERE username = ?`;
    dbConnect.query(sqlUser, [username], async (err, userResult) => {
        if (err) {
            console.error("Error querying users table:", err);
            return res.status(500).send("Error in Querying Users Table");
        }
        if (
            userResult &&
            userResult.length === 1 &&
            (await bcrypt.compare(encryptedPassword, userResult[0].encryptedPassword))
        ) {
            const user = userResult[0];
            const accessToken = jwt.sign(
                {
                    user: user,
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "3h" }
            );
            return res.status(200).json({ accessToken });
        }
        const sqlEmployee = `
            SELECT * FROM employees 
            WHERE employeeName = ? AND employeeInternalStatus = 1
        `;
        dbConnect.query(sqlEmployee, [username], (err, employeeResult) => {
            if (err) {
                console.error("Error querying employees table:", err);
                return res.status(500).send("Error in Querying in Employees Table");
            }
            if (
                employeeResult &&
                employeeResult.length === 1 &&
                employeeResult[0].primaryPhone === encryptedPassword
            ) {
                const employee = employeeResult[0];
                const sqlDesignation = `SELECT rbac FROM designations WHERE id = ?`;
                dbConnect.query(sqlDesignation, [employee.designation], (err, designationResult) => {
                    if (err) {
                        console.error("Error querying designation table:", err);
                        return res.status(500).send("Error in Querying Designation Table");
                    }
                    // console.log(designationResult)
                    const rbacRoles = designationResult.length > 0 ? designationResult[0].rbac : null;
                    // console.log(rbacRoles)
                    const user = {
                        ...employee,
                        rbac: rbacRoles,
                    };
                    const accessToken = jwt.sign(
                        { user },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: "3h" }
                    );
                    return res.status(200).json({ accessToken });
                });
            } else {
                return res.status(401).send("Username or Password Incorrect");
            }
        });
    });
});


// const userLogin = asyncHandler(async (req, res) => {
//     const { username, encryptedPassword } = req.body;

//     // Validate input
//     if (!username || !encryptedPassword) {
//         return res.status(400).send("Please Enter Username or Password");
//     }

//     try {
//         // Query users table for a general user
//         const sqlUser = `SELECT * FROM users WHERE username = ?`;
//         const [userResult] = await dbConnect.promise().query(sqlUser, [username]);

//         // Check if user login credentials match for a general user
//         if (
//             userResult &&
//             userResult.length === 1 &&
//             (await bcrypt.compare(encryptedPassword, userResult[0].encryptedPassword))
//         ) {
//             const user = userResult[0];
//             const accessToken = jwt.sign(
//                 { user },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: "3h" }
//             );

//             // Attach user to the request object
//             req.user = user;  // <-- attach user info to req object
//             return res.status(200).json({ accessToken });
//         }

//         // Query employees table for an employee login
//         const sqlEmployee = `
//             SELECT * FROM employees 
//             WHERE employeeName = ? AND employeeInternalStatus = 1
//         `;
//         const [employeeResult] = await dbConnect.promise().query(sqlEmployee, [username]);

//         // Check if employee login credentials match
//         if (
//             employeeResult &&
//             employeeResult.length === 1 &&
//             employeeResult[0].primaryPhone === encryptedPassword
//         ) {
//             const employee = employeeResult[0];

//             // Fetch RBAC roles based on designation
//             const sqlDesignation = `SELECT rbac FROM designations WHERE id = ?`;
//             const [designationResult] = await dbConnect.promise().query(sqlDesignation, [employee.designation]);

//             const rbacRoles = designationResult.length > 0 ? designationResult[0].rbac : null;

//             // Add RBAC roles to employee object
//             const user = {
//                 ...employee,
//                 rbac: rbacRoles,
//             };

//             req.user = user; // <-- attach employee object to req.user
//             console.log("req.user in userLogin:", req.user);

//             const accessToken = jwt.sign(
//                 { user },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: "3h" }
//             );

//             return res.status(200).json({ accessToken });
//         } else {
//             return res.status(401).send("Username or Password Incorrect");
//         }
//     } catch (error) {
//         console.error("Error during login:", error);
//         return res.status(500).send("Internal Server Error");
//     }
// });

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
    res.status(419).send("Access denied. IP not allowed");
});
module.exports = { userLogout, userLogin, userLogoutforIp };
