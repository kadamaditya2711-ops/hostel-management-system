const express = require("express");

const {
    assignStudentFee,
    getStudentFees,
    getFeeByStudentId
} = require("../controllers/fees.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", assignStudentFee);
router.get("/", getStudentFees);
router.get("/student/:studentId", getFeeByStudentId);

module.exports = router;