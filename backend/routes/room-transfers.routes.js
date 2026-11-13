const express = require("express");

const {
    transferStudent,
    getTransfers
} = require("../controllers/room-transfers.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", transferStudent);
router.get("/", getTransfers);

module.exports = router;