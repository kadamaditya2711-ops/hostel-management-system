const express = require("express");

const {
    addStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    searchStudents
} = require("../controllers/students.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addStudent);
router.get("/", getStudents);
router.get("/search", searchStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;