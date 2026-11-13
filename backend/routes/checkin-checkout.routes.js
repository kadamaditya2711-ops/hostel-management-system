const express = require("express");

const {
    studentCheckIn,
    studentCheckOut,
    getCheckIns,
    getCheckOuts
} = require("../controllers/checkin-checkout.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/checkin", studentCheckIn);
router.post("/checkout", studentCheckOut);

router.get("/checkins", getCheckIns);
router.get("/checkouts", getCheckOuts);

module.exports = router;