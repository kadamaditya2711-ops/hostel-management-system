const pool = require("../db");

// =========================
// ADD NOTICE
// =========================
async function addNotice(req, res) {
    try {
        const {
            title,
            description,
            category,
            priority,
            target_type,
            target_block_id,
            attachment_url,
            expires_at,
            status
        } = req.body;

        if (!title || !description || !priority || !target_type) {
            return res.status(400).json({
                message: "Title, description, priority and target type are required"
            });
        }

        const allowedPriority = [
            "NORMAL",
            "IMPORTANT",
            "URGENT"
        ];

        const allowedTargetType = [
            "ALL",
            "BOYS",
            "GIRLS",
            "BLOCK"
        ];

        const allowedStatus = [
            "DRAFT",
            "PUBLISHED",
            "EXPIRED"
        ];

        if (!allowedPriority.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        if (!allowedTargetType.includes(target_type)) {
            return res.status(400).json({
                message: "Invalid target type"
            });
        }

        const noticeStatus = status || "PUBLISHED";

        if (!allowedStatus.includes(noticeStatus)) {
            return res.status(400).json({
                message: "Invalid notice status"
            });
        }

        if (target_type === "BLOCK" && !target_block_id) {
            return res.status(400).json({
                message: "Target block ID is required for BLOCK notices"
            });
        }

        if (target_type !== "BLOCK" && target_block_id) {
            return res.status(400).json({
                message: "Target block ID should be empty for this target type"
            });
        }

        if (target_block_id) {
            const block = await pool.query(
                `SELECT block_id
                 FROM blocks
                 WHERE block_id = $1`,
                [target_block_id]
            );

            if (block.rows.length === 0) {
                return res.status(404).json({
                    message: "Target block not found"
                });
            }
        }

        const publishedAt =
            noticeStatus === "PUBLISHED"
                ? new Date()
                : null;

        const result = await pool.query(
            `INSERT INTO notices
            (
                title,
                description,
                category,
                priority,
                posted_by,
                target_type,
                target_block_id,
                attachment_url,
                published_at,
                expires_at,
                status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                title,
                description,
                category || null,
                priority,
                req.user.userId,
                target_type,
                target_block_id || null,
                attachment_url || null,
                publishedAt,
                expires_at || null,
                noticeStatus
            ]
        );

        res.status(201).json({
            message: "Notice added successfully",
            notice: result.rows[0]
        });

    } catch (error) {
        console.error("ADD NOTICE ERROR:", error);

        res.status(500).json({
            message: "Failed to add notice"
        });
    }
}


// =========================
// GET ALL NOTICES
// =========================
async function getNotices(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                n.notice_id,
                n.title,
                n.description,
                n.category,
                n.priority,
                n.posted_by,
                u.username AS posted_by_username,
                n.target_type,
                n.target_block_id,
                b.block_name,
                n.attachment_url,
                n.published_at,
                n.expires_at,
                n.status,
                n.created_at
             FROM notices n
             JOIN users u
               ON n.posted_by = u.user_id
             LEFT JOIN blocks b
               ON n.target_block_id = b.block_id
             ORDER BY n.notice_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            notices: result.rows
        });

    } catch (error) {
        console.error("GET NOTICES ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch notices"
        });
    }
}


// =========================
// UPDATE NOTICE STATUS
// =========================
async function updateNoticeStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatus = [
            "DRAFT",
            "PUBLISHED",
            "EXPIRED"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid notice status"
            });
        }

        const publishedAt =
            status === "PUBLISHED"
                ? new Date()
                : null;

        const result = await pool.query(
            `UPDATE notices
             SET status = $1,
                 published_at = $2
             WHERE notice_id = $3
             RETURNING *`,
            [
                status,
                publishedAt,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        res.status(200).json({
            message: "Notice status updated successfully",
            notice: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE NOTICE ERROR:", error);

        res.status(500).json({
            message: "Failed to update notice status"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addNotice,
    getNotices,
    updateNoticeStatus
};