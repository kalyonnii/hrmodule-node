
const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const moment = require('moment');
const ExcelJS = require('exceljs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const {
    projectConstantsLocal
} = require("../constants/project-constants");

async function fetchSalaryHikes() {
    const sql = `SELECT * FROM salaryhikes`;
    return new Promise((resolve, reject) => {
        dbConnect.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

const cleanup = (directory, filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting the file:", unlinkErr);
            } else {
                console.log("File deleted successfully");
                if (fs.existsSync(directory)) {
                    fs.readdir(directory, (err, files) => {
                        if (err) {
                            console.error("Error reading directory:", err);
                        } else if (files.length === 0) {
                            fs.rmdir(directory, (rmdirErr) => {
                                if (rmdirErr) {
                                    console.error("Error deleting the directory:", rmdirErr);
                                } else {
                                    console.log("Directory deleted successfully");
                                }
                            });
                        }
                    });
                }
            }
        });
    }
};
// const exportEmployees = asyncHandler(async (req, res) => {
//     let reportId = "R-" + generateRandomNumber(6);
//     let sql = "SELECT * FROM employees";
//     const queryParams = req.query;
//     queryParams["sort"] = "createdOn";
//     const filtersQuery = handleGlobalFilters(queryParams);
//     sql += filtersQuery;
//     const uploadDirectory = path.join(__dirname, '../excelFiles');
//     const excelFileName = 'employees1.xlsx';
//     const excelFilePath = path.join(uploadDirectory, excelFileName);
//     dbConnect.query(sql, async (err, result) => {
//         if (err) {
//             console.error("Error exporting Employees: ", err);
//             return res.status(500).send("Error in Exporting the Employees");
//         }
//         try {
//             console.log(result)
//             for (let i = 0; i < result.length; i++) {
//                 result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
//                 result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
//             }
//             result = parseNestedJSON(result);
//             if (!fs.existsSync(uploadDirectory)) {
//                 fs.mkdirSync(uploadDirectory, { recursive: true });
//             }
//             const workbook = new ExcelJS.Workbook();
//             const worksheet = workbook.addWorksheet('Employees');
//             worksheet.columns = projectConstantsLocal.EMPLOYEE_WORKSHEET_COLUMNS;
//             worksheet.addRows(result);
//             await workbook.xlsx.writeFile(excelFilePath);
//             console.log("Excel file created successfully at", excelFilePath);
//             const fileContent = fs.readFileSync(excelFilePath);
//             const FormData = require('form-data');
//             const formData = new FormData();
//             formData.append('files', fileContent, {
//                 filename: excelFileName,
//                 contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//             });
//             const type = 'EMPLOYEES';
//             const employeeId = 'REPORTS';
//             const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
//             const response = await axios.post(url, formData, {
//                 headers: {
//                     ...formData.getHeaders(),
//                 },
//             });
//             if (response.status === 200) {
//                 if (response.data && response.data.links && response.data.links.length > 0) {
//                     const fileUrl = response.data.links[0];
//                     const fileUrlArray = JSON.stringify([fileUrl]);
//                     const createdBy = req.user.username;
//                     const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
//                     const values = [reportId, type, fileUrlArray, createdBy];
//                     dbConnect.query(insertSql, values, (insertErr, insertResult) => {
//                         if (insertErr) {
//                             console.error("Error inserting report URL into the database:", insertErr);
//                             return res.status(500).send("Error in Inserting the Reports Data with Url");
//                         }
//                         console.log("Report URL inserted successfully into the database");
//                         res.status(200).json({
//                             success: true,
//                             message: 'File uploaded successfully',
//                             fileUrl: fileUrl,
//                         });
//                     });
//                 } else {
//                     console.warn("Server returned 200 status but no file URL in response.");
//                     return res.status(500).send("Upload succeeded but no file URL returned");
//                 }
//             } else {
//                 console.error("Error uploading file:", response.data);
//                 return res.status(500).send("Error uploading file");
//             }
//         } catch (error) {
//             console.error("Error processing Employees:", error);
//             res.status(500).send("Error processing Employees");
//         } finally {
//             cleanup(uploadDirectory, excelFilePath);
//         }
//     });
// });
const exportEmployees = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM employees";
    const queryParams = req.query;
    queryParams["sort"] = "joiningDate,asc";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'employees1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Employees: ", err);
            return res.status(500).send("Error in Exporting the Employees");
        }
        try {
            const salaryHikeData = await fetchSalaryHikes();
            result.forEach((row) => {
                const { employeeId, salary, ...employeeData } = row;
                let currentSalary = Number(salary);
                const matchingHikes = salaryHikeData.filter((hike) => hike.employeeId === employeeId);
                let totalHike = 0;
                console.log(matchingHikes)
                matchingHikes.forEach((hike) => {
                    totalHike += Number(hike.monthlyHike);
                });
                row.salary = currentSalary + totalHike;
            });
            result.forEach((employee) => {
                employee.createdOn = moment(employee.createdOn).format('YYYY-MM-DD');
                employee.lastUpdatedOn = moment(employee.lastUpdatedOn).format('YYYY-MM-DD');
            });
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Employees');
            worksheet.columns = projectConstantsLocal.EMPLOYEE_WORKSHEET_COLUMNS;
            result.forEach((employee) => {
                worksheet.addRow(employee);
            });
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'EMPLOYEES';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?, ?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Employees:", error);
            res.status(500).send("Error processing Employees");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportInterviews = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM interviews";
    const queryParams = req.query;
    queryParams["sort"] = "scheduledDate";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'interviews1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Interviews: ", err);
            return res.status(500).send("Error in Exporting the Interviews");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Interviews');
            worksheet.columns = projectConstantsLocal.INTERVIEW_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'INTERVIEWS';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Interviews:", error);
            res.status(500).send("Error processing Interviews");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportSalarySheet = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM payroll";
    const queryParams = req.query;
    queryParams["sort"] = "joiningDate,asc";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'salarysheet1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Salary Sheet: ", err);
            return res.status(500).send("Error in Exporting the Salary Sheet");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Salarysheet');
            worksheet.columns = projectConstantsLocal.SALARYSHEET_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'SALARYSHEET';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;

                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Salary Sheet:", error);
            res.status(500).send("Error processing Salary Sheet");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportLeaves = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM leavemanagement";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'leaves1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Leaves: ", err);
            return res.status(500).send("Error in Exporting the Leaves");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Leaves');
            worksheet.columns = projectConstantsLocal.LEAVES_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'LEAVES';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Leaves:", error);
            res.status(500).send("Error processing Leaves");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportHolidays = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM holidays";
    const queryParams = req.query;
    queryParams["sort"] = "date,asc";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'holidays1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Holidays: ", err);
            return res.status(500).send("Error in Exporting the Holidays");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Holidays');
            worksheet.columns = projectConstantsLocal.HOLIDAYS_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'HOLIDAYS';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Holidays:", error);
            res.status(500).send("Error processing Holidays");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportAttendance = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM attendance";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'attendance1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);

    dbConnect.query(sql, async (err, attendanceRecords) => {
        if (err) {
            console.error("Error fetching attendance records:", err);
            return res.status(500).send("Error fetching attendance records");
        }
        if (attendanceRecords.length === 0) {
            return res.status(404).send("No attendance records found.");
        }
        const employeeQuery = "SELECT employeeId, employeeName, joiningDate, designationName, customEmployeeId FROM employees";
        dbConnect.query(employeeQuery, async (err, employeeRecords) => {
            if (err) {
                console.error("Error fetching employee records:", err);
                return res.status(500).send("Error fetching employee records");
            }
            try {
                const employeeDataMap = {};
                employeeRecords.forEach(record => {
                    employeeDataMap[record.employeeId] = {
                        employeeName: record.employeeName,
                        joiningDate: moment(record.joiningDate).format('YYYY-MM-DD'),
                        designationName: record.designationName,
                        customEmployeeId: record.customEmployeeId
                    };
                });
                const formattedAttendanceData = attendanceRecords.map(record => {
                    return {
                        attendanceId: record.attendanceId,
                        attendanceDate: moment(record.attendanceDate).format('YYYY-MM-DD'),
                        attendanceData: JSON.parse(record.attendanceData).map(data => {
                            const employeeDetails = employeeDataMap[data.employeeId] || {};
                            return {
                                employeeId: data.employeeId,
                                employeeName: employeeDetails.employeeName,
                                joiningDate: employeeDetails.joiningDate,
                                designationName: employeeDetails.designationName,
                                customEmployeeId: employeeDetails.customEmployeeId,
                                status: data.status,
                                checkInTime: data.checkInTime,
                                checkOutTime: data.checkOutTime,
                            };
                        })
                    };
                });
                const flattenedData = [];
                formattedAttendanceData.forEach(record => {
                    record.attendanceData.forEach(data => {
                        flattenedData.push({
                            attendanceId: record.attendanceId,
                            attendanceDate: record.attendanceDate,
                            employeeName: data.employeeName,
                            employeeId: data.employeeId,
                            joiningDate: data.joiningDate,
                            designationName: data.designationName,
                            customEmployeeId: data.customEmployeeId,
                            status: data.status,
                            checkInTime: data.checkInTime,
                            checkOutTime: data.checkOutTime,
                        });
                    });
                });
                if (!fs.existsSync(uploadDirectory)) {
                    fs.mkdirSync(uploadDirectory, { recursive: true });
                }
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Attendance');
                worksheet.columns = [
                    { header: "Attendance Id", key: "attendanceId" },
                    { header: "Employee ID", key: "employeeId" },
                    { header: "Attendance Date", key: "attendanceDate" },
                    { header: "Employee Name", key: "employeeName" },
                    { header: "Custom Employee ID", key: "customEmployeeId" },
                    { header: "Joining Date", key: "joiningDate" },
                    { header: "Designation", key: "designationName" },
                    { header: "Status", key: "status" },
                    { header: "Check-In Time", key: "checkInTime" },
                    { header: "Check-Out Time", key: "checkOutTime" },
                ];
                worksheet.addRows(flattenedData);
                await workbook.xlsx.writeFile(excelFilePath);
                console.log("Excel file created successfully at", excelFilePath);
                const fileContent = fs.readFileSync(excelFilePath);
                const FormData = require('form-data');
                const formData = new FormData();
                formData.append('files', fileContent, {
                    filename: excelFileName,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const type = 'ATTENDANCE';
                const employeeId = 'REPORTS';
                const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
                const response = await axios.post(url, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                });
                if (response.status === 200) {
                    if (response.data && response.data.links && response.data.links.length > 0) {
                        const fileUrl = response.data.links[0];
                        const fileUrlArray = JSON.stringify([fileUrl]);
                        const createdBy = req.user.username;
                        const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?, ?)";
                        const values = [reportId, type, fileUrlArray, createdBy];
                        dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                            if (insertErr) {
                                console.error("Error inserting report URL into the database:", insertErr);
                                return res.status(500).send("Error in Inserting the Reports Data with Url");
                            }
                            console.log("Report URL inserted successfully into the database");
                            res.status(200).json({
                                success: true,
                                message: 'File uploaded successfully',
                                fileUrl: fileUrl,
                            });
                        });
                    } else {
                        console.warn("Server returned 200 status but no file URL in response.");
                        return res.status(500).send("Upload succeeded but no file URL returned");
                    }
                } else {
                    console.error("Error uploading file:", response.data);
                    return res.status(500).send("Error uploading file");
                }
            } catch (error) {
                console.error("Error processing Attendance:", error);
                res.status(500).send("Error processing Attendance");
            } finally {
                cleanup(uploadDirectory, excelFilePath);
            }
        });
    });
});

