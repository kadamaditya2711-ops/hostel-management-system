require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const authenticateToken =
    require("./middleware/auth.middleware");

const authRoutes =
    require("./routes/auth.routes");

const studentRoutes =
    require("./routes/students.routes");

const hostelRoutes =
    require("./routes/hostels.routes");

const blockRoutes =
    require("./routes/blocks.routes");

const floorRoutes =
    require("./routes/floors.routes");

const roomRoutes =
    require("./routes/rooms.routes");

const bedRoutes =
    require("./routes/beds.routes");

const allocationRoutes =
    require("./routes/allocations.routes");

const feeRoutes =
    require("./routes/fees.routes");

const paymentRoutes =
    require("./routes/payments.routes");

const attendanceRoutes =
    require("./routes/attendance.routes");

const complaintRoutes =
    require("./routes/complaints.routes");

const maintenanceRoutes =
    require("./routes/maintenance.routes");

const visitorRoutes =
    require("./routes/visitor.routes");

const visitorLogRoutes =
    require("./routes/visitor-logs.routes");

const noticeRoutes =
    require("./routes/notices.routes");

const checkinCheckoutRoutes =
    require("./routes/checkin-checkout.routes");

const roomTransferRoutes =
    require("./routes/room-transfers.routes");

const wardenRoutes =
    require("./routes/wardens.routes");

const noticeReadRoutes =
    require("./routes/notice-reads.routes");

const studentAuthRoutes =
    require("./routes/student-auth.routes");

const studentRegistrationsRoutes =
    require("./routes/student-registrations.routes");

const studentDashboardRoutes =
    require("./routes/student-dashboard.routes");

const studentPortalRoutes =
    require("./routes/student-portal.routes");

const studentServicesRoutes =
    require("./routes/student-services.routes");

const studentExtraRoutes =
    require("./routes/student-extra.routes");

const studentStayRoutes =
    require("./routes/student-stay.routes");


const app = express();


// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());


// ===============================
// Main API Routes
// ===============================
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/visitor-logs", visitorLogRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/checkin-checkout", checkinCheckoutRoutes);
app.use("/api/room-transfers", roomTransferRoutes);
app.use("/api/wardens", wardenRoutes);
app.use("/api/notice-reads", noticeReadRoutes);


// ===============================
// Student Authentication
// ===============================
app.use(
    "/api/student-auth",
    studentAuthRoutes
);


// ===============================
// Student Registration / Approval
// ===============================
app.use(
    "/api/student-registrations",
    studentRegistrationsRoutes
);


// ===============================
// Student APIs
// Role protection is handled
// inside each student route file
// ===============================
app.use(
    "/api/student-dashboard",
    studentDashboardRoutes
);

app.use(
    "/api/student-portal",
    studentPortalRoutes
);

app.use(
    "/api/student-services",
    studentServicesRoutes
);

app.use(
    "/api/student-extra",
    studentExtraRoutes
);

app.use(
    "/api/student-stay",
    studentStayRoutes
);


// ===============================
// Home Route
// ===============================
app.get("/", (req, res) => {
    res.json({
        message:
            "Hostel Management System Backend is Running!"
    });
});


// ===============================
// PostgreSQL Test Route
// ===============================
app.get("/api/test-db", async (req, res) => {
    try {
        const result =
            await pool.query("SELECT NOW()");

        res.json({
            message:
                "PostgreSQL Connected Successfully!",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error(
            "DATABASE ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Database connection failed",
            error: error.message
        });
    }
});


// ===============================
// Protected Test Route
// ===============================
app.get(
    "/api/protected",
    authenticateToken,
    (req, res) => {

        res.json({
            message:
                "You have access to protected route!",
            user: req.user
        });
    }
);


// ===============================
// Start Server
// ===============================
const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});