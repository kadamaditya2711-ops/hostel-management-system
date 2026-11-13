const pool = require("../db");

// =========================
// MAKE PAYMENT
// =========================
async function makePayment(req, res) {
    const client = await pool.connect();

    try {
        const {
            student_fee_id,
            installment_no,
            amount,
            payment_mode,
            transaction_ref,
            receipt_no
        } = req.body;

        if (
            !student_fee_id ||
            !installment_no ||
            !amount ||
            !payment_mode ||
            !receipt_no
        ) {
            return res.status(400).json({
                message: "Required payment fields are missing"
            });
        }

        if (!["CASH", "CHEQUE"].includes(payment_mode)) {
            return res.status(400).json({
                message: "Payment mode must be CASH or CHEQUE"
            });
        }

        await client.query("BEGIN");

        const feeResult = await client.query(
            `SELECT
                sf.student_fee_id,
                sf.student_id,
                sf.total_amount,
                sf.paid_amount,
                sf.pending_amount,
                sf.payment_option,
                sf.status,
                fs.installment_count
             FROM student_fees sf
             JOIN fee_structures fs
               ON sf.fee_structure_id = fs.fee_structure_id
             WHERE sf.student_fee_id = $1
             FOR UPDATE`,
            [student_fee_id]
        );

        if (feeResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Student fee record not found"
            });
        }

        const fee = feeResult.rows[0];

        if (
            installment_no < 1 ||
            installment_no > fee.installment_count
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Invalid installment number"
            });
        }

        if (Number(amount) <= 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Payment amount must be greater than 0"
            });
        }

        if (Number(amount) > Number(fee.pending_amount)) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Payment amount cannot exceed pending amount"
            });
        }

        const paymentResult = await client.query(
            `INSERT INTO payments
            (
                student_fee_id,
                installment_no,
                amount,
                payment_date,
                payment_mode,
                transaction_ref,
                receipt_no
            )
            VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6)
            RETURNING *`,
            [
                student_fee_id,
                installment_no,
                amount,
                payment_mode,
                transaction_ref || null,
                receipt_no
            ]
        );

        const newPaidAmount =
            Number(fee.paid_amount) + Number(amount);

        const newStatus =
            newPaidAmount >= Number(fee.total_amount)
                ? "PAID"
                : "PARTIAL";

        await client.query(
            `UPDATE student_fees
             SET paid_amount = $1,
                 status = $2
             WHERE student_fee_id = $3`,
            [
                newPaidAmount,
                newStatus,
                student_fee_id
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Payment recorded successfully",
            payment: paymentResult.rows[0],
            updated_fee: {
                total_amount: fee.total_amount,
                paid_amount: newPaidAmount,
                pending_amount:
                    Number(fee.total_amount) - newPaidAmount,
                status: newStatus
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("MAKE PAYMENT ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message:
                    "Receipt number or installment payment already exists"
            });
        }

        res.status(500).json({
            message: "Failed to record payment"
        });

    } finally {
        client.release();
    }
}


// =========================
// GET ALL PAYMENTS
// =========================
async function getPayments(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                p.payment_id,
                p.student_fee_id,
                sf.student_id,
                s.full_name,
                p.installment_no,
                p.amount,
                p.payment_date,
                p.payment_mode,
                p.transaction_ref,
                p.receipt_no
             FROM payments p
             JOIN student_fees sf
               ON p.student_fee_id = sf.student_fee_id
             JOIN students s
               ON sf.student_id = s.student_id
             ORDER BY p.payment_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            payments: result.rows
        });

    } catch (error) {
        console.error("GET PAYMENTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch payments"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    makePayment,
    getPayments
};