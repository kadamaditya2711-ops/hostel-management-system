const express = require("express");

const {
    addBlock,
    getBlocks,
    getBlockById,
    updateBlock,
    deleteBlock
} = require("../controllers/blocks.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", addBlock);
router.get("/", getBlocks);
router.get("/:id", getBlockById);
router.put("/:id", updateBlock);
router.delete("/:id", deleteBlock);

module.exports = router;