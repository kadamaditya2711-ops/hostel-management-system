const express = require("express");

const {
    addFloor,
    getFloors,
    getFloorById,
    updateFloor,
    deleteFloor
} = require("../controllers/floors.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addFloor);
router.get("/", getFloors);
router.get("/:id", getFloorById);
router.put("/:id", updateFloor);
router.delete("/:id", deleteFloor);

module.exports = router;