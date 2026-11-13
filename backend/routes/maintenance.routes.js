const express = require("express");

const {
    addMaintenanceRequest,
    getMaintenanceRequests,
    updateMaintenanceStatus
} = require("../controllers/maintenance.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addMaintenanceRequest);
router.get("/", getMaintenanceRequests);
router.put("/:id/status", updateMaintenanceStatus);

module.exports = router;