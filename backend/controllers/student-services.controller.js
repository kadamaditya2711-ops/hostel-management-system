const pool = require("../db");

function getUserId(req) {
    return (
        req.user?.userId ??
        req.user?.user_id ??
        req.user?.id
    );
}


// ======================================
// GET MY COMPLAINTS
// ======================================

const getMyComplaints = async (req, res) => {
    try {

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token."
            });
        }

        const result = await pool.query(
            `
            SELECT
                c.complaint_id,
                c.category,
                c.subject,
                c.description,
                c.priority,
                c.status,
                c.created_at,
                c.resolved_at

            FROM complaints c

            INNER JOIN students s
                ON c.student_id = s.student_id

            WHERE s.user_id = $1

            ORDER BY
                c.created_at DESC,
                c.complaint_id DESC
            `,
            [userId]
        );

        res.status(200).json({
            success: true,
            complaints: result.rows
        });

    } catch (error) {

        console.error(
            "Get Complaints Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load complaints."
        });
    }
};


// ======================================
// CREATE COMPLAINT
// ======================================

const createComplaint = async (req, res) => {
    try {

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token."
            });
        }

        const {
            category,
            subject,
            description,
            priority
        } = req.body;


        if (
            !category ||
            !subject ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Category, subject and description are required."
            });
        }


        const studentResult =
            await pool.query(
                `
                SELECT student_id
                FROM students
                WHERE user_id = $1
                `,
                [userId]
            );


        if (studentResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });

        }


        const studentId =
            studentResult.rows[0].student_id;


        const result =
            await pool.query(
                `
                INSERT INTO complaints
                (
                    student_id,
                    category,
                    subject,
                    description,
                    priority
                )
                VALUES
                ($1, $2, $3, $4, $5)

                RETURNING
                    complaint_id,
                    category,
                    subject,
                    description,
                    priority,
                    status,
                    created_at
                `,
                [
                    studentId,
                    category,
                    subject,
                    description,
                    priority || "MEDIUM"
                ]
            );


        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully.",
            complaint: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create Complaint Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create complaint."
        });
    }
};


// ======================================
// GET MY MAINTENANCE REQUESTS
// ======================================

const getMyMaintenance = async (req, res) => {
    try {

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token."
            });
        }


        const result = await pool.query(
            `
            SELECT
                m.request_id,
                m.category,
                m.description,
                m.priority,
                m.status,
                m.created_at,
                m.completed_at,

                h.hostel_name,
                r.room_number

            FROM maintenance_requests m

            INNER JOIN students s
                ON m.student_id = s.student_id

            LEFT JOIN hostels h
                ON m.hostel_id = h.hostel_id

            LEFT JOIN rooms r
                ON m.room_id = r.room_id

            WHERE s.user_id = $1

            ORDER BY
                m.created_at DESC,
                m.request_id DESC
            `,
            [userId]
        );


        res.status(200).json({
            success: true,
            requests: result.rows
        });


    } catch (error) {

        console.error(
            "Get Maintenance Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load maintenance requests."
        });
    }
};


// ======================================
// CREATE MAINTENANCE REQUEST
// ======================================

const createMaintenance = async (req, res) => {
    try {

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token."
            });
        }


        const {
            category,
            description,
            priority
        } = req.body;


        if (
            !category ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Category and description are required."
            });
        }


        const allocationResult =
            await pool.query(
                `
                SELECT
                    s.student_id,
                    h.hostel_id,
                    r.room_id

                FROM students s

                INNER JOIN room_allocations ra
                    ON s.student_id = ra.student_id
                    AND ra.status = 'ACTIVE'

                INNER JOIN beds bed
                    ON ra.bed_id = bed.bed_id

                INNER JOIN rooms r
                    ON bed.room_id = r.room_id

                INNER JOIN floors f
                    ON r.floor_id = f.floor_id

                INNER JOIN blocks b
                    ON f.block_id = b.block_id

                INNER JOIN hostels h
                    ON b.hostel_id = h.hostel_id

                WHERE s.user_id = $1

                LIMIT 1
                `,
                [userId]
            );


        if (allocationResult.rows.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Active hostel room allocation is required before creating a maintenance request."
            });

        }


        const allocation =
            allocationResult.rows[0];


        const result =
            await pool.query(
                `
                INSERT INTO maintenance_requests
                (
                    student_id,
                    hostel_id,
                    room_id,
                    category,
                    description,
                    priority
                )
                VALUES
                ($1, $2, $3, $4, $5, $6)

                RETURNING
                    request_id,
                    category,
                    description,
                    priority,
                    status,
                    created_at
                `,
                [
                    allocation.student_id,
                    allocation.hostel_id,
                    allocation.room_id,
                    category,
                    description,
                    priority || "MEDIUM"
                ]
            );


        res.status(201).json({
            success: true,
            message:
                "Maintenance request submitted successfully.",
            request: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create Maintenance Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create maintenance request."
        });
    }
};


module.exports = {
    getMyComplaints,
    createComplaint,
    getMyMaintenance,
    createMaintenance
};