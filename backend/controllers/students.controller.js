const pool = require("../db");

// =========================
// ADD STUDENT
// =========================
async function addStudent(req, res) {
    try {
        const {
            full_name,
            gender,
            dob,
            mobile,
            email,
            address,
            guardian_name,
            guardian_contact,
            college_name,
            course,
            academic_year,
            admission_date,
            emergency_contact
        } = req.body;

        if (!full_name || !gender || !mobile || !admission_date) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const result = await pool.query(
            `INSERT INTO students
            (
                full_name,
                gender,
                dob,
                mobile,
                email,
                address,
                guardian_name,
                guardian_contact,
                college_name,
                course,
                academic_year,
                admission_date,
                emergency_contact
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING *`,
            [
                full_name,
                gender,
                dob || null,
                mobile,
                email || null,
                address || null,
                guardian_name || null,
                guardian_contact || null,
                college_name || null,
                course || null,
                academic_year || null,
                admission_date,
                emergency_contact || null
            ]
        );

        res.status(201).json({
            message: "Student added successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("ADD STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to add student"
        });
    }
}


// =========================
// GET ALL STUDENTS
// =========================
async function getStudents(req, res) {
    try {
        const result = await pool.query(
            `SELECT *
             FROM students
             ORDER BY student_id DESC`
        );

        res.status(200).json({
            count: result.rows.length,
            students: result.rows
        });
    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch students"
        });
    }
}


// =========================
// GET STUDENT BY ID
// =========================
async function getStudentById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM students
             WHERE student_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("GET STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch student"
        });
    }
}


// =========================
// UPDATE STUDENT
// =========================
async function updateStudent(req, res) {
    try {
        const { id } = req.params;

        const {
            full_name,
            gender,
            dob,
            mobile,
            email,
            address,
            guardian_name,
            guardian_contact,
            college_name,
            course,
            academic_year,
            admission_date,
            emergency_contact,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE students
             SET
                full_name = $1,
                gender = $2,
                dob = $3,
                mobile = $4,
                email = $5,
                address = $6,
                guardian_name = $7,
                guardian_contact = $8,
                college_name = $9,
                course = $10,
                academic_year = $11,
                admission_date = $12,
                emergency_contact = $13,
                status = $14
             WHERE student_id = $15
             RETURNING *`,
            [
                full_name,
                gender,
                dob || null,
                mobile,
                email || null,
                address || null,
                guardian_name || null,
                guardian_contact || null,
                college_name || null,
                course || null,
                academic_year || null,
                admission_date,
                emergency_contact || null,
                status || "ACTIVE",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("UPDATE STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to update student"
        });
    }
}


// =========================
// DELETE STUDENT
// =========================
async function deleteStudent(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM students
             WHERE student_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully",
            student: result.rows[0]
        });
    } catch (error) {
        console.error("DELETE STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to delete student"
        });
    }
}


// =========================
// SEARCH STUDENTS
// =========================
async function searchStudents(req, res) {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                message: "Search query is required"
            });
        }

        const searchValue = `%${q.trim()}%`;

        const result = await pool.query(
            `SELECT *
             FROM students
             WHERE full_name ILIKE $1
                OR mobile ILIKE $1
                OR email ILIKE $1
                OR college_name ILIKE $1
             ORDER BY student_id DESC`,
            [searchValue]
        );

        res.status(200).json({
            count: result.rows.length,
            students: result.rows
        });
    } catch (error) {
        console.error("SEARCH STUDENTS ERROR:", error);

        res.status(500).json({
            message: "Failed to search students"
        });
    }
}


// =========================
// EXPORTS
// =========================
module.exports = {
    addStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    searchStudents
};