const pool = require("../db");

// =========================
// MARK NOTICE AS READ
// =========================
async function markNoticeAsRead(req, res) {
    try {
        const { notice_id, student_id } = req.body;

        if (!notice_id || !student_id) {
            return res.status(400).json({
                message: "Notice ID and student ID are required"
            });
        }

        // Check notice
        const notice = await pool.query(
            `SELECT notice_id
             FROM notices
             WHERE notice_id = $1`,
            [notice_id]
        );

        if (notice.rows.length === 0) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        // Check student
        const student = await pool.query(
            `SELECT student_id
             FROM students
             WHERE student_id = $1`,
            [student_id]
        );

        if (student.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO notice_reads
            (
                notice_id,
                student_id,
                read_at
            )
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                notice_id,
                student_id
            ]
        );

        res.status(201).json({
            message: "Notice marked as read",
            notice_read: result.rows[0]
        });

    } catch (error) {
        console.error("MARK NOTICE READ ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Student has already read this notice"
            });
        }

        res.status(500).json({
            message: "Failed to mark notice as read"
        });
    }
}


// =========================
// GET NOTICE READS
// =========================
async function getNoticeReads(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                nr.notice_read_id,
                nr.notice_id,
                n.title,
                nr.student_id,
                s.full_name,
                nr.read_at
             FROM notice_reads nr
             JOIN notices n
               ON nr.notice_id = n.notice_id
             JOIN students s
               ON nr.student_id = s.student_id
             ORDER BY nr.notice_read_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            reads: result.rows
        });

    } catch (error) {
        console.error("GET NOTICE READS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch notice reads"
        });
    }
}


module.exports = {
    markNoticeAsRead,
    getNoticeReads
};