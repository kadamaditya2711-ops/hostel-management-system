const express = require("express");

const {
    addVisitor,
    getVisitors
} = require("../controllers/visitor.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addVisitor);
router.get("/", getVisitors);

module.exports = router;