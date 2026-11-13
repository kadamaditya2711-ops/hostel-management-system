const pool = require("../db");

// =========================
// ADD BLOCK
// =========================
async function addBlock(req, res) {
    try {
        const { hostel_id, block_name, status } = req.body;

        if (!hostel_id || !block_name) {
            return res.status(400).json({
                message: "Hostel ID and block name are required"
            });
        }

        // Check hostel exists
        const hostel = await pool.query(
            `SELECT hostel_id
             FROM hostels
             WHERE hostel_id = $1`,
            [hostel_id]
        );

        if (hostel.rows.length === 0) {
            return res.status(404).json({
                message: "Hostel not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO blocks
             (hostel_id, block_name, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                hostel_id,
                block_name,
                status || "ACTIVE"
            ]
        );

        res.status(201).json({
            message: "Block added successfully",
            block: result.rows[0]
        });

    } catch (error) {
        console.error("ADD BLOCK ERROR:", error);

        // Duplicate block in same hostel
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Block already exists in this hostel"
            });
        }

        res.status(500).json({
            message: "Failed to add block"
        });
    }
}


// =========================
// GET ALL BLOCKS
// =========================
async function getBlocks(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                b.block_id,
                b.hostel_id,
                h.hostel_name,
                b.block_name,
                b.status
             FROM blocks b
             JOIN hostels h
               ON b.hostel_id = h.hostel_id
             ORDER BY b.block_id ASC`
        );

        res.status(200).json({
            count: result.rows.length,
            blocks: result.rows
        });

    } catch (error) {
        console.error("GET BLOCKS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch blocks"
        });
    }
}


// =========================
// GET BLOCK BY ID
// =========================
async function getBlockById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                b.block_id,
                b.hostel_id,
                h.hostel_name,
                b.block_name,
                b.status
             FROM blocks b
             JOIN hostels h
               ON b.hostel_id = h.hostel_id
             WHERE b.block_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Block not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("GET BLOCK ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch block"
        });
    }
}


// =========================
// UPDATE BLOCK
// =========================
async function updateBlock(req, res) {
    try {
        const { id } = req.params;
        const { hostel_id, block_name, status } = req.body;

        if (!hostel_id || !block_name) {
            return res.status(400).json({
                message: "Hostel ID and block name are required"
            });
        }

        const result = await pool.query(
            `UPDATE blocks
             SET hostel_id = $1,
                 block_name = $2,
                 status = $3
             WHERE block_id = $4
             RETURNING *`,
            [
                hostel_id,
                block_name,
                status || "ACTIVE",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Block not found"
            });
        }

        res.status(200).json({
            message: "Block updated successfully",
            block: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE BLOCK ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Block already exists in this hostel"
            });
        }

        res.status(500).json({
            message: "Failed to update block"
        });
    }
}


// =========================
// DELETE BLOCK
// =========================
async function deleteBlock(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM blocks
             WHERE block_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Block not found"
            });
        }

        res.status(200).json({
            message: "Block deleted successfully",
            block: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE BLOCK ERROR:", error);

        // Block may have floors/rooms connected
        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete block because related records exist"
            });
        }

        res.status(500).json({
            message: "Failed to delete block"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addBlock,
    getBlocks,
    getBlockById,
    updateBlock,
    deleteBlock
};