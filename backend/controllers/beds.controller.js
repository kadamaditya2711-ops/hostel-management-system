const pool = require("../db");

// =========================
// ADD BED
// =========================
async function addBed(req, res) {
    try {
        const { room_id, bed_number, status } = req.body;

        if (!room_id || bed_number === undefined) {
            return res.status(400).json({
                message: "Room ID and bed number are required"
            });
        }

        // Check room exists
        const room = await pool.query(
            `SELECT room_id
             FROM rooms
             WHERE room_id = $1`,
            [room_id]
        );

        if (room.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO beds
             (room_id, bed_number, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                room_id,
                bed_number,
                status || "AVAILABLE"
            ]
        );

        res.status(201).json({
            message: "Bed added successfully",
            bed: result.rows[0]
        });

    } catch (error) {
        console.error("ADD BED ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This bed number already exists in the room"
            });
        }

        res.status(500).json({
            message: "Failed to add bed"
        });
    }
}


// =========================
// GET ALL BEDS
// =========================
async function getBeds(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                b.bed_id,
                b.room_id,
                r.room_number,
                f.floor_id,
                f.floor_number,
                bl.block_id,
                bl.block_name,
                h.hostel_id,
                h.hostel_name,
                b.bed_number,
                b.status
             FROM beds b
             JOIN rooms r ON b.room_id = r.room_id
             JOIN floors f ON r.floor_id = f.floor_id
             JOIN blocks bl ON f.block_id = bl.block_id
             JOIN hostels h ON bl.hostel_id = h.hostel_id
             ORDER BY b.bed_id ASC`
        );

        res.status(200).json({
            count: result.rows.length,
            beds: result.rows
        });

    } catch (error) {
        console.error("GET BEDS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch beds"
        });
    }
}


// =========================
// GET BED BY ID
// =========================
async function getBedById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                b.bed_id,
                b.room_id,
                r.room_number,
                b.bed_number,
                b.status
             FROM beds b
             JOIN rooms r ON b.room_id = r.room_id
             WHERE b.bed_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bed not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("GET BED ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch bed"
        });
    }
}


// =========================
// UPDATE BED
// =========================
async function updateBed(req, res) {
    try {
        const { id } = req.params;
        const { room_id, bed_number, status } = req.body;

        if (!room_id || bed_number === undefined) {
            return res.status(400).json({
                message: "Room ID and bed number are required"
            });
        }

        const result = await pool.query(
            `UPDATE beds
             SET room_id = $1,
                 bed_number = $2,
                 status = $3
             WHERE bed_id = $4
             RETURNING *`,
            [
                room_id,
                bed_number,
                status || "AVAILABLE",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bed not found"
            });
        }

        res.status(200).json({
            message: "Bed updated successfully",
            bed: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE BED ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This bed number already exists in the room"
            });
        }

        res.status(500).json({
            message: "Failed to update bed"
        });
    }
}


// =========================
// DELETE BED
// =========================
async function deleteBed(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM beds
             WHERE bed_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bed not found"
            });
        }

        res.status(200).json({
            message: "Bed deleted successfully",
            bed: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE BED ERROR:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete bed because related allocation exists"
            });
        }

        res.status(500).json({
            message: "Failed to delete bed"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addBed,
    getBeds,
    getBedById,
    updateBed,
    deleteBed
};
