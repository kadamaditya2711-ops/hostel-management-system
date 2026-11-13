const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const { authorizeRoles } =
    require("../middleware/role.middleware");

const {
    getStudentFees,
    getStudentAttendance
} = require(
    "../controllers/student-portal.controller"
);


router.get(
    "/fees",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getStudentFees
);


router.get(
    "/attendance",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getStudentAttendance
);


module.exports = router;