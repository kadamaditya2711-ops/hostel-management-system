const express = require("express");

const {
    addComplaint,
    getComplaints,
    updateComplaintStatus
} = require("../controllers/complaints.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addComplaint);
router.get("/", getComplaints);
router.put("/:id/status", updateComplaintStatus);

module.exports = router;