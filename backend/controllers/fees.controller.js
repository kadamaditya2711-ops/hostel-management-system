const pool = require("../db");

// =========================
// ASSIGN FEE TO STUDENT
// =========================
async function assignStudentFee(req, res) {
    try {
        const {
            student_id,
            fee_structure_id,
            payment_option
        } = req.body;

        if (!student_id || !fee_structure_id || !payment_option) {
            return res.status(400).json({
                message: "Student ID, fee structure ID and payment option are required"
            });
        }

        if (!["FULL", "INSTALLMENT"].includes(payment_option)) {
            return res.status(400).json({
                message: "Payment option must be FULL or INSTALLMENT"
            });
        }

        // Check student
        const student = await pool.query(
            `SELECT student_id, full_name, status
             FROM students
             WHERE student_id = $1`,
            [student_id]
        );

        if (student.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check fee structure
        const feeStructure = await pool.query(
            `SELECT fee_structure_id,
                    academic_year,
                    annual_fee,
                    installment_count,
                    is_active
             FROM fee_structures
             WHERE fee_structure_id = $1`,
            [fee_structure_id]
        );

        if (feeStructure.rows.length === 0) {
            return res.status(404).json({
                message: "Fee structure not found"
            });
        }

        if (!feeStructure.rows[0].is_active) {
            return res.status(400).json({
                message: "Fee structure is not active"
            });
        }

        const fee = feeStructure.rows[0];

        // Assign fee
        const result = await pool.query(
            `INSERT INTO student_fees
             (
                student_id,
                fee_structure_id,
                total_amount,
                paid_amount,
                payment_option,
                status
             )
             VALUES ($1, $2, $3, 0, $4, 'PENDING')
             RETURNING *`,
            [
                student_id,
                fee_structure_id,
                fee.annual_fee,
                payment_option
            ]
        );

        res.status(201).json({
            message: "Fee assigned successfully",
            student: student.rows[0],
            fee: result.rows[0]
        });

    } catch (error) {
        console.error("ASSIGN FEE ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Fee is already assigned to this student for this academic year"
            });
        }

        res.status(500).json({
            message: "Failed to assign fee"
        });
    }
}


// =========================
// GET ALL STUDENT FEES
// =========================
async function getStudentFees(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                sf.student_fee_id,
                sf.student_id,
                s.full_name,
                fs.academic_year,
                fs.annual_fee,
                sf.total_amount,
                sf.paid_amount,
                sf.pending_amount,
                sf.payment_option,
                sf.status,
                sf.created_at
             FROM student_fees sf
             JOIN students s
               ON sf.student_id = s.student_id
             JOIN fee_structures fs
               ON sf.fee_structure_id = fs.fee_structure_id
             ORDER BY sf.student_fee_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            fees: result.rows
        });

    } catch (error) {
        console.error("GET FEES ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch student fees"
        });
    }
}


// =========================
// GET FEE BY STUDENT ID
// =========================
async function getFeeByStudentId(req, res) {
    try {
        const { studentId } = req.params;

        const result = await pool.query(
            `SELECT
                sf.student_fee_id,
                sf.student_id,
                s.full_name,
                fs.academic_year,
                sf.total_amount,
                sf.paid_amount,
                sf.pending_amount,
                sf.payment_option,
                sf.status
             FROM student_fees sf
             JOIN students s
               ON sf.student_id = s.student_id
             JOIN fee_structures fs
               ON sf.fee_structure_id = fs.fee_structure_id
             WHERE sf.student_id = $1
             ORDER BY sf.student_fee_id DESC`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No fee record found for this student"
            });
        }

        res.status(200).json({
            fees: result.rows
        });

    } catch (error) {
        console.error("GET STUDENT FEE ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch student fee"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    assignStudentFee,
    getStudentFees,
    getFeeByStudentId
};