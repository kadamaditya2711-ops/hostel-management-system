const express = require("express");

const {
    addWarden,
    getWardens,
    getWardenById,
    updateWarden,
    deleteWarden
} = require("../controllers/wardens.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addWarden);
router.get("/", getWardens);
router.get("/:id", getWardenById);
router.put("/:id", updateWarden);
router.delete("/:id", deleteWarden);

module.exports = router;