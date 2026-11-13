const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const { authorizeRoles } =
    require("../middleware/role.middleware");

const {
    getMyComplaints,
    createComplaint,
    getMyMaintenance,
    createMaintenance
} = require(
    "../controllers/student-services.controller"
);


// ======================================
// COMPLAINTS
// ======================================

router.get(
    "/complaints",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getMyComplaints
);


router.post(
    "/complaints",
    authenticateToken,
    authorizeRoles("STUDENT"),
    createComplaint
);


// ======================================
// MAINTENANCE
// ======================================

router.get(
    "/maintenance",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getMyMaintenance
);


router.post(
    "/maintenance",
    authenticateToken,
    authorizeRoles("STUDENT"),
    createMaintenance
);


module.exports = router;