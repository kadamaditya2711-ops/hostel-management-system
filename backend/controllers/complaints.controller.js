const pool = require("../db");

// =========================
// ADD COMPLAINT
// =========================
async function addComplaint(req, res) {
    try {
        const {
            student_id,
            category,
            subject,
            description,
            priority
        } = req.body;

        if (!student_id || !category || !subject || !description) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const result = await pool.query(
            `INSERT INTO complaints
            (
                student_id,
                category,
                subject,
                description,
                priority,
                status
            )
            VALUES ($1, $2, $3, $4, $5, 'PENDING')
            RETURNING *`,
            [
                student_id,
                category,
                subject,
                description,
                priority || "MEDIUM"
            ]
        );

        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint: result.rows[0]
        });

    } catch (error) {
        console.error("ADD COMPLAINT ERROR:", error);

        res.status(500).json({
            message: "Failed to submit complaint"
        });
    }
}


// =========================
// GET ALL COMPLAINTS
// =========================
async function getComplaints(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                c.complaint_id,
                c.student_id,
                s.full_name,
                c.category,
                c.subject,
                c.description,
                c.priority,
                c.status,
                c.assigned_to,
                c.created_at,
                c.resolved_at
             FROM complaints c
             JOIN students s
               ON c.student_id = s.student_id
             ORDER BY c.complaint_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            complaints: result.rows
        });

    } catch (error) {
        console.error("GET COMPLAINTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch complaints"
        });
    }
}


// =========================
// UPDATE COMPLAINT STATUS
// =========================
async function updateComplaintStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatus = [
            "PENDING",
            "ASSIGNED",
            "IN_PROGRESS",
            "RESOLVED",
            "REOPENED"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid complaint status"
            });
        }

        const resolvedAt =
            status === "RESOLVED"
                ? new Date()
                : null;

        const result = await pool.query(
            `UPDATE complaints
             SET status = $1,
                 resolved_at = $2
             WHERE complaint_id = $3
             RETURNING *`,
            [
                status,
                resolvedAt,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            message: "Complaint status updated successfully",
            complaint: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE COMPLAINT ERROR:", error);

        res.status(500).json({
            message: "Failed to update complaint"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addComplaint,
    getComplaints,
    updateComplaintStatus
};