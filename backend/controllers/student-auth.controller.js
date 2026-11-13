const bcrypt = require("bcrypt");
const pool = require("../db");


// =====================================================
// STUDENT REGISTRATION
// =====================================================

const registerStudent = async (req, res) => {
    const client = await pool.connect();

    try {

        const {
            full_name,
            username,
            password,
            confirm_password,
            mobile,
            email,
            gender,
            dob,
            address,
            guardian_name,
            guardian_contact,
            college_name,
            course,
            academic_year,
            emergency_contact
        } = req.body;


        // Basic validation

        if (
            !full_name ||
            !username ||
            !password ||
            !confirm_password ||
            !mobile ||
            !gender
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }


        if (password !== confirm_password) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }


        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }


        await client.query("BEGIN");


        // Check username

        const usernameCheck = await client.query(
            `SELECT user_id
             FROM users
             WHERE username = $1`,
            [username]
        );

        if (usernameCheck.rows.length > 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Username already exists."
            });
        }


        // Check email

        if (email) {

            const emailCheck = await client.query(
                `SELECT student_id
                 FROM students
                 WHERE email = $1`,
                [email]
            );

            if (emailCheck.rows.length > 0) {

                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: "Email already registered."
                });
            }
        }


        // Password hash

        const passwordHash = await bcrypt.hash(
            password,
            10
        );


        // Create user

        const userResult = await client.query(
            `INSERT INTO users
            (
                username,
                password_hash,
                role,
                is_active,
                approval_status
            )
            VALUES
            (
                $1,
                $2,
                'STUDENT',
                FALSE,
                'PENDING'
            )
            RETURNING user_id, username, role, approval_status`,
            [
                username,
                passwordHash
            ]
        );


        const userId =
            userResult.rows[0].user_id;


        // Create student profile

        const studentResult = await client.query(
            `INSERT INTO students
            (
                user_id,
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
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                CURRENT_DATE,
                $13,
                'ACTIVE'
            )
            RETURNING student_id`,
            [
                userId,
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
                emergency_contact || null
            ]
        );


        await client.query("COMMIT");


        res.status(201).json({

            message:
                "Registration successful. Please wait for admin approval.",

            student_id:
                studentResult.rows[0].student_id,

            username:
                username,

            status:
                "PENDING"

        });

    }
    catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Student registration error:",
            error
        );

        res.status(500).json({
            message: "Student registration failed."
        });

    }
    finally {

        client.release();

    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    registerStudent
};