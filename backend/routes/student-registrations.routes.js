const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const {
    getPendingRegistrations,
    getRegistrationById,
    approveStudent,
    rejectStudent
} = require("../controllers/student-registrations.controller");


// Get pending student registrations
router.get(
    "/pending",
    authenticateToken,
    getPendingRegistrations
);


// Get one student registration
router.get(
    "/:id",
    authenticateToken,
    getRegistrationById
);


// Approve student
router.patch(
    "/:id/approve",
    authenticateToken,
    approveStudent
);


// Reject student
router.patch(
    "/:id/reject",
    authenticateToken,
    rejectStudent
);


module.exports = router;