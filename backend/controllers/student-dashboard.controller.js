const pool = require("../db");

const getStudentDashboard = async (req, res) => {
    try {

        // Support different JWT field names
        const userId =
            req.user?.userId ??
            req.user?.user_id ??
            req.user?.id;

        console.log("Student Dashboard User ID:", userId);
        console.log("Authenticated User:", req.user);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in access token."
            });
        }

        const result = await pool.query(
            `
            SELECT
                s.student_id,
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
                s.admission_date,
                s.status AS student_status,

                u.user_id,
                u.username,
                u.role,
                u.is_active,
                u.approval_status,

                h.hostel_id,
                h.hostel_name,
                h.gender AS hostel_gender,

                b.block_id,
                b.block_name,

                f.floor_id,
                f.floor_number,

                r.room_id,
                r.room_number,
                r.room_type,

                bed.bed_id,
                bed.bed_number,

                ra.allocation_id,
                ra.start_date,
                ra.end_date,
                ra.status AS allocation_status

            FROM students s

            INNER JOIN users u
                ON s.user_id = u.user_id

            LEFT JOIN room_allocations ra
                ON s.student_id = ra.student_id
                AND ra.status = 'ACTIVE'

            LEFT JOIN beds bed
                ON ra.bed_id = bed.bed_id

            LEFT JOIN rooms r
                ON bed.room_id = r.room_id

            LEFT JOIN floors f
                ON r.floor_id = f.floor_id

            LEFT JOIN blocks b
                ON f.block_id = b.block_id

            LEFT JOIN hostels h
                ON b.hostel_id = h.hostel_id

            WHERE s.user_id = $1

            LIMIT 1
            `,
            [userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });

        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Student Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load student dashboard."
        });
    }
};

module.exports = {
    getStudentDashboard
};