const pool = require("../db");

// =========================
// CHECK-IN VISITOR
// =========================
async function checkInVisitor(req, res) {
    try {
        const {
            visitor_id,
            student_id,
            purpose
        } = req.body;

        if (!visitor_id || !student_id || !purpose) {
            return res.status(400).json({
                message: "Visitor ID, student ID and purpose are required"
            });
        }

        // Check visitor
        const visitor = await pool.query(
            `SELECT visitor_id, full_name
             FROM visitors
             WHERE visitor_id = $1`,
            [visitor_id]
        );

        if (visitor.rows.length === 0) {
            return res.status(404).json({
                message: "Visitor not found"
            });
        }

        // Check student
        const student = await pool.query(
            `SELECT student_id, full_name
             FROM students
             WHERE student_id = $1`,
            [student_id]
        );

        if (student.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check if visitor is already inside
        const activeLog = await pool.query(
            `SELECT visitor_log_id
             FROM visitor_logs
             WHERE visitor_id = $1
               AND status = 'INSIDE'`,
            [visitor_id]
        );

        if (activeLog.rows.length > 0) {
            return res.status(409).json({
                message: "Visitor is already inside"
            });
        }

        const result = await pool.query(
            `INSERT INTO visitor_logs
            (
                visitor_id,
                student_id,
                purpose,
                check_in,
                approved_by,
                status
            )
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'INSIDE')
            RETURNING *`,
            [
                visitor_id,
                student_id,
                purpose,
                req.user.userId
            ]
        );

        res.status(201).json({
            message: "Visitor checked in successfully",
            log: result.rows[0]
        });

    } catch (error) {
        console.error("CHECK-IN VISITOR ERROR:", error);

        res.status(500).json({
            message: "Failed to check in visitor"
        });
    }
}


// =========================
// GET VISITOR LOGS
// =========================
async function getVisitorLogs(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                vl.visitor_log_id,
                vl.visitor_id,
                v.full_name AS visitor_name,
                v.mobile,
                v.relation,
                vl.student_id,
                s.full_name AS student_name,
                vl.purpose,
                vl.check_in,
                vl.check_out,
                vl.approved_by,
                vl.status
             FROM visitor_logs vl
             JOIN visitors v
               ON vl.visitor_id = v.visitor_id
             JOIN students s
               ON vl.student_id = s.student_id
             ORDER BY vl.visitor_log_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            logs: result.rows
        });

    } catch (error) {
        console.error("GET VISITOR LOGS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch visitor logs"
        });
    }
}


// =========================
// CHECK-OUT VISITOR
// =========================
async function checkOutVisitor(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE visitor_logs
             SET check_out = CURRENT_TIMESTAMP,
                 status = 'COMPLETED'
             WHERE visitor_log_id = $1
               AND status = 'INSIDE'
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Active visitor log not found"
            });
        }

        res.status(200).json({
            message: "Visitor checked out successfully",
            log: result.rows[0]
        });

    } catch (error) {
        console.error("CHECK-OUT VISITOR ERROR:", error);

        res.status(500).json({
            message: "Failed to check out visitor"
        });
    }
}


module.exports = {
    checkInVisitor,
    getVisitorLogs,
    checkOutVisitor
};
