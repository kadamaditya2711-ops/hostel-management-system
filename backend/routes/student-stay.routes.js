const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const { authorizeRoles } =
    require("../middleware/role.middleware");

const {
    getCurrentStay,
    getCheckinHistory,
    getCheckoutHistory,
    getRoomTransferHistory
} = require(
    "../controllers/student-stay.controller"
);


// =====================================================
// CURRENT STAY
// =====================================================

router.get(
    "/current",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getCurrentStay
);


// =====================================================
// CHECK-IN HISTORY
// =====================================================

router.get(
    "/checkins",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getCheckinHistory
);


// =====================================================
// CHECK-OUT HISTORY
// =====================================================

router.get(
    "/checkouts",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getCheckoutHistory
);


// =====================================================
// ROOM TRANSFER HISTORY
// =====================================================

router.get(
    "/transfers",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getRoomTransferHistory
);


module.exports = router;