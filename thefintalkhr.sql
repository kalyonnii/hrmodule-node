-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2024 at 01:33 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `thefintalkhrcopy`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `attendanceId` varchar(500) NOT NULL,
  `attendanceDate` varchar(500) NOT NULL,
  `attendanceData` longtext NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` int(11) NOT NULL,
  `designationId` varchar(500) NOT NULL,
  `designation` varchar(500) NOT NULL,
  `displayName` varchar(500) NOT NULL,
  `designationInternalStatus` varchar(500) NOT NULL,
  `lastDesignationInternalStatus` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(20) NOT NULL,
  `employeeId` varchar(500) NOT NULL,
  `customEmployeeId` varchar(500) NOT NULL,
  `employeeName` varchar(500) NOT NULL,
  `careOf` varchar(500) NOT NULL,
  `careOfName` varchar(500) NOT NULL,
  `dateOfBirth` varchar(500) NOT NULL,
  `gender` varchar(500) NOT NULL,
  `genderName` varchar(500) NOT NULL,
  `ofcBranch` varchar(500) NOT NULL,
  `ofcBranchName` varchar(500) NOT NULL,
  `designation` varchar(500) NOT NULL,
  `designationName` varchar(500) NOT NULL,
  `joiningDate` varchar(500) NOT NULL,
  `panNumber` varchar(500) NOT NULL,
  `panCard` longtext NOT NULL,
  `aadharNumber` varchar(500) NOT NULL,
  `aadharCard` longtext NOT NULL,
  `city` varchar(500) NOT NULL,
  `district` text NOT NULL,
  `state` text NOT NULL,
  `currentAddress` text NOT NULL,
  `permanentAddress` text NOT NULL,
  `primaryPhone` varchar(20) NOT NULL,
  `secondaryPhone` varchar(20) NOT NULL,
  `emailAddress` varchar(500) NOT NULL,
  `passPhoto` longtext NOT NULL,
  `salary` varchar(500) NOT NULL,
  `qualification` varchar(500) NOT NULL,
  `experience` varchar(500) NOT NULL,
  `prevCompanyName` varchar(500) NOT NULL,
  `prevEmployerName` varchar(500) NOT NULL,
  `prevEmployerContact` varchar(500) NOT NULL,
  `otherDocuments` longtext NOT NULL,
  `accountHolderName` varchar(500) NOT NULL,
  `bankName` varchar(500) NOT NULL,
  `bankBranch` varchar(500) NOT NULL,
  `ifscCode` varchar(500) NOT NULL,
  `accountNumber` varchar(500) NOT NULL,
  `offerLetter` longtext NOT NULL,
  `resignedDate` varchar(100) NOT NULL,
  `resignedReason` text NOT NULL,
  `resignationLetter` longtext NOT NULL,
  `experienceLetter` longtext NOT NULL,
  `issuedPayslips` varchar(100) NOT NULL,
  `anyDues` text NOT NULL,
  `terminationDate` varchar(50) NOT NULL,
  `terminationReason` text NOT NULL,
  `terminationLetter` longtext NOT NULL,
  `employeeInternalStatus` varchar(500) NOT NULL,
  `lastEmployeeInternalStatus` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `createdBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` int(11) NOT NULL,
  `holidayId` varchar(500) NOT NULL,
  `holidayName` varchar(500) NOT NULL,
  `date` varchar(500) NOT NULL,
  `day` varchar(500) NOT NULL,
  `description` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incentives`
--

