const express = require("express");

const router = express.Router();

const {
    registerStudent
} = require("../controllers/student-auth.controller");


// Student Registration
router.post(
    "/register",
    registerStudent
);


module.exports = router;