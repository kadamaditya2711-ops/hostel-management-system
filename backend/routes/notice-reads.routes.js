const express = require("express");

const {
    markNoticeAsRead,
    getNoticeReads
} = require("../controllers/notice-reads.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", markNoticeAsRead);
router.get("/", getNoticeReads);

module.exports = router;