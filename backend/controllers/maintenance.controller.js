const pool = require("../db");

// =========================
// ADD MAINTENANCE REQUEST
// =========================
async function addMaintenanceRequest(req, res) {
    try {
        const {
            student_id,
            hostel_id,
            room_id,
            category,
            description,
            priority
        } = req.body;

        if (
            !student_id ||
            !hostel_id ||
            !room_id ||
            !category ||
            !description
        ) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const result = await pool.query(
            `INSERT INTO maintenance_requests
            (
                student_id,
                hostel_id,
                room_id,
                category,
                description,
                priority,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
            RETURNING *`,
            [
                student_id,
                hostel_id,
                room_id,
                category,
                description,
                priority || "MEDIUM"
            ]
        );

        res.status(201).json({
            message: "Maintenance request submitted successfully",
            request: result.rows[0]
        });

    } catch (error) {
        console.error("ADD MAINTENANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to submit maintenance request"
        });
    }
}


// =========================
// GET ALL REQUESTS
// =========================
async function getMaintenanceRequests(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                mr.request_id,
                mr.student_id,
                s.full_name,
                mr.hostel_id,
                h.hostel_name,
                mr.room_id,
                r.room_number,
                mr.category,
                mr.description,
                mr.priority,
                mr.assigned_to,
                mr.status,
                mr.created_at,
                mr.completed_at
             FROM maintenance_requests mr
             JOIN students s
               ON mr.student_id = s.student_id
             JOIN hostels h
               ON mr.hostel_id = h.hostel_id
             JOIN rooms r
               ON mr.room_id = r.room_id
             ORDER BY mr.request_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            requests: result.rows
        });

    } catch (error) {
        console.error("GET MAINTENANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch maintenance requests"
        });
    }
}


// =========================
// UPDATE STATUS
// =========================
async function updateMaintenanceStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatus = [
            "PENDING",
            "ASSIGNED",
            "IN_PROGRESS",
            "COMPLETED",
            "REOPENED"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid maintenance status"
            });
        }

        const completedAt =
            status === "COMPLETED"
                ? new Date()
                : null;

        const result = await pool.query(
            `UPDATE maintenance_requests
             SET status = $1,
                 completed_at = $2
             WHERE request_id = $3
             RETURNING *`,
            [
                status,
                completedAt,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Maintenance request not found"
            });
        }

        res.status(200).json({
            message: "Maintenance status updated successfully",
            request: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE MAINTENANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to update maintenance status"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addMaintenanceRequest,
    getMaintenanceRequests,
    updateMaintenanceStatus
};