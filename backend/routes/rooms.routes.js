const express = require("express");

const {
    addRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
} = require("../controllers/rooms.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addRoom);
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;