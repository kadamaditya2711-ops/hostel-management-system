const pool = require("../db");

function getUserId(req) {
    return (
        req.user?.userId ??
        req.user?.user_id ??
        req.user?.id
    );
}


// =====================================================
// GET CURRENT ROOM / STAY DETAILS
// =====================================================

const getCurrentStay = async (req, res) => {
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

                s.student_id,
                s.full_name,

                h.hostel_name,

                b.block_name,

                f.floor_number,

                r.room_number,
                r.room_type,

                bed.bed_number,

                ra.allocation_id,
                ra.allocation_date,
                ra.start_date,
                ra.end_date,
                ra.status AS allocation_status,

                CASE
                    WHEN ci.checkin_id IS NOT NULL
                    THEN TRUE
                    ELSE FALSE
                END AS checked_in

            FROM students s

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

            LEFT JOIN LATERAL
            (
                SELECT
                    checkin_id

                FROM checkins c

                WHERE c.student_id = s.student_id
                  AND c.allocation_id = ra.allocation_id

                ORDER BY
                    c.checkin_date DESC,
                    c.checkin_id DESC

                LIMIT 1

            ) ci
                ON TRUE

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


        res.status(200).json({
            success: true,
            stay: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Current Stay Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load current stay details."
        });

    }
};


// =====================================================
// GET CHECK-IN HISTORY
// =====================================================

const getCheckinHistory = async (req, res) => {
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

                c.checkin_id,
                c.checkin_date,
                c.academic_year,

                h.hostel_name,
                b.block_name,
                f.floor_number,
                r.room_number,
                bed.bed_number,

                u.username AS verified_by

            FROM checkins c

            INNER JOIN students s
                ON c.student_id = s.student_id

            INNER JOIN room_allocations ra
                ON c.allocation_id = ra.allocation_id

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

            LEFT JOIN users u
                ON c.verified_by = u.user_id

            WHERE s.user_id = $1

            ORDER BY
                c.checkin_date DESC,
                c.checkin_id DESC
            `,
            [userId]
        );


        res.status(200).json({
            success: true,
            checkins: result.rows
        });


    } catch (error) {

        console.error(
            "Check-in History Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load check-in history."
        });

    }
};


// =====================================================
// GET CHECK-OUT HISTORY
// =====================================================

const getCheckoutHistory = async (req, res) => {
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

                co.checkout_id,
                co.checkout_date,
                co.reason,
                co.fee_clearance,
                co.remarks,

                h.hostel_name,
                b.block_name,
                f.floor_number,
                r.room_number,
                bed.bed_number,

                u.username AS approved_by

            FROM checkouts co

            INNER JOIN students s
                ON co.student_id = s.student_id

            LEFT JOIN room_allocations ra
                ON co.allocation_id = ra.allocation_id

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

            LEFT JOIN users u
                ON co.approved_by = u.user_id

            WHERE s.user_id = $1

            ORDER BY
                co.checkout_date DESC,
                co.checkout_id DESC
            `,
            [userId]
        );


        res.status(200).json({
            success: true,
            checkouts: result.rows
        });


    } catch (error) {

        console.error(
            "Check-out History Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load check-out history."
        });

    }
};


// =====================================================
// GET ROOM TRANSFER HISTORY
// =====================================================

const getRoomTransferHistory = async (req, res) => {
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

                rt.transfer_id,
                rt.transfer_date,
                rt.reason,

                old_h.hostel_name AS old_hostel,
                old_b.block_name AS old_block,
                old_f.floor_number AS old_floor,
                old_r.room_number AS old_room,
                old_bed.bed_number AS old_bed,

                new_h.hostel_name AS new_hostel,
                new_b.block_name AS new_block,
                new_f.floor_number AS new_floor,
                new_r.room_number AS new_room,
                new_bed.bed_number AS new_bed,

                u.username AS approved_by

            FROM room_transfers rt

            INNER JOIN students s
                ON rt.student_id = s.student_id


            -- OLD BED

            INNER JOIN beds old_bed
                ON rt.old_bed_id = old_bed.bed_id

            INNER JOIN rooms old_r
                ON old_bed.room_id = old_r.room_id

            INNER JOIN floors old_f
                ON old_r.floor_id = old_f.floor_id

            INNER JOIN blocks old_b
                ON old_f.block_id = old_b.block_id

            INNER JOIN hostels old_h
                ON old_b.hostel_id = old_h.hostel_id


            -- NEW BED

            INNER JOIN beds new_bed
                ON rt.new_bed_id = new_bed.bed_id

            INNER JOIN rooms new_r
                ON new_bed.room_id = new_r.room_id

            INNER JOIN floors new_f
                ON new_r.floor_id = new_f.floor_id

            INNER JOIN blocks new_b
                ON new_f.block_id = new_b.block_id

            INNER JOIN hostels new_h
                ON new_b.hostel_id = new_h.hostel_id


            LEFT JOIN users u
                ON rt.approved_by = u.user_id


            WHERE s.user_id = $1

            ORDER BY
                rt.transfer_date DESC,
                rt.transfer_id DESC
            `,
            [userId]
        );


        res.status(200).json({
            success: true,
            transfers: result.rows
        });


    } catch (error) {

        console.error(
            "Room Transfer History Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load room transfer history."
        });

    }
};


module.exports = {

    getCurrentStay,

    getCheckinHistory,

    getCheckoutHistory,

    getRoomTransferHistory

};