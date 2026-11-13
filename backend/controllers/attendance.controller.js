const pool = require("../db");

// =========================
// MARK ATTENDANCE
// =========================
async function markAttendance(req, res) {
    try {
        const {
            student_id,
            attendance_date,
            status,
            remarks
        } = req.body;

        if (!student_id || !attendance_date || !status) {
            return res.status(400).json({
                message: "Student ID, date and status are required"
            });
        }

        if (!["PRESENT", "ABSENT"].includes(status)) {
            return res.status(400).json({
                message: "Status must be PRESENT or ABSENT"
            });
        }

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

        const result = await pool.query(
            `INSERT INTO attendance
             (
                student_id,
                attendance_date,
                status,
                marked_by,
                remarks
             )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                student_id,
                attendance_date,
                status,
                req.user.userId,
                remarks || null
            ]
        );

        res.status(201).json({
            message: "Attendance marked successfully",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error("MARK ATTENDANCE ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Attendance already marked for this student on this date"
            });
        }

        res.status(500).json({
            message: "Failed to mark attendance"
        });
    }
}


// =========================
// GET ALL ATTENDANCE
// =========================
async function getAttendance(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                a.attendance_id,
                a.student_id,
                s.full_name,
                a.attendance_date,
                a.status,
                a.remarks,
                a.marked_by
             FROM attendance a
             JOIN students s
               ON a.student_id = s.student_id
             ORDER BY a.attendance_date DESC,
                      a.attendance_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            attendance: result.rows
        });

    } catch (error) {
        console.error("GET ATTENDANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch attendance"
        });
    }
}


// =========================
// GET ATTENDANCE BY STUDENT
// =========================
async function getStudentAttendance(req, res) {
    try {
        const { studentId } = req.params;

        const result = await pool.query(
            `SELECT
                a.attendance_id,
                a.student_id,
                s.full_name,
                a.attendance_date,
                a.status,
                a.remarks
             FROM attendance a
             JOIN students s
               ON a.student_id = s.student_id
             WHERE a.student_id = $1
             ORDER BY a.attendance_date DESC`,
            [studentId]
        );

        res.status(200).json({
            count: result.rows.length,
            attendance: result.rows
        });

    } catch (error) {
        console.error("GET STUDENT ATTENDANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch student attendance"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    markAttendance,
    getAttendance,
    getStudentAttendance
};
