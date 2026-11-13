const pool = require("../db");

function getUserId(req) {
    return (
        req.user?.userId ??
        req.user?.user_id ??
        req.user?.id
    );
}


// ===============================
// GET STUDENT FEES
// ===============================

const getStudentFees = async (req, res) => {

    try {

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token."
            });
        }


        const feeResult = await pool.query(
            `
            SELECT
                sf.student_fee_id,
                sf.total_amount,
                sf.paid_amount,
                sf.pending_amount,
                sf.payment_option,
                sf.status,

                fs.academic_year,
                fs.annual_fee,
                fs.installment_count

            FROM students s

            INNER JOIN student_fees sf
                ON s.student_id = sf.student_id

            INNER JOIN fee_structures fs
                ON sf.fee_structure_id =
                   fs.fee_structure_id

            WHERE s.user_id = $1

            ORDER BY fs.academic_year DESC

            LIMIT 1
            `,
            [userId]
        );


        if (feeResult.rows.length === 0) {

            return res.status(200).json({
                success: true,
                fee: null,
                payments: []
            });

        }


        const fee =
            feeResult.rows[0];


        const paymentResult =
            await pool.query(
                `
                SELECT
                    payment_id,
                    installment_no,
                    amount,
                    payment_date,
                    payment_mode,
                    transaction_ref,
                    receipt_no

                FROM payments

                WHERE student_fee_id = $1

                ORDER BY payment_date DESC,
                         payment_id DESC
                `,
                [fee.student_fee_id]
            );


        res.status(200).json({
            success: true,
            fee: fee,
            payments: paymentResult.rows
        });


    } catch (error) {

        console.error(
            "Student Fees Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load fee details."
        });

    }
};


// ===============================
// GET STUDENT ATTENDANCE
// ===============================

const getStudentAttendance = async (req, res) => {

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
                a.attendance_id,
                a.attendance_date,
                a.status,
                a.remarks

            FROM attendance a

            INNER JOIN students s
                ON a.student_id = s.student_id

            WHERE s.user_id = $1

            ORDER BY
                a.attendance_date DESC,
                a.attendance_id DESC
            `,
            [userId]
        );


        const records = result.rows;


        const total =
            records.length;


        const present =
            records.filter(
                row => row.status === "PRESENT"
            ).length;


        const absent =
            records.filter(
                row => row.status === "ABSENT"
            ).length;


        const percentage =
            total === 0
                ? 0
                : ((present / total) * 100).toFixed(2);


        res.status(200).json({

            success: true,

            summary: {
                total,
                present,
                absent,
                percentage
            },

            records

        });


    } catch (error) {

        console.error(
            "Student Attendance Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load attendance."
        });

    }
};


module.exports = {
    getStudentFees,
    getStudentAttendance
};