const pool = require("../db");

function getUserId(req) {
    return (
        req.user?.userId ??
        req.user?.user_id ??
        req.user?.id
    );
}


// =====================================================
// GET STUDENT NOTICES
// =====================================================

const getStudentNotices = async (req, res) => {
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
                n.notice_id,
                n.title,
                n.description,
                n.category,
                n.priority,
                n.target_type,
                n.published_at,
                n.expires_at,

                CASE
                    WHEN nr.notice_read_id IS NULL
                    THEN FALSE
                    ELSE TRUE
                END AS is_read

            FROM notices n

            INNER JOIN students s
                ON s.user_id = $1

            LEFT JOIN room_allocations ra
                ON ra.student_id = s.student_id
                AND ra.status = 'ACTIVE'

            LEFT JOIN beds bed
                ON ra.bed_id = bed.bed_id

            LEFT JOIN rooms r
                ON bed.room_id = r.room_id

            LEFT JOIN floors f
                ON r.floor_id = f.floor_id

            LEFT JOIN blocks b
                ON f.block_id = b.block_id

            LEFT JOIN notice_reads nr
                ON nr.notice_id = n.notice_id
                AND nr.student_id = s.student_id

            WHERE n.status = 'PUBLISHED'

            AND (
                n.published_at IS NULL
                OR n.published_at <= CURRENT_TIMESTAMP
            )

            AND (
                n.expires_at IS NULL
                OR n.expires_at >= CURRENT_TIMESTAMP
            )

            AND (
                n.target_type = 'ALL'

                OR (
                    n.target_type = 'BOYS'
                    AND s.gender = 'MALE'
                )

                OR (
                    n.target_type = 'GIRLS'
                    AND s.gender = 'FEMALE'
                )

                OR (
                    n.target_type = 'BLOCK'
                    AND n.target_block_id = b.block_id
                )
            )

            ORDER BY
                n.published_at DESC NULLS LAST,
                n.notice_id DESC
            `,
            [userId]
        );


        res.status(200).json({
            success: true,
            notices: result.rows
        });


    } catch (error) {

        console.error(
            "Get Student Notices Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load notices."
        });
    }
};


// =====================================================
// MARK NOTICE AS READ
// =====================================================

const markNoticeRead = async (req, res) => {
    try {

        const userId = getUserId(req);

        const noticeId =
            Number(req.params.id);


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token."
            });
        }


        if (!noticeId) {
            return res.status(400).json({
                success: false,
                message: "Invalid notice ID."
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


        await pool.query(
            `
            INSERT INTO notice_reads
            (
                notice_id,
                student_id
            )
            VALUES
            ($1, $2)

            ON CONFLICT
            (
                notice_id,
                student_id
            )
            DO NOTHING
            `,
            [
                noticeId,
                studentId
            ]
        );


        res.status(200).json({
            success: true,
            message: "Notice marked as read."
        });


    } catch (error) {

        console.error(
            "Mark Notice Read Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to mark notice as read."
        });
    }
};


// =====================================================
// GET STUDENT VISITORS
// =====================================================

const getStudentVisitors = async (req, res) => {
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
                vl.visitor_log_id,

                v.visitor_id,
                v.full_name,
                v.mobile,
                v.relation,

                vl.purpose,
                vl.check_in,
                vl.check_out,
                vl.status

            FROM visitor_logs vl

            INNER JOIN visitors v
                ON vl.visitor_id = v.visitor_id

            INNER JOIN students s
                ON vl.student_id = s.student_id

            WHERE s.user_id = $1

            ORDER BY
                vl.check_in DESC,
                vl.visitor_log_id DESC
            `,
            [userId]
        );


        res.status(200).json({
            success: true,
            visitors: result.rows
        });


    } catch (error) {

        console.error(
            "Get Student Visitors Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load visitor history."
        });
    }
};


module.exports = {
    getStudentNotices,
    markNoticeRead,
    getStudentVisitors
};