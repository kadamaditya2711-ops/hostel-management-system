const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const { authorizeRoles } =
    require("../middleware/role.middleware");

const {
    getStudentNotices,
    markNoticeRead,
    getStudentVisitors
} = require(
    "../controllers/student-extra.controller"
);


// =====================================================
// NOTICES
// =====================================================

router.get(
    "/notices",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getStudentNotices
);


router.post(
    "/notices/:id/read",
    authenticateToken,
    authorizeRoles("STUDENT"),
    markNoticeRead
);


// =====================================================
// VISITORS
// =====================================================

router.get(
    "/visitors",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getStudentVisitors
);


module.exports = router;