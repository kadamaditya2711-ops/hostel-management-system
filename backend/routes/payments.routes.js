const express = require("express");

const {
    makePayment,
    getPayments
} = require("../controllers/payments.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", makePayment);
router.get("/", getPayments);

module.exports = router;