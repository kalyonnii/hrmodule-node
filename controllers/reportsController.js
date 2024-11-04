
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
const exportEmployees = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM employees";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'employees1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Employees: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Employees');
            worksheet.columns = projectConstantsLocal.EMPLOYEE_WORKSHEET_COLUMNS;
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

                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
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
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});


const exportInterviews = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM interviews";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'interviews1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Interviews: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
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
                            res.status(500).json({ error: "Internal server error" });
                            return;
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
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});



const exportSalarySheet = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM payroll";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'salarysheet1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Salary Sheet: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
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
                            res.status(500).json({ error: "Internal server error" });
                            return;
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
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
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
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
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
                            res.status(500).json({ error: "Internal server error" });
                            return;
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
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});


const exportHolidays = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM holidays";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'holidays1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting Holidays: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
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
                            res.status(500).json({ error: "Internal server error" });
                            return;
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
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});
module.exports = {
    exportEmployees,
    exportInterviews,
    exportSalarySheet,
    exportLeaves,
    exportHolidays

};