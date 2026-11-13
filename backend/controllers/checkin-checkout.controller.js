const pool = require("../db");

// =========================
// STUDENT CHECK-IN
// =========================
async function studentCheckIn(req, res) {
    const client = await pool.connect();

    try {
        const {
            student_id,
            allocation_id,
            academic_year
        } = req.body;

        if (!student_id || !allocation_id || !academic_year) {
            return res.status(400).json({
                message: "Student ID, allocation ID and academic year are required"
            });
        }

        await client.query("BEGIN");

        // Check allocation
        const allocation = await client.query(
            `SELECT allocation_id, student_id, status
             FROM room_allocations
             WHERE allocation_id = $1
               AND student_id = $2`,
            [allocation_id, student_id]
        );

        if (allocation.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Allocation not found for this student"
            });
        }

        if (allocation.rows[0].status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Student allocation is not active"
            });
        }

        // Check existing check-in
        const existingCheckIn = await client.query(
            `SELECT checkin_id
             FROM checkins
             WHERE student_id = $1
               AND academic_year = $2`,
            [student_id, academic_year]
        );

        if (existingCheckIn.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Student is already checked in for this academic year"
            });
        }

        const result = await client.query(
            `INSERT INTO checkins
            (
                student_id,
                allocation_id,
                checkin_date,
                academic_year,
                verified_by
            )
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)
            RETURNING *`,
            [
                student_id,
                allocation_id,
                academic_year,
                req.user.userId
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Student checked in successfully",
            checkin: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("CHECK-IN ERROR:", error);

        res.status(500).json({
            message: "Failed to check in student"
        });

    } finally {
        client.release();
    }
}


// =========================
// STUDENT CHECK-OUT
// =========================
async function studentCheckOut(req, res) {
    const client = await pool.connect();

    try {
        const {
            student_id,
            allocation_id,
            reason,
            fee_clearance,
            remarks
        } = req.body;

        if (
            !student_id ||
            !allocation_id ||
            !reason ||
            fee_clearance === undefined
        ) {
            return res.status(400).json({
                message: "Student ID, allocation ID, reason and fee clearance are required"
            });
        }

        await client.query("BEGIN");

        // Check allocation
        const allocation = await client.query(
            `SELECT allocation_id, student_id, bed_id, status
             FROM room_allocations
             WHERE allocation_id = $1
               AND student_id = $2`,
            [allocation_id, student_id]
        );

        if (allocation.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Allocation not found"
            });
        }

        if (allocation.rows[0].status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Student allocation is already completed"
            });
        }

        // Record checkout
        const result = await client.query(
            `INSERT INTO checkouts
            (
                student_id,
                allocation_id,
                checkout_date,
                reason,
                fee_clearance,
                approved_by,
                remarks
            )
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6)
            RETURNING *`,
            [
                student_id,
                allocation_id,
                reason,
                fee_clearance,
                req.user.userId,
                remarks || null
            ]
        );

        // Complete allocation
        await client.query(
            `UPDATE room_allocations
             SET status = 'COMPLETED',
                 end_date = CURRENT_DATE
             WHERE allocation_id = $1`,
            [allocation_id]
        );

        // Make bed available
        await client.query(
            `UPDATE beds
             SET status = 'AVAILABLE'
             WHERE bed_id = $1`,
            [allocation.rows[0].bed_id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Student checked out successfully",
            checkout: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("CHECK-OUT ERROR:", error);

        res.status(500).json({
            message: "Failed to check out student"
        });

    } finally {
        client.release();
    }
}


// =========================
// GET CHECK-INS
// =========================
async function getCheckIns(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                c.checkin_id,
                c.student_id,
                s.full_name,
                c.allocation_id,
                c.checkin_date,
                c.academic_year,
                c.verified_by
             FROM checkins c
             JOIN students s
               ON c.student_id = s.student_id
             ORDER BY c.checkin_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            checkins: result.rows
        });

    } catch (error) {
        console.error("GET CHECK-INS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch check-ins"
        });
    }
}


// =========================
// GET CHECK-OUTS
// =========================
async function getCheckOuts(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                co.checkout_id,
                co.student_id,
                s.full_name,
                co.allocation_id,
                co.checkout_date,
                co.reason,
                co.fee_clearance,
                co.approved_by,
                co.remarks
             FROM checkouts co
             JOIN students s
               ON co.student_id = s.student_id
             ORDER BY co.checkout_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            checkouts: result.rows
        });

    } catch (error) {
        console.error("GET CHECK-OUTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch check-outs"
        });
    }
}


module.exports = {
    studentCheckIn,
    studentCheckOut,
    getCheckIns,
    getCheckOuts
};