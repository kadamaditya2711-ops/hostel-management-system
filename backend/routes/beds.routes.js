const express = require("express");

const {
    addBed,
    getBeds,
    getBedById,
    updateBed,
    deleteBed
} = require("../controllers/beds.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addBed);
router.get("/", getBeds);
router.get("/:id", getBedById);
router.put("/:id", updateBed);
router.delete("/:id", deleteBed);

module.exports = router;