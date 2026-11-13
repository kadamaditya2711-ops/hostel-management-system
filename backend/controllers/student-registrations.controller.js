const pool = require("../db");


// =====================================================
// CHECK ADMIN
// =====================================================

const checkAdmin = async (userId) => {

    const result = await pool.query(
        `SELECT role
         FROM users
         WHERE user_id = $1`,
        [userId]
    );

    if (
        result.rows.length === 0 ||
        result.rows[0].role !== "ADMIN"
    ) {
        return false;
    }

    return true;
};


// =====================================================
// GET PENDING STUDENT REGISTRATIONS
// =====================================================

const getPendingRegistrations = async (req, res) => {

    try {

        const isAdmin =
            await checkAdmin(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Admin access required."
            });
        }


        const result = await pool.query(
            `SELECT
                s.student_id,
                s.user_id,
                s.full_name,
                s.gender,
                s.dob,
                s.mobile,
                s.email,
                s.address,
                s.guardian_name,
                s.guardian_contact,
                s.college_name,
                s.course,
                s.academic_year,
                s.created_at,
                u.username,
                u.approval_status
             FROM students s
             INNER JOIN users u
                ON s.user_id = u.user_id
             WHERE u.role = 'STUDENT'
               AND u.approval_status = 'PENDING'
             ORDER BY s.created_at DESC`
        );


        res.status(200).json(result.rows);

    }
    catch (error) {

        console.error(
            "Get pending registrations error:",
            error
        );

        res.status(500).json({
            message: "Failed to load student registrations."
        });

    }
};


// =====================================================
// GET ONE STUDENT REGISTRATION
// =====================================================

const getRegistrationById = async (req, res) => {

    try {

        const isAdmin =
            await checkAdmin(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Admin access required."
            });
        }


        const studentId =
            req.params.id;


        const result = await pool.query(
            `SELECT
                s.*,
                u.username,
                u.approval_status,
                u.approval_reason
             FROM students s
             INNER JOIN users u
                ON s.user_id = u.user_id
             WHERE s.student_id = $1
               AND u.role = 'STUDENT'`,
            [studentId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Student registration not found."
            });

        }


        res.status(200).json(
            result.rows[0]
        );

    }
    catch (error) {

        console.error(
            "Get registration error:",
            error
        );

        res.status(500).json({
            message: "Failed to load registration."
        });

    }
};


// =====================================================
// APPROVE STUDENT
// =====================================================

const approveStudent = async (req, res) => {

    const client =
        await pool.connect();

    try {

        const isAdmin =
            await checkAdmin(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Admin access required."
            });
        }


        const studentId =
            req.params.id;


        await client.query("BEGIN");


        const studentResult =
            await client.query(
                `SELECT
                    user_id
                 FROM students
                 WHERE student_id = $1`,
                [studentId]
            );


        if (studentResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Student not found."
            });

        }


        const userId =
            studentResult.rows[0].user_id;


        const updateResult =
            await client.query(
                `UPDATE users
                 SET
                    approval_status = 'APPROVED',
                    is_active = TRUE,
                    approved_by = $1,
                    approved_at = CURRENT_TIMESTAMP,
                    approval_reason = NULL
                 WHERE user_id = $2
                   AND role = 'STUDENT'
                   AND approval_status = 'PENDING'
                 RETURNING user_id, username, approval_status, is_active`,
                [
                    req.user.userId,
                    userId
                ]
            );


        if (updateResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                message:
                    "Student is no longer pending."
            });

        }


        await client.query("COMMIT");


        res.status(200).json({

            message:
                "Student approved successfully.",

            student:
                updateResult.rows[0]

        });

    }
    catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Approve student error:",
            error
        );

        res.status(500).json({
            message: "Failed to approve student."
        });

    }
    finally {

        client.release();

    }
};


// =====================================================
// REJECT STUDENT
// =====================================================

const rejectStudent = async (req, res) => {

    const client =
        await pool.connect();

    try {

        const isAdmin =
            await checkAdmin(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Admin access required."
            });
        }


        const studentId =
            req.params.id;


        const reason =
            req.body.reason ||
            "Registration rejected by admin.";


        await client.query("BEGIN");


        const studentResult =
            await client.query(
                `SELECT
                    user_id
                 FROM students
                 WHERE student_id = $1`,
                [studentId]
            );


        if (studentResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Student not found."
            });

        }


        const userId =
            studentResult.rows[0].user_id;


        const updateResult =
            await client.query(
                `UPDATE users
                 SET
                    approval_status = 'REJECTED',
                    is_active = FALSE,
                    approved_by = $1,
                    approved_at = CURRENT_TIMESTAMP,
                    approval_reason = $2
                 WHERE user_id = $3
                   AND role = 'STUDENT'
                   AND approval_status = 'PENDING'
                 RETURNING user_id, username, approval_status, is_active, approval_reason`,
                [
                    req.user.userId,
                    reason,
                    userId
                ]
            );


        if (updateResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                message:
                    "Student is no longer pending."
            });

        }


        await client.query("COMMIT");


        res.status(200).json({

            message:
                "Student registration rejected.",

            student:
                updateResult.rows[0]

        });

    }
    catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Reject student error:",
            error
        );

        res.status(500).json({
            message: "Failed to reject student."
        });

    }
    finally {

        client.release();

    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getPendingRegistrations,
    getRegistrationById,
    approveStudent,
    rejectStudent
};