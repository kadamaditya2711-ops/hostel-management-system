const express = require("express");

const {
    checkInVisitor,
    getVisitorLogs,
    checkOutVisitor
} = require("../controllers/visitor-logs.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", checkInVisitor);
router.get("/", getVisitorLogs);
router.put("/:id/checkout", checkOutVisitor);

module.exports = router;