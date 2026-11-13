const express = require("express");

const {
    markAttendance,
    getAttendance,
    getStudentAttendance
} = require("../controllers/attendance.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/student/:studentId", getStudentAttendance);

module.exports = router;