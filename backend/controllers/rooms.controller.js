const pool = require("../db");

// =========================
// ADD ROOM
// =========================
async function addRoom(req, res) {
    try {
        const {
            floor_id,
            room_number,
            room_type,
            capacity,
            status
        } = req.body;

        if (
            !floor_id ||
            !room_number ||
            !room_type ||
            !capacity
        ) {
            return res.status(400).json({
                message: "Floor ID, room number, room type and capacity are required"
            });
        }

        // Check floor exists
        const floor = await pool.query(
            `SELECT floor_id
             FROM floors
             WHERE floor_id = $1`,
            [floor_id]
        );

        if (floor.rows.length === 0) {
            return res.status(404).json({
                message: "Floor not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO rooms
             (floor_id, room_number, room_type, capacity, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                floor_id,
                room_number,
                room_type,
                capacity,
                status || "AVAILABLE"
            ]
        );

        res.status(201).json({
            message: "Room added successfully",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("ADD ROOM ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Room number already exists on this floor"
            });
        }

        res.status(500).json({
            message: "Failed to add room"
        });
    }
}


// =========================
// GET ALL ROOMS
// =========================
async function getRooms(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                r.room_id,
                r.floor_id,
                f.floor_number,
                b.block_id,
                b.block_name,
                h.hostel_id,
                h.hostel_name,
                r.room_number,
                r.room_type,
                r.capacity,
                r.status
             FROM rooms r
             JOIN floors f
               ON r.floor_id = f.floor_id
             JOIN blocks b
               ON f.block_id = b.block_id
             JOIN hostels h
               ON b.hostel_id = h.hostel_id
             ORDER BY r.room_id ASC`
        );

        res.status(200).json({
            count: result.rows.length,
            rooms: result.rows
        });

    } catch (error) {
        console.error("GET ROOMS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch rooms"
        });
    }
}


// =========================
// GET ROOM BY ID
// =========================
async function getRoomById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                r.room_id,
                r.floor_id,
                f.floor_number,
                b.block_id,
                b.block_name,
                h.hostel_id,
                h.hostel_name,
                r.room_number,
                r.room_type,
                r.capacity,
                r.status
             FROM rooms r
             JOIN floors f
               ON r.floor_id = f.floor_id
             JOIN blocks b
               ON f.block_id = b.block_id
             JOIN hostels h
               ON b.hostel_id = h.hostel_id
             WHERE r.room_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("GET ROOM ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch room"
        });
    }
}


// =========================
// UPDATE ROOM
// =========================
async function updateRoom(req, res) {
    try {
        const { id } = req.params;

        const {
            floor_id,
            room_number,
            room_type,
            capacity,
            status
        } = req.body;

        if (
            !floor_id ||
            !room_number ||
            !room_type ||
            !capacity
        ) {
            return res.status(400).json({
                message: "Floor ID, room number, room type and capacity are required"
            });
        }

        const result = await pool.query(
            `UPDATE rooms
             SET floor_id = $1,
                 room_number = $2,
                 room_type = $3,
                 capacity = $4,
                 status = $5
             WHERE room_id = $6
             RETURNING *`,
            [
                floor_id,
                room_number,
                room_type,
                capacity,
                status || "AVAILABLE",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json({
            message: "Room updated successfully",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE ROOM ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Room number already exists on this floor"
            });
        }

        res.status(500).json({
            message: "Failed to update room"
        });
    }
}


// =========================
// DELETE ROOM
// =========================
async function deleteRoom(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM rooms
             WHERE room_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json({
            message: "Room deleted successfully",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE ROOM ERROR:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete room because related beds or allocations exist"
            });
        }

        res.status(500).json({
            message: "Failed to delete room"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
};