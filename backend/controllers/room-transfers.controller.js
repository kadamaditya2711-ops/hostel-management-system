const pool = require("../db");

// =========================
// TRANSFER STUDENT
// =========================
async function transferStudent(req, res) {
    const client = await pool.connect();

    try {
        const {
            student_id,
            new_bed_id,
            reason
        } = req.body;

        if (!student_id || !new_bed_id || !reason) {
            return res.status(400).json({
                message: "Student ID, new bed ID and reason are required"
            });
        }

        await client.query("BEGIN");

        // Check active allocation
        const activeAllocation = await client.query(
            `SELECT allocation_id, bed_id, student_id
             FROM room_allocations
             WHERE student_id = $1
               AND status = 'ACTIVE'
             FOR UPDATE`,
            [student_id]
        );

        if (activeAllocation.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Student does not have an active allocation"
            });
        }

        const allocation = activeAllocation.rows[0];
        const oldBedId = allocation.bed_id;

        if (Number(oldBedId) === Number(new_bed_id)) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "New bed must be different from old bed"
            });
        }

        // Check new bed
        const newBed = await client.query(
            `SELECT bed_id, room_id, status
             FROM beds
             WHERE bed_id = $1
             FOR UPDATE`,
            [new_bed_id]
        );

        if (newBed.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "New bed not found"
            });
        }

        if (newBed.rows[0].status !== "AVAILABLE") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "New bed is not available"
            });
        }

        // Save transfer record
        const transfer = await client.query(
            `INSERT INTO room_transfers
            (
                student_id,
                old_bed_id,
                new_bed_id,
                transfer_date,
                reason,
                approved_by
            )
            VALUES ($1, $2, $3, CURRENT_DATE, $4, $5)
            RETURNING *`,
            [
                student_id,
                oldBedId,
                new_bed_id,
                reason,
                req.user.userId
            ]
        );

        // Complete old allocation
        await client.query(
            `UPDATE room_allocations
             SET status = 'COMPLETED',
                 end_date = CURRENT_DATE
             WHERE allocation_id = $1`,
            [allocation.allocation_id]
        );

        // Make old bed available
        await client.query(
            `UPDATE beds
             SET status = 'AVAILABLE'
             WHERE bed_id = $1`,
            [oldBedId]
        );

        // Create new allocation
        const newAllocation = await client.query(
            `INSERT INTO room_allocations
            (
                student_id,
                bed_id,
                allocation_date,
                start_date,
                status
            )
            VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, 'ACTIVE')
            RETURNING *`,
            [
                student_id,
                new_bed_id
            ]
        );

        // Occupy new bed
        await client.query(
            `UPDATE beds
             SET status = 'OCCUPIED'
             WHERE bed_id = $1`,
            [new_bed_id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Student transferred successfully",
            transfer: transfer.rows[0],
            new_allocation: newAllocation.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("TRANSFER STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to transfer student"
        });

    } finally {
        client.release();
    }
}


// =========================
// GET ALL TRANSFERS
// =========================
async function getTransfers(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                rt.transfer_id,
                rt.student_id,
                s.full_name,
                rt.old_bed_id,
                rt.new_bed_id,
                rt.transfer_date,
                rt.reason,
                rt.approved_by,
                rt.created_at
             FROM room_transfers rt
             JOIN students s
               ON rt.student_id = s.student_id
             ORDER BY rt.transfer_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            transfers: result.rows
        });

    } catch (error) {
        console.error("GET TRANSFERS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch room transfers"
        });
    }
}


module.exports = {
    transferStudent,
    getTransfers
};