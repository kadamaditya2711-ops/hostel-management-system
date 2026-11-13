const pool = require("../db");

// =========================
// ADD FLOOR
// =========================
async function addFloor(req, res) {
    try {
        const { block_id, floor_number } = req.body;

        if (!block_id || floor_number === undefined) {
            return res.status(400).json({
                message: "Block ID and floor number are required"
            });
        }

        // Check block exists
        const block = await pool.query(
            `SELECT block_id
             FROM blocks
             WHERE block_id = $1`,
            [block_id]
        );

        if (block.rows.length === 0) {
            return res.status(404).json({
                message: "Block not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO floors
             (block_id, floor_number)
             VALUES ($1, $2)
             RETURNING *`,
            [block_id, floor_number]
        );

        res.status(201).json({
            message: "Floor added successfully",
            floor: result.rows[0]
        });

    } catch (error) {
        console.error("ADD FLOOR ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This floor already exists in the block"
            });
        }

        res.status(500).json({
            message: "Failed to add floor"
        });
    }
}


// =========================
// GET ALL FLOORS
// =========================
async function getFloors(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                f.floor_id,
                f.block_id,
                b.block_name,
                b.hostel_id,
                h.hostel_name,
                f.floor_number
             FROM floors f
             JOIN blocks b
               ON f.block_id = b.block_id
             JOIN hostels h
               ON b.hostel_id = h.hostel_id
             ORDER BY f.floor_id ASC`
        );

        res.status(200).json({
            count: result.rows.length,
            floors: result.rows
        });

    } catch (error) {
        console.error("GET FLOORS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch floors"
        });
    }
}


// =========================
// GET FLOOR BY ID
// =========================
async function getFloorById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                f.floor_id,
                f.block_id,
                b.block_name,
                b.hostel_id,
                h.hostel_name,
                f.floor_number
             FROM floors f
             JOIN blocks b
               ON f.block_id = b.block_id
             JOIN hostels h
               ON b.hostel_id = h.hostel_id
             WHERE f.floor_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Floor not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("GET FLOOR ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch floor"
        });
    }
}


// =========================
// UPDATE FLOOR
// =========================
async function updateFloor(req, res) {
    try {
        const { id } = req.params;
        const { block_id, floor_number } = req.body;

        if (!block_id || floor_number === undefined) {
            return res.status(400).json({
                message: "Block ID and floor number are required"
            });
        }

        const result = await pool.query(
            `UPDATE floors
             SET block_id = $1,
                 floor_number = $2
             WHERE floor_id = $3
             RETURNING *`,
            [block_id, floor_number, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Floor not found"
            });
        }

        res.status(200).json({
            message: "Floor updated successfully",
            floor: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE FLOOR ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This floor already exists in the block"
            });
        }

        res.status(500).json({
            message: "Failed to update floor"
        });
    }
}


// =========================
// DELETE FLOOR
// =========================
async function deleteFloor(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM floors
             WHERE floor_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Floor not found"
            });
        }

        res.status(200).json({
            message: "Floor deleted successfully",
            floor: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE FLOOR ERROR:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete floor because related rooms exist"
            });
        }

        res.status(500).json({
            message: "Failed to delete floor"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addFloor,
    getFloors,
    getFloorById,
    updateFloor,
    deleteFloor
};