CREATE TABLE `incentives` (
  `id` int(11) NOT NULL,
  `incentiveId` varchar(500) NOT NULL,
  `employeeId` varchar(500) NOT NULL,
  `employeeName` varchar(500) NOT NULL,
  `firstMonthFiles` longtext NOT NULL,
  `secondMonthFiles` longtext NOT NULL,
  `thirdMonthFiles` longtext NOT NULL,
  `incentiveAmount` varchar(500) NOT NULL,
  `incentiveApplicableMonth` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE `interviews` (
  `id` int(11) NOT NULL,
  `interviewId` varchar(500) NOT NULL,
  `candidateName` varchar(500) NOT NULL,
  `dateOfBirth` varchar(500) NOT NULL,
  `primaryPhone` varchar(500) NOT NULL,
  `qualification` varchar(500) NOT NULL,
  `currentAddress` text NOT NULL,
  `permanentAddress` text NOT NULL,
  `experience` varchar(500) NOT NULL,
  `scheduledLocation` varchar(500) NOT NULL,
  `scheduledLocationName` varchar(500) NOT NULL,
  `scheduledDate` varchar(500) NOT NULL,
  `postponedDate` varchar(500) NOT NULL,
  `attendedInterview` varchar(500) NOT NULL,
  `attendedInterviewName` varchar(500) NOT NULL,
  `remarks` text NOT NULL,
  `resume` longtext NOT NULL,
  `interviewInternalStatus` varchar(500) NOT NULL,
  `lastInterviewInternalStatus` varchar(500) NOT NULL,
  `referenceNo` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leavemanagement`
--

CREATE TABLE `leavemanagement` (
  `id` int(11) NOT NULL,
  `leaveId` varchar(500) NOT NULL,
  `employeeName` varchar(500) NOT NULL,
  `employeeId` varchar(500) NOT NULL,
  `leaveType` varchar(500) NOT NULL,
  `leaveFrom` varchar(500) NOT NULL,
  `leaveTo` varchar(500) NOT NULL,
  `noOfDays` varchar(500) NOT NULL,
  `durationType` varchar(500) NOT NULL,
  `reason` varchar(500) NOT NULL,
  `leaveInternalStatus` varchar(500) NOT NULL,
  `lastLeaveInternalStatus` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `payslipId` varchar(500) NOT NULL,
  `payrollMonth` varchar(500) NOT NULL,
  `employeeName` varchar(500) NOT NULL,
  `employeeId` varchar(500) NOT NULL,
  `customEmployeeId` varchar(500) NOT NULL,
  `joiningDate` varchar(500) NOT NULL,
  `workingDays` varchar(500) NOT NULL,
  `presentDays` varchar(500) NOT NULL,
  `paidDaysWithoutDLOP` varchar(500) NOT NULL,
  `paidDaysWithDLOP` varchar(500) NOT NULL,
  `paidDays` varchar(500) NOT NULL,
  `absentDays` varchar(500) NOT NULL,
  `casualDays` varchar(500) NOT NULL,
  `totalAbsentDays` varchar(500) NOT NULL,
  `doubleLopDays` varchar(500) NOT NULL,
  `lateLopDays` varchar(500) NOT NULL,
  `totalDeductedDaysWithoutDLOP` varchar(500) NOT NULL,
  `totalDeductedDaysWithDLOP` varchar(500) NOT NULL,
  `salary` varchar(500) NOT NULL,
  `daySalary` varchar(500) NOT NULL,
  `netSalaryWithoutDoubleLop` varchar(500) NOT NULL,
  `netSalaryWithDoubleLop` varchar(500) NOT NULL,
  `lopOption` varchar(500) NOT NULL,
  `netSalary` varchar(500) NOT NULL,
  `deductionsWithoutDLOP` varchar(500) NOT NULL,
  `deductionsWithDLOP` varchar(500) NOT NULL,
  `deductions` varchar(500) NOT NULL,
  `petrolExpenses` varchar(100) NOT NULL,
  `accountNumber` varchar(500) NOT NULL,
  `ifscCode` varchar(500) NOT NULL,
  `bankBranch` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reportId` varchar(500) NOT NULL,
  `reportType` varchar(500) NOT NULL,
  `reportUrl` longtext NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salaryhikes`
--

CREATE TABLE `salaryhikes` (
  `id` int(11) NOT NULL,
  `hikeId` varchar(500) NOT NULL,
  `employeeId` varchar(500) NOT NULL,
  `employeeName` varchar(500) NOT NULL,
  `basicSalary` varchar(500) NOT NULL,
  `monthlyHike` varchar(500) NOT NULL,
  `hikeDate` varchar(500) NOT NULL,
  `totalSalary` varchar(500) NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userId` varchar(1000) NOT NULL,
  `firstName` varchar(500) NOT NULL,
  `lastName` varchar(500) NOT NULL,
  `username` varchar(500) NOT NULL,
  `email` varchar(500) NOT NULL,
  `phoneNumber` varchar(500) NOT NULL,
  `designation` varchar(500) NOT NULL,
  `designationName` varchar(500) NOT NULL,
  `password` varchar(500) NOT NULL,
  `encryptedPassword` varchar(500) NOT NULL,
  `confirmPassword` varchar(1000) NOT NULL,
  `userImage` longtext NOT NULL,
  `createdBy` varchar(500) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(500) NOT NULL,
  `lastUpdatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userId`, `firstName`, `lastName`, `username`, `email`, `phoneNumber`, `designation`, `designationName`, `password`, `encryptedPassword`, `confirmPassword`, `userImage`, `createdBy`, `createdOn`, `lastUpdatedBy`, `lastUpdatedOn`) VALUES
(1, '123', 'Mudhiiguubba', 'Kalyonnii', 'kalyonnii', 'kalyonnii@gmail.com', '7331129435', '4', 'Support Team', 'kalyonnii@2024', '$2b$12$7qlMGjt2PlfjEK6Ak79G2Om3O.7H03eEzN2yuk/.5zED1X//evr3q', 'kalyonnii@2024', 'null', 'kalyonnii', '2024-12-14 11:52:47', 'kalyonnii', '2024-12-14 11:52:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `incentives`
--
ALTER TABLE `incentives`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leavemanagement`
--
ALTER TABLE `leavemanagement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `salaryhikes`
--
ALTER TABLE `salaryhikes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `incentives`
--
ALTER TABLE `incentives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interviews`
--
ALTER TABLE `interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leavemanagement`
--
ALTER TABLE `leavemanagement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salaryhikes`
--
ALTER TABLE `salaryhikes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
