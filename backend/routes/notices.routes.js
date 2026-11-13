const express = require("express");

const {
    addNotice,
    getNotices,
    updateNoticeStatus
} = require("../controllers/notices.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addNotice);
router.get("/", getNotices);
router.put("/:id/status", updateNoticeStatus);

module.exports = router;