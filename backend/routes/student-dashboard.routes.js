const express = require("express");
const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const { authorizeRoles } =
    require("../middleware/role.middleware");

const {
    getStudentDashboard
} = require("../controllers/student-dashboard.controller");

router.get(
    "/",
    authenticateToken,
    authorizeRoles("STUDENT"),
    getStudentDashboard
);

module.exports = router;