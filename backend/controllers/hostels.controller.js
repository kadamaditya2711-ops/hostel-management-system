const pool = require("../db");

// =========================
// ADD HOSTEL
// =========================
async function addHostel(req, res) {
    try {
        const { hostel_name, gender, address, status } = req.body;

        if (!hostel_name || !gender) {
            return res.status(400).json({
                message: "Hostel name and gender are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO hostels
            (hostel_name, gender, address, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                hostel_name,
                gender,
                address || null,
                status || "ACTIVE"
            ]
        );

        res.status(201).json({
            message: "Hostel added successfully",
            hostel: result.rows[0]
        });

    } catch (error) {
        console.error("ADD HOSTEL ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Hostel already exists"
            });
        }

        res.status(500).json({
            message: "Failed to add hostel"
        });
    }
}


// =========================
// GET ALL HOSTELS
// =========================
async function getHostels(req, res) {
    try {
        const result = await pool.query(
            `SELECT *
             FROM hostels
             ORDER BY hostel_id ASC`
        );

        res.status(200).json({
            count: result.rows.length,
            hostels: result.rows
        });

    } catch (error) {
        console.error("GET HOSTELS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch hostels"
        });
    }
}


// =========================
// GET HOSTEL BY ID
// =========================
async function getHostelById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM hostels
             WHERE hostel_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hostel not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("GET HOSTEL ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch hostel"
        });
    }
}


// =========================
// UPDATE HOSTEL
// =========================
async function updateHostel(req, res) {
    try {
        const { id } = req.params;
        const { hostel_name, gender, address, status } = req.body;

        if (!hostel_name || !gender) {
            return res.status(400).json({
                message: "Hostel name and gender are required"
            });
        }

        const result = await pool.query(
            `UPDATE hostels
             SET hostel_name = $1,
                 gender = $2,
                 address = $3,
                 status = $4
             WHERE hostel_id = $5
             RETURNING *`,
            [
                hostel_name,
                gender,
                address || null,
                status || "ACTIVE",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hostel not found"
            });
        }

        res.status(200).json({
            message: "Hostel updated successfully",
            hostel: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE HOSTEL ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Hostel name already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update hostel"
        });
    }
}


// =========================
// DELETE HOSTEL
// =========================
async function deleteHostel(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM hostels
             WHERE hostel_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hostel not found"
            });
        }

        res.status(200).json({
            message: "Hostel deleted successfully",
            hostel: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE HOSTEL ERROR:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete hostel because related records exist"
            });
        }

        res.status(500).json({
            message: "Failed to delete hostel"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addHostel,
    getHostels,
    getHostelById,
    updateHostel,
    deleteHostel
};