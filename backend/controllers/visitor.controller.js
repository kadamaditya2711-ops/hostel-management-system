const pool = require("../db");

// =========================
// ADD VISITOR
// =========================
async function addVisitor(req, res) {
    try {
        const {
            full_name,
            mobile,
            relation
        } = req.body;

        if (!full_name || !mobile || !relation) {
            return res.status(400).json({
                message: "Full name, mobile and relation are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO visitors
             (full_name, mobile, relation)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                full_name,
                mobile,
                relation
            ]
        );

        res.status(201).json({
            message: "Visitor added successfully",
            visitor: result.rows[0]
        });

    } catch (error) {
        console.error("ADD VISITOR ERROR:", error);

        res.status(500).json({
            message: "Failed to add visitor"
        });
    }
}


// =========================
// GET ALL VISITORS
// =========================
async function getVisitors(req, res) {
    try {
        const result = await pool.query(
            `SELECT *
             FROM visitors
             ORDER BY visitor_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            visitors: result.rows
        });

    } catch (error) {
        console.error("GET VISITORS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch visitors"
        });
    }
}


module.exports = {
    addVisitor,
    getVisitors
};