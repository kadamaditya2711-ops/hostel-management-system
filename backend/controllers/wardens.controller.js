const pool = require("../db");

// =========================
// ADD WARDEN
// =========================
async function addWarden(req, res) {
    try {
        const {
            user_id,
            full_name,
            mobile,
            email,
            hostel_id
        } = req.body;

        if (!user_id || !full_name || !mobile || !hostel_id) {
            return res.status(400).json({
                message: "User ID, full name, mobile and hostel ID are required"
            });
        }

        // Check user and role
        const user = await pool.query(
            `SELECT user_id, username, role, is_active
             FROM users
             WHERE user_id = $1`,
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.rows[0].role !== "WARDEN") {
            return res.status(400).json({
                message: "Selected user is not a WARDEN"
            });
        }

        if (!user.rows[0].is_active) {
            return res.status(400).json({
                message: "Warden user is inactive"
            });
        }

        // Check hostel
        const hostel = await pool.query(
            `SELECT hostel_id, hostel_name
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
            `INSERT INTO wardens
            (
                user_id,
                full_name,
                mobile,
                email,
                hostel_id
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                user_id,
                full_name,
                mobile,
                email || null,
                hostel_id
            ]
        );

        res.status(201).json({
            message: "Warden added successfully",
            warden: result.rows[0]
        });

    } catch (error) {
        console.error("ADD WARDEN ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "User or email is already assigned to a warden"
            });
        }

        res.status(500).json({
            message: "Failed to add warden"
        });
    }
}


// =========================
// GET ALL WARDENS
// =========================
async function getWardens(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                w.warden_id,
                w.user_id,
                u.username,
                w.full_name,
                w.mobile,
                w.email,
                w.hostel_id,
                h.hostel_name,
                w.created_at
             FROM wardens w
             JOIN users u
               ON w.user_id = u.user_id
             JOIN hostels h
               ON w.hostel_id = h.hostel_id
             ORDER BY w.warden_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            wardens: result.rows
        });

    } catch (error) {
        console.error("GET WARDENS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch wardens"
        });
    }
}


// =========================
// GET WARDEN BY ID
// =========================
async function getWardenById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                w.warden_id,
                w.user_id,
                u.username,
                w.full_name,
                w.mobile,
                w.email,
                w.hostel_id,
                h.hostel_name,
                w.created_at
             FROM wardens w
             JOIN users u
               ON w.user_id = u.user_id
             JOIN hostels h
               ON w.hostel_id = h.hostel_id
             WHERE w.warden_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Warden not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("GET WARDEN ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch warden"
        });
    }
}


// =========================
// UPDATE WARDEN
// =========================
async function updateWarden(req, res) {
    try {
        const { id } = req.params;

        const {
            full_name,
            mobile,
            email,
            hostel_id
        } = req.body;

        if (!full_name || !mobile || !hostel_id) {
            return res.status(400).json({
                message: "Full name, mobile and hostel ID are required"
            });
        }

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
            `UPDATE wardens
             SET full_name = $1,
                 mobile = $2,
                 email = $3,
                 hostel_id = $4
             WHERE warden_id = $5
             RETURNING *`,
            [
                full_name,
                mobile,
                email || null,
                hostel_id,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Warden not found"
            });
        }

        res.status(200).json({
            message: "Warden updated successfully",
            warden: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE WARDEN ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email is already assigned to another warden"
            });
        }

        res.status(500).json({
            message: "Failed to update warden"
        });
    }
}


// =========================
// DELETE WARDEN
// =========================
async function deleteWarden(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM wardens
             WHERE warden_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Warden not found"
            });
        }

        res.status(200).json({
            message: "Warden deleted successfully",
            warden: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE WARDEN ERROR:", error);

        res.status(500).json({
            message: "Failed to delete warden"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addWarden,
    getWardens,
    getWardenById,
    updateWarden,
    deleteWarden
};