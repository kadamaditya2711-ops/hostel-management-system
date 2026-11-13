const express = require("express");

const {
    allocateBed,
    getAllocations,
    endAllocation
} = require("../controllers/allocations.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", allocateBed);
router.get("/", getAllocations);
router.put("/:id/end", endAllocation);

module.exports = router;