const express = require("express");

const {
    addHostel,
    getHostels,
    getHostelById,
    updateHostel,
    deleteHostel
} = require("../controllers/hostels.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addHostel);
router.get("/", getHostels);
router.get("/:id", getHostelById);
router.put("/:id", updateHostel);
router.delete("/:id", deleteHostel);

module.exports = router;