const exportIncentives = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM incentives";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'incentives1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Incentives: ", err);
            return res.status(500).send("Error in Exporting the Incentives");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Incentives');
            worksheet.columns = projectConstantsLocal.INCENTIVE_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'INCENTIVES';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Incentives:", error);
            res.status(500).send("Error processing Incentives");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});
const exportDesignations = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM designations";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'departments1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Departments: ", err);
            return res.status(500).send("Error in Exporting the Departments");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Departments');
            worksheet.columns = projectConstantsLocal.DESIGNATIONS_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'DEPARTMENTS';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Departments:", error);
            res.status(500).send("Error processing Departments");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});
const exportSalaryHikes = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM salaryhikes";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'salaryhikes1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Salary Hikes: ", err);
            return res.status(500).send("Error in Exporting the Saalry Hikes");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Salaryhikes');
            worksheet.columns = projectConstantsLocal.SALARY_HIKES_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'SALARY_HIKES';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Salary Hikes:", error);
            res.status(500).send("Error processing Salary Hikes");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});


const exportUsers = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM users";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'users1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Users: ", err);
            return res.status(500).send("Error in Exporting the Users");
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Users');
            worksheet.columns = projectConstantsLocal.USERS_WORKSHEET_COLUMNS;
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'USERS';
            const employeeId = 'REPORTS';
            const url = `https://hrfiles.thefintalk.in/hrfiles?type=${type}&employeeId=${employeeId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.username;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            return res.status(500).send("Error in Inserting the Reports Data with Url");
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    return res.status(500).send("Upload succeeded but no file URL returned");
                }
            } else {
                console.error("Error uploading file:", response.data);
                return res.status(500).send("Error uploading file");
            }
        } catch (error) {
            console.error("Error processing Users:", error);
            res.status(500).send("Error processing Users");
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});
const getReports = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM reports";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getReports Error in controller");
            return res.status(500).send("Error in Fetching the Reports");
        }
        let reportsData = parseNestedJSON(result);
        res.status(200).send(reportsData);
    });
});
const getReportsCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as reportCount FROM reports";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("Error in getUsersCount:", err);
            return res.status(500).send("Error in Fetching the Reports Count");
        }
        const reportsCount = result[0]["reportCount"];
        res.status(200).send(String(reportsCount));
    });
});

const deleteReport = asyncHandler((req, res) => {
    console.log(req.params)
    const sql = `DELETE FROM reports WHERE reportId = '${req.params.id}'`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteReport error:", err);
            return res.status(500).send("Error In Deleting the Report");
        }
        res.status(200).json({ message: "Report Deleted Successfully" });
    });
});
module.exports = {
    exportEmployees,
    exportInterviews,
    exportSalarySheet,
    exportLeaves,
    exportHolidays,
    getReports,
    getReportsCount,
    deleteReport,
    exportAttendance,
    exportIncentives,
    exportSalaryHikes,
    exportDesignations,
    exportUsers
};