const pool = require("../db");

// =========================
// ALLOCATE BED TO STUDENT
// =========================
async function allocateBed(req, res) {
    const client = await pool.connect();

    try {
        const {
            student_id,
            bed_id,
            start_date,
            end_date
        } = req.body;

        if (!student_id || !bed_id || !start_date) {
            return res.status(400).json({
                message: "Student ID, bed ID and start date are required"
            });
        }

        await client.query("BEGIN");

        // Check student
        const student = await client.query(
            `SELECT student_id, full_name, status
             FROM students
             WHERE student_id = $1`,
            [student_id]
        );

        if (student.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (student.rows[0].status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Student is not active"
            });
        }

        // Check active allocation for student
        const existingAllocation = await client.query(
            `SELECT allocation_id
             FROM room_allocations
             WHERE student_id = $1
               AND status = 'ACTIVE'`,
            [student_id]
        );

        if (existingAllocation.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Student already has an active bed allocation"
            });
        }

        // Check bed
        const bed = await client.query(
            `SELECT bed_id, room_id, bed_number, status
             FROM beds
             WHERE bed_id = $1`,
            [bed_id]
        );

        if (bed.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Bed not found"
            });
        }

        if (bed.rows[0].status !== "AVAILABLE") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Bed is not available"
            });
        }

        // Create allocation
        const allocation = await client.query(
            `INSERT INTO room_allocations
             (
                student_id,
                bed_id,
                allocation_date,
                start_date,
                end_date,
                status
             )
             VALUES ($1, $2, CURRENT_DATE, $3, $4, 'ACTIVE')
             RETURNING *`,
            [
                student_id,
                bed_id,
                start_date,
                end_date || null
            ]
        );

        // Mark bed as occupied
        await client.query(
            `UPDATE beds
             SET status = 'OCCUPIED'
             WHERE bed_id = $1`,
            [bed_id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Bed allocated successfully",
            allocation: allocation.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ALLOCATE BED ERROR:", error);

        res.status(500).json({
            message: "Failed to allocate bed"
        });

    } finally {
        client.release();
    }
}


// =========================
// GET ALL ALLOCATIONS
// =========================
async function getAllocations(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                ra.allocation_id,
                ra.student_id,
                s.full_name,
                ra.bed_id,
                b.bed_number,
                r.room_id,
                r.room_number,
                f.floor_id,
                f.floor_number,
                bl.block_id,
                bl.block_name,
                h.hostel_id,
                h.hostel_name,
                ra.allocation_date,
                ra.start_date,
                ra.end_date,
                ra.status
             FROM room_allocations ra
             JOIN students s ON ra.student_id = s.student_id
             JOIN beds b ON ra.bed_id = b.bed_id
             JOIN rooms r ON b.room_id = r.room_id
             JOIN floors f ON r.floor_id = f.floor_id
             JOIN blocks bl ON f.block_id = bl.block_id
             JOIN hostels h ON bl.hostel_id = h.hostel_id
             ORDER BY ra.allocation_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            allocations: result.rows
        });

    } catch (error) {
        console.error("GET ALLOCATIONS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch allocations"
        });
    }
}


// =========================
// END ALLOCATION
// =========================
async function endAllocation(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const allocation = await client.query(
            `SELECT allocation_id, bed_id, status
             FROM room_allocations
             WHERE allocation_id = $1`,
            [id]
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
                message: "Allocation is already completed"
            });
        }

        await client.query(
            `UPDATE room_allocations
             SET status = 'COMPLETED',
                 end_date = COALESCE(end_date, CURRENT_DATE)
             WHERE allocation_id = $1`,
            [id]
        );

        await client.query(
            `UPDATE beds
             SET status = 'AVAILABLE'
             WHERE bed_id = $1`,
            [allocation.rows[0].bed_id]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Allocation ended successfully"
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("END ALLOCATION ERROR:", error);

        res.status(500).json({
            message: "Failed to end allocation"
        });

    } finally {
        client.release();
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    allocateBed,
    getAllocations,
    endAllocation
};